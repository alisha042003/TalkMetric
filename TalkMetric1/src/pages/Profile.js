import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PerformanceTrends from "../components/PerformanceTrends";
import SessionDetails from "../components/SessionDetails";
import UserAccounts from "../components/UserAccounts";
import HomeDashboard from "../components/HomeDashboard";
import ErrorBoundary from "../components/ErrorBoundary";
import { LayoutDashboard, TrendingUp, Search, UserCircle, LogOut, Cpu } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [sessionData, setSessionData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [trendsDays, setTrendsDays] = useState(7);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const sessionResponse = await fetch("https://fdwddzdjx6.execute-api.us-east-1.amazonaws.com/prod/latest-session?user_id=anonymous");
        const sData = await sessionResponse.json();
        setSessionData(sData);
        
        const trendsResponse = await fetch(`https://fdwddzdjx6.execute-api.us-east-1.amazonaws.com/prod/trends?user_id=anonymous&days=${trendsDays}`);
        const tData = await trendsResponse.json();
        setTrendsData(tData);
        
        const statsResponse = await fetch("https://fdwddzdjx6.execute-api.us-east-1.amazonaws.com/prod/user-stats?user_id=anonymous");
        const stData = await statsResponse.json();
        setUserStats(stData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [trendsDays]);

  const handleLogout = () => { window.location.href = "/login"; };

  return (
    <div style={styles.page}>
      {/* NAVIGATION HEADER */}
      <header style={styles.header}>
        <div style={styles.leftNav}>
          <div style={styles.logoContainer}>
             <Cpu size={24} color="#6366f1" />
             <h2 style={styles.logo}>TalkMetric</h2>
          </div>
          <nav style={styles.navLinks}>
            <Link to="/" style={styles.navItem}>Home</Link>
            <Link to="/chat" style={styles.navItem}>Chat</Link>
            <Link to="/profile" style={styles.navItemActive}>Profile</Link>
          </nav>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* CYBER HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroGlow}></div>
        <h1 style={styles.heroTitle}>Intelligence <span style={styles.accentText}>Console</span></h1>
        <p style={styles.heroSubtitle}>Synchronizing real-time telemetry from AWS Athena nodes.</p>
      </section>

      <div style={styles.mainContainer}>
        {/* SIDEBAR NAVIGATION */}
        <aside style={styles.sidebar}>
          <ul style={styles.sidebarNav}>
            <SidebarItem 
                icon={<LayoutDashboard size={18}/>} 
                label="Dashboard" 
                active={activeTab === "home"} 
                onClick={() => setActiveTab("home")} 
            />
            <SidebarItem 
                icon={<TrendingUp size={18}/>} 
                label="Trends" 
                active={activeTab === "trends"} 
                onClick={() => setActiveTab("trends")} 
            />
            <SidebarItem 
                icon={<Search size={18}/>} 
                label="Sessions" 
                active={activeTab === "session"} 
                onClick={() => setActiveTab("session")} 
            />
            <SidebarItem 
                icon={<UserCircle size={18}/>} 
                label="Account" 
                active={activeTab === "accounts"} 
                onClick={() => setActiveTab("accounts")} 
            />
          </ul>
        </aside>

        {/* CONTENT AREA */}
        <main style={styles.main}>
          {error && (
            <div style={styles.errorBanner}>
              📡 Connection Interrupted: {error}. Attempting background sync.
            </div>
          )}

          {loading ? (
            <Skeleton height={500} />
          ) : (
            <ErrorBoundary>
              {activeTab === "home" && (
                <HomeDashboard 
                  sessionData={sessionData}
                  userStats={userStats || { user_id: "anonymous" }}
                  trendsData={trendsData}
                />
              )}

              {activeTab === "trends" && (
                <PerformanceTrends 
                  data={trendsData} 
                  onDaysChange={(d) => setTrendsDays(d)}
                />
              )}

              {activeTab === "session" && (
                <SessionDetails sessionData={sessionData} />
              )}

              {activeTab === "accounts" && (
                <UserAccounts userData={userStats || { user_id: "anonymous" }} />
              )}
            </ErrorBoundary>
          )}
        </main>
      </div>

      <footer style={styles.footer}>
        <div style={styles.footerLine}></div>
        &copy; {new Date().getFullYear()} TALKMETRIC // NEURAL ENGINE V3.0
      </footer>
    </div>
  );
};

// Reusable Sidebar Item
const SidebarItem = ({ icon, label, active, onClick }) => (
  <li
    style={{
      ...styles.sidebarItem,
      ...(active ? styles.sidebarItemActive : {})
    }}
    onClick={onClick}
  >
    {icon} {label}
  </li>
);

// Dark Shimmer Skeleton
const Skeleton = ({ height }) => (
  <div style={{
    height: height || 200,
    background: "linear-gradient(90deg, #0a0f25 25%, #1e1b4b 50%, #0a0f25 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 2s infinite linear",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.05)"
  }} />
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    background: "rgba(2, 6, 23, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    zIndex: 100,
  },
  leftNav: { display: "flex", alignItems: "center", gap: "60px" },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { fontSize: "1.3rem", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: '-0.5px' },
  navLinks: { display: "flex", gap: "32px" },
  navItem: { color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "14px", fontWeight: "500" },
  navItemActive: { color: "#6366f1", textDecoration: "none", fontSize: "14px", fontWeight: "700" },
  hero: {
    padding: "80px 20px 40px",
    textAlign: "center",
    position: 'relative',
    overflow: 'hidden'
  },
  heroGlow: {
    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
    width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    zIndex: -1
  },
  heroTitle: { fontSize: "3rem", fontWeight: "900", marginBottom: "12px", letterSpacing: '-1px' },
  accentText: { background: 'linear-gradient(135deg,#6366f1,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" },
  mainContainer: {
    display: "flex", flex: 1, maxWidth: "1400px", margin: "20px auto", width: "100%", padding: "0 24px", gap: "32px",
  },
  sidebar: {
    width: "240px", flexShrink: 0, background: "#0a0f25", borderRadius: "24px", padding: "12px",
    border: "1px solid rgba(255,255,255,0.05)", height: "fit-content",
  },
  sidebarNav: { listStyle: "none", padding: 0, margin: 0 },
  sidebarItem: {
    padding: "16px 20px", fontSize: "15px", fontWeight: "600", color: "rgba(255,255,255,0.4)",
    cursor: "pointer", borderRadius: "16px", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px"
  },
  sidebarItemActive: { background: "rgba(99,102,241,0.1)", color: "#6366f1" },
  main: { flex: 1, minWidth: 0 },
  errorBanner: {
    background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "14px 24px", borderRadius: "16px",
    marginBottom: "24px", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  footer: {
    textAlign: "center", padding: "40px", fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: '2px',
  },
  footerLine: { width: '50px', height: '2px', background: '#6366f1', margin: '0 auto 15px', borderRadius: '2px' },
  logoutBtn: {
    background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "8px 18px",
    borderRadius: "12px", color: "#ef4444", cursor: "pointer", fontWeight: "700", display: 'flex', alignItems: 'center', gap: '8px'
  },
};

export default Profile;