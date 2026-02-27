import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Mic, AlertCircle, MessageSquare, Hash, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock timeline logic updated for a more "data-driven" look
const createMockTimeline = (suggestions = [], fillerCount = 0) => {
  const timeline = [];
  for (let i = 0; i < 8; i++) {
    timeline.push({
      time: `0:${i * 10}`,
      intensity: (i === 3 || i === 6) ? suggestions.length + 2 : Math.floor(Math.random() * 2) + 1,
      fillers: i % 2 === 0 ? Math.floor(Math.random() * fillerCount) : 0
    });
  }
  return timeline;
};

const extractFillerWords = (message = '') => {
  const fillers = ['like', 'you know', 'um', 'uh', 'actually', 'basically', 'literally'];
  return fillers.filter(word => message.toLowerCase().includes(word));
};

const SessionDetails = ({ sessionData }) => {
  if (!sessionData || !sessionData.user_id) {
    return (
      <div style={{ backgroundColor: '#0a0f25', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Waiting for session telemetry...</p>
      </div>
    );
  }

  const {
    user_message = "No message",
    ai_reply = "No feedback",
    suggestions = [],
    filler_count = 0,
    word_count = 0
  } = sessionData;

  const timelineData = createMockTimeline(suggestions, filler_count);
  const fillerWordsFound = extractFillerWords(user_message);

  return (
    <div style={{ backgroundColor: '#020617', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ 
        background: '#0a0f25', 
        padding: '24px', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={20} color="#22d3ee" /> Session <span style={{ color: '#6366f1' }}>Deep-Dive</span>
        </h3>
        
        {/* METADATA GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Fillers', val: filler_count, icon: Zap, color: '#ef4444' },
            { label: 'Words', val: word_count, icon: Hash, color: '#22d3ee' },
            { label: 'Alerts', val: suggestions.length, icon: AlertCircle, color: '#f59e0b' }
          ].map((item, i) => (
            <div key={i} style={{ background: '#020617', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <item.icon size={14} color={item.color} />
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{item.val}</p>
            </div>
          ))}
        </div>

        {/* FLUENCY WAVEFORM CHART */}
        <div style={{ background: '#020617', padding: '20px', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6366f1', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Speech Intensity Timeline
          </p>
          <div style={{ height: '120px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <Tooltip 
                  contentStyle={{ background: '#0a0f25', border: '1px solid #6366f1', color: '#fff', borderRadius: '8px' }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="intensity" 
                  stroke="#22d3ee" 
                  strokeWidth={2} 
                  fill="url(#colorWave)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
            {fillerWordsFound.map((word, i) => (
              <span key={i} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.2)' }}>
                Filler: {word}
              </span>
            ))}
          </div>
        </div>

        {/* TRANSCRIPT ANALYSIS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Mic size={14} color="#6366f1" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>User Input</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', margin: 0 }}>
              "{user_message}"
            </p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(34,211,238,0.05)', borderRadius: '16px', borderLeft: '4px solid #22d3ee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MessageSquare size={14} color="#22d3ee" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase' }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              {ai_reply}
            </p>
          </div>
        </div>

        {/* SUGGESTIONS LIST */}
        {suggestions.length > 0 && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(245,158,11,0.05)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} /> Optimization Plan
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', lineHeight: '1.8' }}>
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;