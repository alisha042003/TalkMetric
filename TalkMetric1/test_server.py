import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    print("❌ GROQ_API_KEY not found in .env file")
    exit(1)

print(f"✅ Using Groq key: {GROQ_API_KEY[:8]}...")

# Test user message (similar to the problematic one)
user_message = """I want to discuss about. To favorite. To favorite songs like I. I usually hear too many songs with different languages. Somehow, sometimes I won't know the actual meaning of what sound is actually going, but I like the tone, like the rhythm, like the walls, like the everything all about this on beach voice, everything. Some more something. Sometimes I feel like it's like a deep sound sound even though I don't understand the language. I like that song and."""

# System prompt (simplified version of your actual prompt)
system_prompt = """You are TalkMetric, an expert English communication coach. Your role is to help users improve their spoken and written English through natural conversation. You are friendly, encouraging, and insightful.

After each user response, provide **detailed, constructive feedback** on the following 10 dimensions:
1. Clarity, 2. Fluency, 3. Coherence, 4. Grammar, 5. Vocabulary, 6. Pronunciation, 7. Intonation, 8. Pace, 9. Filler words, 10. Confidence.

Return your answer **strictly as a JSON object** with these keys:
  - "reply": your full conversational response (string).
  - "evaluation": an object containing all the above scores (each 1-10), plus:
      - "fillerWordsDetected": list of filler words found.
      - "fillerCount": integer.
      - "suggestions": list of strings.
      - "overallLesson": a short string.

Do not add anything outside the JSON. Your entire response must be a valid JSON object."""

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_message}
]

# Test the most reliable model
model = "llama-3.3-70b-versatile"
url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}
data = {
    "model": model,
    "messages": messages,
    "max_tokens": 1500,
    "temperature": 0.5
}

print(f"\n🔍 Testing Groq model: {model}")
try:
    response = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        content = result['choices'][0]['message']['content']
        print("\n✅ Raw response content:")
        print(content)
        
        # Try to parse JSON
        try:
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = content[json_start:json_end]
                parsed = json.loads(json_str)
                print("\n✅ Successfully parsed JSON:")
                print(json.dumps(parsed, indent=2))
            else:
                print("\n❌ No JSON object found in response")
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON parse error: {e}")
    else:
        print(f"\n❌ Error response: {response.text}")
except Exception as e:
    print(f"\n❌ Request failed: {e}")