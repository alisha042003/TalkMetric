import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [sessionId, setSessionId] = useState("");
  const [userId] = useState("anonymous");
  const messagesEndRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);

  const currentAudioRef = useRef(null);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  /* ================= SESSION ================= */

  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    if (sessionId) checkBackendConnection();
  }, [sessionId]);

  const checkBackendConnection = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch('http://localhost:8001/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hello', user_id: userId, session_id: sessionId }),
      });
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        setMessages([{
          id: Date.now(),
          text: data.aiMessage || "Hi! I'm your TalkMetric conversation coach. What topic would you like to practice today?",
          sender: 'bot',
          timestamp: new Date(),
          evaluation: data.evaluation || null,
          fillerCount: data.fillerCount,
          wordCount: data.wordCount
        }]);
        if (data.audio) {
          console.log('Playing initial greeting audio');
          playAudio(data.audio);
        }
      } else {
        setConnectionStatus('connected');
        setMessages([{
          id: Date.now(),
          text: "Hi! I'm your TalkMetric coach. The server is connected but some AI services are having issues.",
          sender: 'bot',
          timestamp: new Date(),
          evaluation: null
        }]);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setMessages([{
        id: Date.now(),
        text: "Cannot connect to server. Please make sure your FastAPI server is running.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  /* ================= SEND ================= */

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8001/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          user_id: userId,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.aiMessage || "I received your message.",
        sender: "bot",
        evaluation: data.evaluation || null,
        fillerCount: data.fillerCount,
        wordCount: data.wordCount
      };

      setMessages((prev) => [...prev, botMessage]);

      if (data.audio) playAudio(data.audio);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Something went wrong.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= VOICE ================= */

  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Google Chrome for voice feature.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognitionRef.current = recognition;
    setLiveTranscript("");
    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setLiveTranscript(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
  };

  const stopVoiceRecognition = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);

    if (liveTranscript.trim()) {
      await sendMessage(liveTranscript);
    }

    setLiveTranscript("");
  };

  /* ================= AUDIO ================= */

  const playAudio = (base64Audio) => {
    if (currentAudioRef.current) currentAudioRef.current.pause();

    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    currentAudioRef.current = audio;
    audio.play().catch(() => {});
  };

  const clearChat = () => setMessages([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= UI ================= */

  const renderEvaluation = (evalData) => {
    if (!evalData) return null;
    const parameters = [
      { label: "Clarity", value: evalData.clarity },
      { label: "Fluency", value: evalData.fluency },
      { label: "Coherence", value: evalData.coherence },
      { label: "Grammar", value: evalData.grammar },
      { label: "Vocabulary", value: evalData.vocabulary },
      { label: "Pronunciation", value: evalData.pronunciation },
      { label: "Intonation", value: evalData.intonation },
      { label: "Pace", value: evalData.pace },
      { label: "Confidence", value: evalData.confidence },
    ];

    return (
      <div
        style={{
          maxWidth: "70%",
          padding: "12px",
          background: "#0f172a",
          borderRadius: "12px",
          border: "1px solid #3b82f6",
          color: "#f1f5f9",
          fontSize: "13px",
          marginTop: "4px",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#60a5fa' }}>
          📊 Feedback
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {parameters.map(p => (
            <div key={p.label}>
              <span style={{ color: '#94a3b8' }}>{p.label}:</span> {p.value}/10
            </div>
          ))}
        </div>
        {evalData.fillerWordsDetected && evalData.fillerWordsDetected.length > 0 && (
          <div style={{ marginBottom: '4px' }}>
            <strong>Filler words:</strong> {evalData.fillerWordsDetected.join(', ')} ({evalData.fillerCount})
          </div>
        )}
        {evalData.suggestions?.length > 0 && (
          <div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Suggestions:</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {evalData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {evalData.overallLesson && (
          <div style={{ marginTop: '8px', padding: '8px', background: '#1e40af', borderRadius: '4px' }}>
            <strong>💡 Lesson:</strong> {evalData.overallLesson}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617" }}>
      {/* NAVBAR */}
      <div
        style={{
          height: "70px",
          background: "rgba(15,23,42,0.9)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2
          style={{ margin: 0, color: "white", cursor: "pointer" }}
          onClick={() => navigate("/chat")}
        >
          TalkMetric
        </h2>

        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          <span
            style={{ cursor: "pointer", color: "white" }}
            onClick={() => navigate("/")}
          >
            Home
          </span>

          <span
            style={{ cursor: "pointer", color: "white" }}
            onClick={() => navigate("/profile")}
          >
            Profile
          </span>

          <div
            style={{
              fontSize: "13px",
              color:
                connectionStatus === "connected" ? "#22c55e" : "#ef4444",
            }}
          >
            {connectionStatus}
          </div>

          <button
            onClick={clearChat}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
            }}
          >
            New Chat
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            height: "80vh",
            background: "rgba(15,23,42,0.85)",
            borderRadius: "24px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ width: "100%" }}>
                {/* Message Bubble */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "14px 18px",
                      borderRadius: "20px",
                      background:
                        msg.sender === "user"
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : "#1e293b",
                      color: "white",
                    }}
                  >
                    {msg.text}
                    {msg.fillerCount !== undefined && (
                      <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.8 }}>
                        Fillers: {msg.fillerCount} | Words: {msg.wordCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Evaluation (only for bot messages) */}
                {msg.sender === "bot" && msg.evaluation && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      width: "100%",
                    }}
                  >
                    {renderEvaluation(msg.evaluation)}
                  </div>
                )}
              </div>
            ))}

            {isRecording && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    background: "#0f172a",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    fontSize: "14px",
                    color: "#22d3ee",
                  }}
                >
                  {liveTranscript || "Listening..."}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "20px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: "12px",
            }}
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px",
                color: "white",
                resize: "none",
              }}
            />

            <button
              onClick={() => {
                sendMessage(inputText);
                setInputText("");
              }}
              style={{
                padding: "12px 22px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Send
            </button>

            <button
              onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
              style={{
                padding: "12px 18px",
                background: isRecording
                  ? "#ef4444"
                  : "linear-gradient(135deg,#22d3ee,#6366f1)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {isRecording ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;