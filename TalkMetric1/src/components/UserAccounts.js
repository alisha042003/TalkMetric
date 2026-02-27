import React, { useState, useEffect } from 'react';
import { Users, Star, TrendingUp, Calendar, Award, Zap, Flame, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const UserAccounts = ({ userId = 'anonymous' }) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://fdwddzdjx6.execute-api.us-east-1.amazonaws.com/prod/user-stats?user_id=${userId}`
      );
      if (!response.ok) throw new Error('Telemetry sync failed');
      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ background: '#0a0f25', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <div className="animate-pulse">
        <div style={{ height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '50%', marginBottom: '20px' }}></div>
        <div style={{ height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginBottom: '20px' }}></div>
        <div style={{ height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}></div>
      </div>
    </div>
  );

  const stats = userStats || {
    user_id: userId,
    total_sessions: 0,
    avg_confidence: 0,
    avg_pronunciation: 0,
    total_filler_words: 0,
    total_words: 0,
    streak_days: 0,
    top_suggestions: []
  };

  const fillerFrequency = stats.total_words > 0 
    ? ((stats.total_filler_words / stats.total_words) * 100).toFixed(1) : 0;

  return (
    <div style={{ background: '#0a0f25', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '0.5px' }}>User <span style={{ color: '#22d3ee' }}>Analytics</span></h3>
      
      {/* PROFILE HEADER CARD */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.15))', 
        padding: '20px', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '24px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{stats.user_id}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.6, fontSize: '0.75rem', marginTop: '4px' }}>
              <Calendar size={12} /> <span>Active Pilot</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', background: '#020617', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee' }}>
            {stats.total_sessions} SESSIONS
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <MetricCard icon={<Star size={16} color="#6366f1" />} label="Avg Confidence" value={`${Number(stats.avg_confidence).toFixed(1)}/10`} borderColor="rgba(99,102,241,0.3)" />
        <MetricCard icon={<TrendingUp size={16} color="#22d3ee" />} label="Pronunciation" value={`${Number(stats.avg_pronunciation).toFixed(1)}/10`} borderColor="rgba(34,211,238,0.3)" />
      </div>

      {/* ROW METRICS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <MetricRow label="Total Words" value={stats.total_words?.toLocaleString()} subtext="Lifetime" accent="#6366f1" />
        <MetricRow label="Filler Density" value={`${fillerFrequency}%`} subtext="of speech" accent="#ef4444" />
        <MetricRow label="Current Streak" value={`${stats.streak_days} Days`} subtext="Daily Practice" accent="#22d3ee" icon={<Flame size={14} fill="#22d3ee" />} />
      </div>

      {/* TOP SUGGESTIONS TAGS */}
      {stats.top_suggestions?.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>Primary Focus Areas</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {stats.top_suggestions.slice(0, 3).map((s, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <button style={{ 
        width: '100%', padding: '14px', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '0.85rem',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
      }}>
        <Download size={16} /> Export Intelligence Report
      </button>
    </div>
  );
};

const MetricCard = ({ icon, label, value, borderColor }) => (
  <div style={{ background: '#020617', padding: '16px', borderRadius: '16px', border: `1px solid ${borderColor}` }}>
    <div style={{ marginBottom: '8px' }}>{icon}</div>
    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{label}</p>
    <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800 }}>{value}</p>
  </div>
);

const MetricRow = ({ label, value, subtext, accent, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div>
      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{value}</p>
        <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{subtext}</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
       {icon && icon}
       <div style={{ width: '40px', height: '4px', background: accent, borderRadius: '10px', opacity: 0.3 }}></div>
    </div>
  </div>
);

export default UserAccounts;