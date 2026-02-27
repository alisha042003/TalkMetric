import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Cpu, Globe, Zap, Shield, Heart } from 'lucide-react';

const About = () => {
  const location = useLocation();

  return (
    <div style={styles.page}>
      {/* ===== NAVBAR ===== */}
      <nav style={styles.navbar}>
        <div style={styles.logoContainer}>
          <Cpu size={24} color="#6366f1" />
          <div style={styles.logo}>TalkMetric</div>
        </div>
        <div style={styles.navLinks}>
          {["Home", "Chat", "Profile", "About"].map((item) => {
            const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
            const isActive = location.pathname === path;
            return (
              <Link
                key={item}
                to={path}
                style={{
                  ...styles.navLink,
                  ...(isActive && styles.active),
                }}
              >
                {item}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ===== HERO DECORATION ===== */}
      <div style={styles.heroGlow}></div>

      {/* ===== ABOUT CONTENT ===== */}
      <section style={styles.container}>
        <div style={styles.headerSection}>
          <h2 style={styles.heading}>
            Neural <span style={styles.accentText}>Mission</span>
          </h2>
          <div style={styles.statusBadge}>SYSTEM VERSION 3.0</div>
        </div>

        <div style={styles.grid}>
          <div style={styles.contentBlock}>
            <div style={styles.iconHeading}>
              <Zap size={20} color="#22d3ee" />
              <h3 style={styles.subHeading}>The Purpose</h3>
            </div>
            <p style={styles.paragraph}>
              <strong>TalkMetric</strong> is an intelligence-driven environment designed to bridge the gap between 
              technical knowledge and verbal execution. We leverage AI-powered telemetry to analyze 
              fluency, grammar, and delivery in real-time.
            </p>
          </div>

          <div style={styles.contentBlock}>
            <div style={styles.iconHeading}>
              <Globe size={20} color="#6366f1" />
              <h3 style={styles.subHeading}>The Vision</h3>
            </div>
            <p style={styles.paragraph}>
              Our platform creates a zero-pressure sandbox for professional communication. 
              Whether you're calibrating for a high-stakes interview or refining your everyday 
              influence, TalkMetric tracks every filler word and pause to ensure absolute clarity.
            </p>
          </div>
        </div>

        {/* ===== CREATOR BOX ===== */}
        <div style={styles.creatorBox}>
          <div style={styles.creatorHeader}>
            <Shield size={18} color="#8b5cf6" />
            <h3 style={styles.creatorSubHeading}>Core Architects</h3>
          </div>
          <p style={styles.paragraphCenter}>
            Developed with <Heart size={14} fill="#ef4444" color="#ef4444" style={{margin: '0 4px'}} /> for the future of communication by:
          </p>
          <div style={styles.architectList}>
            <span style={styles.nameTag}>Alisha Shaikh</span>
            <span style={styles.nameTag}>Sakshi Magham</span>
            <span style={styles.nameTag}>Arulselvam Jegan</span>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        TALKMETRIC // POWERED BY AWS ATHENA & NEURAL SYNCHRONIZATION
      </footer>
    </div>
  );
};

/* =========================
   STYLES (TALKMETRIC DARK)
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  navbar: {
    height: "70px",
    background: "rgba(2, 6, 23, 0.8)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoContainer: { display: "flex", alignItems: "center", gap: "10px" },
  logo: {
    fontSize: "1.3rem",
    fontWeight: "900",
    letterSpacing: "-0.5px",
  },
  navLinks: { display: "flex", gap: "32px" },
  navLink: {
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "14px",
    transition: "color 0.3s ease",
  },
  active: {
    color: "#6366f1",
    fontWeight: "700",
  },
  heroGlow: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    height: "400px",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  container: {
    position: "relative",
    maxWidth: "1000px",
    margin: "60px auto",
    padding: "40px",
    background: "#0a0f25",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "2.8rem",
    fontWeight: "900",
    marginBottom: "10px",
    letterSpacing: "-1px",
  },
  accentText: {
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    background: "rgba(99,102,241,0.1)",
    color: "#6366f1",
    fontSize: "0.7rem",
    fontWeight: "800",
    letterSpacing: "1px",
    border: "1px solid rgba(99,102,241,0.2)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    marginBottom: "40px",
  },
  contentBlock: {
    background: "rgba(255,255,255,0.02)",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  iconHeading: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  subHeading: {
    fontSize: "1.2rem",
    fontWeight: "700",
    margin: 0,
  },
  paragraph: {
    fontSize: "1rem",
    lineHeight: "1.8",
    color: "rgba(255,255,255,0.7)",
    margin: 0,
  },
  creatorBox: {
    marginTop: "20px",
    padding: "30px",
    background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(34,211,238,0.05))",
    borderRadius: "20px",
    border: "1px solid rgba(99,102,241,0.1)",
    textAlign: "center",
  },
  creatorHeader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  creatorSubHeading: {
    fontSize: "1rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: 0,
    color: "#8b5cf6",
  },
  paragraphCenter: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  architectList: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  nameTag: {
    background: "#020617",
    padding: "8px 20px",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.05)",
    color: "#fff",
  },
  footer: {
    textAlign: "center",
    padding: "40px",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "2px",
  }
};

export default About;