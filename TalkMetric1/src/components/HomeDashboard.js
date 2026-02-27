import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Sparkles, MessageSquare, BarChart3, Zap, Activity, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const HomeDashboard = () => {
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`https://fdwddzdjx6.execute-api.us-east-1.amazonaws.com/prod/all-sessions?user_id=anonymous&limit=100`);
        const data = await response.json();
        setAllSessions(data.sessions || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const getAvg = (key) => {
    if (!allSessions.length) return 0;
    const total = allSessions.reduce((acc, s) => acc + Number(s[key] || 0), 0);
    return (total / allSessions.length).toFixed(1);
  };

  // Metric definitions aligned with TalkMetric branding
  const metrics = [
    { name: 'Confidence', key: 'confidence', color: '#6366f1', icon: Zap }, 
    { name: 'Fluency', key: 'fluency', color: '#22d3ee', icon: Activity },    
    { name: 'Pronunciation', key: 'pronunciation', color: '#8b5cf6', icon: Award }, 
    { name: 'Clarity', key: 'clarity', color: '#a855f7', icon: Target },    
  ];

  const chartData = metrics.map(m => ({ name: m.name, value: Number(getAvg(m.key)) }));
  const latestSession = allSessions[0] || {};

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6366f1', background: '#020617', minHeight: '100vh' }}>
      <Sparkles className="animate-pulse" size={40} style={{ margin: '0 auto 20px' }} />
      <p style={{ fontWeight: '600', letterSpacing: '1px' }}>SYNCING TELEMETRY...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', padding: '24px', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
            Session <span style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Insights</span>
          </h2>
          <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '4px' }}>Overview of your linguistic performance</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
          ID: <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>ANONYMOUS_USER</span>
        </div>
      </div>

      {/* ROW 1: KPI TILES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {metrics.map(m => (
          <div key={m.name} style={{ 
            backgroundColor: '#0a0f25', 
            padding: '24px', 
            borderRadius: '20px', 
            border: `1px solid rgba(255,255,255,0.05)`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'left'
          }}>
            <m.icon size={20} color={m.color} style={{ marginBottom: '12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{m.name}</p>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '8px 0 0 0' }}>{getAvg(m.key)}</h2>
          </div>
        ))}
      </div>

      {/* ROW 2: CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* BAR CHART */}
        <div style={{ backgroundColor: '#0a0f25', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={18} color="#6366f1" /> Skill Breakdown
          </h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                  contentStyle={{ background: '#0a0f25', border: '1px solid #6366f1', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={metrics[index].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div style={{ backgroundColor: '#0a0f25', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>Performance Balance</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={metrics[index].color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0a0f25', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: AI COACH FEEDBACK */}
      <div style={{ 
        background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(34,211,238,0.1))', 
        padding: '24px', 
        borderRadius: '24px', 
        border: '1px solid rgba(99,102,241,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Glow */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: '#6366f1', filter: 'blur(80px)', opacity: 0.2 }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#22d3ee', marginBottom: '12px' }}>
          <MessageSquare size={20} fill="#22d3ee" fillOpacity={0.1} />
          <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>AI COACH RESPONSE</h3>
        </div>
        
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6', margin: 0, maxWidth: '90%' }}>
          "{latestSession.ai_reply || 'Establish a session baseline to receive advanced communication feedback.'}"
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          {(latestSession.suggestions || []).slice(0, 2).map((s, i) => (
            <div key={i} style={{ 
              background: 'rgba(99,102,241,0.2)', 
              color: '#fff', 
              padding: '6px 14px', 
              borderRadius: '10px', 
              fontSize: '11px', 
              fontWeight: '600', 
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={12} color="#22d3ee" /> {s}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomeDashboard;