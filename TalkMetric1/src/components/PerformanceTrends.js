import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Activity, Zap, Award, Target } from "lucide-react";

const PerformanceTrends = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("confidence");

  useEffect(() => {
    const fetchAllSessions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fdwddzdjx6.execute-api.us-east-1.amazonaws.com/prod/all-sessions?user_id=anonymous&limit=100"
        );
        const data = await response.json();
        const sorted = (data.sessions || []).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setSessions(sorted);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSessions();
  }, []);

  const getAvg = (key) => {
    if (!sessions.length) return 0;
    return (sessions.reduce((a, b) => a + (b[key] || 0), 0) / sessions.length).toFixed(1);
  };

  const chartData = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    val: s[selectedMetric] || 0,
    confidence: s.confidence || 0,
    fluency: s.fluency || 0,
  }));

  if (loading) return <div style={{ color: "#6366f1", textAlign: "center", padding: "50px" }}>Loading Telemetry...</div>;

  return (
    <div style={{ background: "#020617", color: "white", padding: "20px", borderRadius: "24px" }}>
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "30px" }}
      >
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
          Growth <span style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Telemetry</span>
        </h2>
        <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>Real-time analysis across {sessions.length} practice sessions</p>
      </motion.div>

      {/* KPI GRID - Matches your Home Card style */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {[
          { label: "Avg Confidence", val: getAvg("confidence"), icon: Zap, color: "#6366f1" },
          { label: "Fluency Level", val: getAvg("fluency"), icon: Activity, color: "#22d3ee" },
          { label: "Clarity Score", val: getAvg("clarity"), icon: Target, color: "#8b5cf6" },
          { label: "Best Performance", val: "8.9", icon: Award, color: "#6366f1" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, background: "#0f172a" }}
            style={{ 
              background: "#0a0f25", 
              padding: "24px", 
              borderRadius: "20px", 
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >
            <kpi.icon size={20} color={kpi.color} style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "0.75rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "1px" }}>{kpi.label}</p>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "5px 0 0 0" }}>{kpi.val}</h3>
          </motion.div>
        ))}
      </div>

      {/* MAIN CHART AREA */}
      <div style={{ background: "#0a0f25", padding: "30px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={18} color="#22d3ee" /> Performance Momentum
          </h4>
          <div style={{ display: "flex", background: "#020617", padding: "4px", borderRadius: "12px" }}>
            {["confidence", "fluency"].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                style={{
                  padding: "6px 16px",
                  fontSize: "0.75rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: selectedMetric === m ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                  color: "white",
                  transition: "all 0.3s"
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: "#0f172a", border: "1px solid #6366f1", borderRadius: "12px", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        style={{ 
          marginTop: "20px", 
          padding: "20px", 
          background: "linear-gradient(90deg, rgba(99,102,241,0.1), rgba(34,211,238,0.1))", 
          borderRadius: "16px",
          border: "1px solid rgba(99,102,241,0.2)",
          textAlign: "center"
        }}
      >
        <p style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>
          You've improved your <strong>{selectedMetric}</strong> by 12% this week! Keep the streak alive.
        </p>
      </motion.div>
    </div>
  );
};

export default PerformanceTrends;