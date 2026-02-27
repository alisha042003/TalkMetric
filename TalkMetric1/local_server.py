from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import requests
from dotenv import load_dotenv
import base64
import json
import boto3
from datetime import datetime, timezone, timedelta
import uuid
import logging
import re
from collections import defaultdict
from typing import List, Dict, Any, Optional
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Pydantic Models ====================
class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"
    session_id: str = None

class VoiceRequest(BaseModel):
    fileName: str
    fileBase64: str
    user_id: str = "anonymous"
    session_id: str = None

class TranscriptStatusRequest(BaseModel):
    job_name: str
    user_id: str = "anonymous"
    session_id: str = None

# ==================== AWS Clients ====================
aws_key = os.getenv('AWS_ACCESS_KEY_ID')
if aws_key:
    logger.info(f"✅ AWS_ACCESS_KEY_ID loaded: {aws_key[:5]}...")
else:
    logger.warning("⚠️ AWS_ACCESS_KEY_ID not set – S3/Polly/Athena will fail")

try:
    polly_client = boto3.client('polly', region_name='us-east-1')
    s3_client = boto3.client('s3', region_name='us-east-1')
    transcribe_client = boto3.client('transcribe', region_name='us-east-1')
    athena_client = boto3.client('athena', region_name='us-east-1')  # <-- ADDED
    logger.info("✅ AWS clients initialized")
except Exception as e:
    logger.error(f"❌ AWS client initialization error: {e}")
    polly_client = None
    s3_client = None
    transcribe_client = None
    athena_client = None

S3_BUCKET_APP = os.getenv('S3_BUCKET_APP', 'talkmetric-app-storage')
S3_BUCKET_CONVERSATIONS = os.getenv('S3_BUCKET_CONVERSATIONS', 'talkmetric-conversations')

# Athena settings (from your screenshot)
ATHENA_DATABASE = "talkmetric_db"
ATHENA_TABLE = "conversations_parsed"
ATHENA_OUTPUT_LOCATION = "s3://talkmetric-conversations/athena-results/"  # <-- CHANGE THIS to your actual S3 bucket for query results

# ==================== API Keys ====================
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if GROQ_API_KEY:
    logger.info(f"✅ Groq key loaded: {GROQ_API_KEY[:8]}...")
else:
    logger.warning("⚠️ GROQ_API_KEY not set")

# ==================== In-memory conversation history ====================
conversation_history = {}
fallback_count = {}

# ==================== JSON extraction helper ====================
def extract_json(text):
    """Extract JSON object from text, handling markdown and extra content."""
    text = re.sub(r'^```json\s*|\s*```$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^```\s*|\s*```$', '', text, flags=re.MULTILINE)
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return None

# ==================== Helper Functions ====================
def call_llm_with_evaluation(session_id, user_message):
    """Call Groq LLM for response and evaluation with integrated coaching."""
    if not GROQ_API_KEY:
        return "I'm here to help! What would you like to practice?", None

    system_prompt = """You are TalkMetric, an expert English communication coach. Your role is to help users improve their spoken and written English through natural conversation. You are friendly, encouraging, and insightful.

**Handling User Messages:**
- Users may write in informal language with grammatical errors, slang, or incomplete thoughts. Your job is to understand the intent and respond helpfully.
- If the message is very unclear, you can ask for clarification, but still attempt to provide some feedback on what you did understand.

**Core responsibilities:**
- Guide the conversation naturally. If the user greets you or hasn't stated a topic, ask what they'd like to practice.
- Once a topic is chosen, ask relevant open-ended questions to keep the conversation flowing.
- After each user response, provide **integrated coaching** – weave constructive feedback directly into your reply. For example:
  - "I noticed you used a few filler words like 'um' – try pausing instead."
  - "Your ideas are clear, but you could vary your vocabulary to sound more engaging."
  - "You're speaking a bit fast; slow down to improve clarity."
  - "There are a few grammar points to work on: ..."
- After providing the coaching, end with an encouraging question to continue.

**Evaluation dimensions (for the structured evaluation object):**
  1. **Clarity**: How clear and understandable the message is (1-10).
  2. **Fluency**: Smoothness of speech, absence of hesitations (1-10). Look for repeated words, fillers, etc.
  3. **Coherence**: Logical flow of ideas (1-10).
  4. **Grammar**: Correctness of sentence structure (1-10).
  5. **Vocabulary**: Range and appropriateness of word choice (1-10).
  6. **Pronunciation**: Based on the text, infer possible pronunciation errors (1-10).
  7. **Intonation**: Based on punctuation and sentence structure, comment on likely intonation (1-10).
  8. **Pace**: Estimate speaking pace from sentence length and complexity (1-10).
  9. **Filler words**: List any filler words like "um", "uh", "like", "you know", "actually", etc. Include a count.
  10. **Confidence**: Perceived certainty and assertiveness (1-10).

**CRITICAL: Your response must be a valid JSON object with two keys:**
  - "reply": your full conversational response (string), which includes integrated coaching.
  - "evaluation": an object containing all the above scores (each 1-10), plus:
      - "fillerWordsDetected": list of filler words found.
      - "fillerCount": integer.
      - "suggestions": list of strings (improvement tips).
      - "overallLesson": a short string with a communication lesson (optional but aim to include one every few turns).

If it's the first turn and you're just asking a question (no user response to evaluate), set "evaluation" to null.

Do not include any other text outside the JSON. Your entire response must be parsable by json.loads()."""

    if session_id not in conversation_history:
        conversation_history[session_id] = []
        fallback_count[session_id] = 0

    messages = [{"role": "system", "content": system_prompt}]
    for msg in conversation_history[session_id][-2:]:
        messages.append(msg)
    messages.append({"role": "user", "content": user_message})

    model = "llama-3.3-70b-versatile"
    try:
        logger.info(f"🔄 Calling Groq model: {model}")
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": model, "messages": messages, "max_tokens": 2000, "temperature": 0.3},
            timeout=45
        )
        if resp.status_code == 200:
            content = resp.json()['choices'][0]['message']['content'].strip()
            logger.info(f"Raw response: {content[:200]}...")
            json_str = extract_json(content)
            if not json_str:
                logger.warning("⚠️ No JSON found in response")
                return fallback_response(session_id), None
            try:
                data = json.loads(json_str)
                reply = data.get("reply")
                eval_data = data.get("evaluation")
                if reply:
                    fallback_count[session_id] = 0
                    conversation_history[session_id].append({"role": "user", "content": user_message})
                    conversation_history[session_id].append({"role": "assistant", "content": reply})
                    return reply, eval_data
                else:
                    logger.warning("⚠️ Groq response missing 'reply'")
            except json.JSONDecodeError as e:
                logger.error(f"⚠️ JSON parse error: {e}")
                logger.error(f"Extracted JSON: {json_str[:500]}")
        else:
            logger.error(f"❌ Groq model returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.error(f"❌ Groq error: {e}")

    return fallback_response(session_id), None

def fallback_response(session_id):
    """Return a varied fallback message based on consecutive failures."""
    fallback_count[session_id] = fallback_count.get(session_id, 0) + 1
    count = fallback_count[session_id]

    if count == 1:
        return "I didn't quite catch that. Could you please rephrase your message?"
    elif count == 2:
        return "I'm still having trouble understanding. Maybe try saying it in a simpler way?"
    else:
        return "Let's try a different approach. What topic would you like to talk about? (e.g., hobbies, work, a favorite movie)"

def synthesize_speech(text):
    """Convert text to speech using AWS Polly."""
    if not polly_client:
        return None
    try:
        response = polly_client.synthesize_speech(
            Engine='neural',
            LanguageCode='en-US',
            OutputFormat='mp3',
            Text=text,
            VoiceId='Joanna'
        )
        audio_stream = response['AudioStream'].read()
        return base64.b64encode(audio_stream).decode('utf-8')
    except Exception as e:
        logger.error(f"Polly error: {e}")
        return None

def store_conversation_in_s3(user_id, session_id, user_message, ai_reply, filler_count, word_count, evaluation):
    """Store conversation in S3 bucket for analytics."""
    if not s3_client:
        logger.warning("S3 client not available, skipping storage")
        return
    try:
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S%f')
        key = f"conversations/{user_id}/{session_id}/{timestamp}.json"
        data = {
            'user_id': user_id,
            'session_id': session_id,
            'timestamp': datetime.now(timezone.utc).isoformat() + 'Z',
            'user_message': user_message,
            'ai_reply': ai_reply,
            'filler_count': filler_count,
            'word_count': word_count,
            'evaluation': evaluation,
        }
        s3_client.put_object(
            Bucket=S3_BUCKET_CONVERSATIONS,
            Key=key,
            Body=json.dumps(data),
            ContentType='application/json'
        )
        logger.info(f"✅ Stored in S3: {key}")
    except Exception as e:
        logger.error(f"❌ S3 error: {e}")

# ==================== Athena Data Fetching ====================

def run_athena_query(query: str) -> List[Dict[str, Any]]:
    """Execute an Athena query and return results as a list of dictionaries."""
    if not athena_client:
        logger.error("Athena client not available")
        return []

    try:
        # Start query execution
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': ATHENA_DATABASE},
            ResultConfiguration={'OutputLocation': ATHENA_OUTPUT_LOCATION}
        )
        query_execution_id = response['QueryExecutionId']

        # Poll for completion
        while True:
            status = athena_client.get_query_execution(QueryExecutionId=query_execution_id)
            state = status['QueryExecution']['Status']['State']
            if state in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                break
            time.sleep(1)

        if state != 'SUCCEEDED':
            reason = status['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
            logger.error(f"Athena query failed: {reason}")
            return []

        # Fetch results
        results = []
        next_token = None
        while True:
            kwargs = {'QueryExecutionId': query_execution_id}
            if next_token:
                kwargs['NextToken'] = next_token
            response = athena_client.get_query_results(**kwargs)
            
            # Process rows
            rows = response['ResultSet']['Rows']
            if not results:
                # First row is header
                header = [col['VarCharValue'] for col in rows[0]['Data']]
                rows = rows[1:]
            else:
                header = [col['VarCharValue'] for col in response['ResultSet']['Rows'][0]['Data']]  # header again each page? Actually Athena returns header with each page. Better to store header once.
                # For simplicity, we'll assume header is consistent and skip first row of each page after first.
                rows = rows[1:] if 'NextToken' in kwargs else rows

            for row in rows:
                values = [col.get('VarCharValue', '') for col in row['Data']]
                results.append(dict(zip(header, values)))

            next_token = response.get('NextToken')
            if not next_token:
                break

        return results
    except Exception as e:
        logger.error(f"Athena query error: {e}")
        return []

def fetch_conversations_from_athena(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all conversations for a user from Athena table."""
    query = f"""
    SELECT user_id, session_id, timestamp, user_message, ai_reply, filler_count, word_count, evaluation
    FROM {ATHENA_TABLE}
    WHERE user_id = '{user_id}'
    ORDER BY timestamp ASC
    """
    rows = run_athena_query(query)
    
    conversations = []
    for row in rows:
        # Parse evaluation JSON if present
        eval_data = None
        if row.get('evaluation'):
            try:
                eval_data = json.loads(row['evaluation'])
            except:
                logger.warning(f"Failed to parse evaluation JSON: {row['evaluation'][:100]}")
        
        # Convert filler_count and word_count to int
        filler_count = int(row.get('filler_count', 0)) if row.get('filler_count') else 0
        word_count = int(row.get('word_count', 0)) if row.get('word_count') else 0

        conv = {
            'user_id': row.get('user_id'),
            'session_id': row.get('session_id'),
            'timestamp': row.get('timestamp'),
            'user_message': row.get('user_message', ''),
            'ai_reply': row.get('ai_reply', ''),
            'filler_count': filler_count,
            'word_count': word_count,
            'evaluation': eval_data
        }
        conversations.append(conv)
    
    return conversations

def aggregate_performance_data(user_id: str):
    """
    Aggregate conversations from Athena to produce:
        - trends: list of daily average clarity/fluency
        - userStats: overall averages, highest fluency, frequent fillers
        - currentSession: latest session details with timeline and latest evaluation
    """
    conversations = fetch_conversations_from_athena(user_id)
    if not conversations:
        # Return empty/default structure
        return {
            "trends": [],
            "currentSession": {
                "timeline": [],
                "user_message": "No sessions yet",
                "ai_reply": "Start a conversation to see analysis",
                "fillerDetails": "No mistakes detected",
                "fillerWords": [],
                "session_id": None,
                "latestEvaluation": {}
            },
            "userStats": {
                "user_id": user_id,
                "timestamp": "N/A",
                "avgConfidence": "0",
                "highestFluency": "0",
                "frequentFillers": "None"
            }
        }

    # Group by session_id
    sessions = defaultdict(list)
    for conv in conversations:
        session_id = conv.get('session_id')
        if session_id:
            sessions[session_id].append(conv)

    # For each session, sort by timestamp
    for sess_id, conv_list in sessions.items():
        conv_list.sort(key=lambda x: x.get('timestamp', ''))

    # Compute overall user stats across all conversations
    all_evaluations = []
    filler_word_counter = defaultdict(int)
    for conv in conversations:
        eval_data = conv.get('evaluation')
        if eval_data and isinstance(eval_data, dict):
            all_evaluations.append(eval_data)
            # Count filler words (list)
            filler_words = eval_data.get('fillerWordsDetected', [])
            for word in filler_words:
                filler_word_counter[word] += 1

    # Averages
    avg_conf = 0
    highest_flu = 0
    if all_evaluations:
        conf_scores = [e.get('confidence', 0) for e in all_evaluations if e.get('confidence') is not None]
        if conf_scores:
            avg_conf = sum(conf_scores) / len(conf_scores)
        flu_scores = [e.get('fluency', 0) for e in all_evaluations if e.get('fluency') is not None]
        if flu_scores:
            highest_flu = max(flu_scores)

    # Most frequent filler words
    top_fillers = sorted(filler_word_counter.items(), key=lambda x: x[1], reverse=True)[:3]
    frequent_fillers = ', '.join([f"{word}" for word, _ in top_fillers]) if top_fillers else "None"

    # Trends: daily aggregates
    trends_by_day = defaultdict(lambda: {'clarity': [], 'fluency': []})
    for conv in conversations:
        ts_str = conv.get('timestamp', '')
        try:
            dt = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
            day = dt.date().isoformat()
        except:
            continue
        eval_data = conv.get('evaluation')
        if eval_data:
            clarity = eval_data.get('clarity')
            fluency = eval_data.get('fluency')
            if clarity is not None:
                trends_by_day[day]['clarity'].append(clarity)
            if fluency is not None:
                trends_by_day[day]['fluency'].append(fluency)

    trends = []
    for day in sorted(trends_by_day.keys()):
        clarity_vals = trends_by_day[day]['clarity']
        fluency_vals = trends_by_day[day]['fluency']
        trends.append({
            'timestamp': day,
            'clarity': sum(clarity_vals)/len(clarity_vals) if clarity_vals else 0,
            'fluency': sum(fluency_vals)/len(fluency_vals) if fluency_vals else 0
        })

    # Latest session details
    if conversations:
        latest_conv = max(conversations, key=lambda x: x.get('timestamp', ''))
        latest_session_id = latest_conv.get('session_id')
        session_convs = sessions.get(latest_session_id, [])
        session_convs.sort(key=lambda x: x.get('timestamp', ''))

        # Build timeline from this session's exchanges
        timeline = []
        filler_words_in_session = set()
        for idx, conv in enumerate(session_convs):
            eval_data = conv.get('evaluation', {})
            filler_count = conv.get('filler_count', 0)
            timeline.append({'mistakes': filler_count})
            fw = eval_data.get('fillerWordsDetected', [])
            filler_words_in_session.update(fw)

        last_conv = session_convs[-1] if session_convs else {}
        user_message = last_conv.get('user_message', '')
        ai_reply = last_conv.get('ai_reply', '')
        filler_details = f"High frequency of filler words: {', '.join(filler_words_in_session)}" if filler_words_in_session else "No filler words detected"
        last_conv_eval = last_conv.get('evaluation') if session_convs else None

        current_session = {
            'timeline': timeline,
            'user_message': user_message,
            'ai_reply': ai_reply,
            'fillerDetails': filler_details,
            'fillerWords': list(filler_words_in_session),
            'session_id': latest_session_id,
            'latestEvaluation': last_conv_eval if last_conv_eval else {}
        }
    else:
        current_session = {
            'timeline': [],
            'user_message': '',
            'ai_reply': '',
            'fillerDetails': '',
            'fillerWords': [],
            'session_id': None,
            'latestEvaluation': {}
        }

    user_stats = {
        'user_id': user_id,
        'timestamp': latest_conv.get('timestamp', '') if conversations else 'N/A',
        'avgConfidence': round(avg_conf, 1),
        'highestFluency': round(highest_flu, 1),
        'frequentFillers': frequent_fillers
    }

    return {
        'trends': trends,
        'currentSession': current_session,
        'userStats': user_stats
    }

# ==================== API Endpoints ====================

@app.post("/api")
async def chat_endpoint(request: ChatRequest):
    """Handle text chat messages."""
    user_message = request.message
    user_id = request.user_id
    session_id = request.session_id or str(uuid.uuid4())

    logger.info(f"📝 [{user_id}:{session_id}] {user_message}")

    filler_words = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'well', 'so', 'right', 'okay']
    words = user_message.lower().split()
    filler_count = sum(1 for w in words if w in filler_words)
    word_count = len(words)

    ai_reply, evaluation = call_llm_with_evaluation(session_id, user_message)
    audio_base64 = synthesize_speech(ai_reply) if polly_client else None

    if evaluation:
        store_conversation_in_s3(user_id, session_id, user_message, ai_reply, filler_count, word_count, evaluation)

    return {
        "aiMessage": ai_reply,
        "audio": audio_base64,
        "fillerCount": filler_count,
        "wordCount": word_count,
        "evaluation": evaluation
    }

@app.post("/api/voice")
async def voice_endpoint(
    file: UploadFile = File(...),
    user_id: str = Form("anonymous"),
    session_id: str = Form(None)
):
    logger.info(f"📝 Received voice file: {file.filename}")
    session_id = session_id or str(uuid.uuid4())
    try:
        audio_bytes = await file.read()
        if len(audio_bytes) < 100:
            raise HTTPException(status_code=400, detail="File too small")
        if s3_client:
            unique_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.webm"
            key = f"audio_uploads/{user_id}/{session_id}/{unique_name}"
            s3_client.put_object(
                Bucket=S3_BUCKET_APP,
                Key=key,
                Body=audio_bytes,
                ContentType='audio/webm'
            )
            return {"message": "Voice uploaded", "job_name": None}
        else:
            return {"message": "Voice uploaded (dev mode)", "job_name": None}
    except Exception as e:
        logger.error(f"❌ Voice upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcript_status")
async def transcript_status(request: TranscriptStatusRequest):
    return {"status": "processing"}

@app.get("/api/performance/{user_id}")
async def get_performance_data(user_id: str):
    """Return aggregated dashboard data for a given user using Athena."""
    data = aggregate_performance_data(user_id)
    return data

@app.get("/health")
async def health_check():
    return {"status": "healthy", "groq_configured": GROQ_API_KEY is not None}

@app.get("/")
async def home():
    return {"status": "online", "message": "TalkMetric API"}

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 TalkMetric Local Server Starting...")
    print("="*50)
    print(f"📡 Text endpoint: http://localhost:8001/api")
    print(f"🎤 Voice endpoint: http://localhost:8001/api/voice")
    print(f"📊 Performance dashboard endpoint (Athena): http://localhost:8001/api/performance/anonymous")
    print(f"🔍 Health check: http://localhost:8001/health")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8001)