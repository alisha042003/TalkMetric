import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import img1 from "../assets/images/home-hero.jpg";
import img2 from "../assets/images/chat-bg.jpg";
import img3 from "../assets/images/login-side.jpg";
import img4 from "../assets/images/growth-banner.jpg";

/* ================= SLIDES ================= */

const slides = [
  {
    img: img1,
    title: "Speak English.",
    highlight: "Like You Mean It.",
    subtitle: "Real conversations. Real confidence."
  },
  {
    img: img2,
    title: "Practice with AI.",
    highlight: "Anytime.",
    subtitle: "No fear. No judgement."
  },
  {
    img: img3,
    title: "Get Feedback.",
    highlight: "Instantly.",
    subtitle: "Fix mistakes while speaking."
  },
  {
    img: img4,
    title: "Track Growth.",
    highlight: "Visually.",
    subtitle: "See progress that matters."
  }
];

/* ================= ANIMATIONS ================= */

const slideVariants = {
  initial: { opacity: 0, scale: 1.08 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const heroText = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } }
};

const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(99,102,241,0.5)",
      "0 0 50px rgba(139,92,246,0.9)",
      "0 0 20px rgba(99,102,241,0.5)"
    ],
    transition: { duration: 2.5, repeat: Infinity }
  }
};

function Home({ user, login, logout }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <div style={{ background: "#020617", color: "white", overflowX: "hidden" }}>

      {/* ================= HERO ================= */}
      <section style={{ minHeight: "100vh", position: "relative" }}>

        {/* NAVBAR */}
        <nav style={{ position: "absolute", top: 0, width: "100%", zIndex: 20 }}>
          <div style={nav}>
            <h2 style={{ fontWeight: 900 }}>TalkMetric</h2>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <NavItem to="/" label="Home" />
              <NavItem to="/about" label="About" />
              <NavItem to="/profile" label="Profile" />
              <Link to="/chat" style={navCta}>Chat</Link>

              {!user ? (
                <button onClick={login} style={ghostBtn}>Login</button>
              ) : (
                <button onClick={logout} style={logoutBtn}>Logout</button>
              )}
            </div>
          </div>
        </nav>

        {/* IMAGE SLIDESHOW */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 1.2 }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(2,6,23,0.75), rgba(2,6,23,0.75)), url(${slide.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
        </AnimatePresence>

        {/* HERO CONTENT */}
        <div style={heroCenter}>
          <motion.h1
            key={slide.title}
            initial="hidden"
            animate="visible"
            variants={heroText}
            style={heroTitle}
          >
            {slide.title}
            <br />
            <span style={gradientText}>{slide.highlight}</span>
          </motion.h1>

          <motion.p
            key={slide.subtitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={heroSub}
          >
            {slide.subtitle}
          </motion.p>

          <motion.div whileHover={{ scale: 1.06 }}>
            <motion.div {...pulseGlow} style={{ borderRadius: "999px" }}>
              <Link to="/chat" style={heroCta}>
                Start Practicing →
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* SLIDE DOTS */}
        <div style={dots}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                ...dot,
                opacity: i === index ? 1 : 0.3,
                transform: i === index ? "scale(1.3)" : "scale(1)"
              }}
            />
          ))}
        </div>
      </section>

      {/* ================= WHY TALKMETRIC ================= */}
      <section style={{ padding: "120px 20px", background: "#020617" }}>
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}
        >
          <h2 style={{ fontSize: "2.8rem", marginBottom: "12px" }}>
            Why TalkMetric?
          </h2>

          <p style={{ opacity: 0.75, marginBottom: "60px" }}>
            Because confidence comes from practice — not memorization.
          </p>

          <div style={grid}>
            {[
              ["🧠 Real AI Conversations", "Speak naturally, not scripted dialogs"],
              ["🎯 Instant Smart Feedback", "Know exactly what to improve"],
              ["📈 Confidence Tracking", "Watch your fluency grow"],
              ["⏱ Practice Anytime", "No schedules. No pressure"]
            ].map(([title, desc], i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.03 }}
                style={card}
              >
                <h3>{title}</h3>
                <p style={{ opacity: 0.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= CHAT DEMO ================= */}
      <section style={{ padding: "120px 20px", background: "#0f172a" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
            How Users Practice
          </h2>

          <ChatBubble left text="Hi! Ready to practice English?" />
          <ChatBubble right text="I’m nervous, but yes 😅" />
          <ChatBubble left text="That’s perfect. Let’s start anyway." />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={footer}>
        <div style={footerGrid}>
          <div>
            <h3>TalkMetric</h3>
            <p style={{ opacity: 0.7 }}>
              Practice English through real AI conversations.
            </p>
          </div>

          <div>
            <h4>Product</h4>
            <FooterLink to="/chat">Chat</FooterLink>
            <FooterLink to="/profile">Profile</FooterLink>
          </div>

          <div>
            <h4>Company</h4>
            <FooterLink to="/about">About</FooterLink>
          </div>
        </div>

        <p style={{ opacity: 0.5, marginTop: "40px" }}>
          © {new Date().getFullYear()} TalkMetric. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const ChatBubble = ({ text, left, right }) => (
  <motion.div
    initial={{ opacity: 0, x: left ? -60 : 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    style={{
      background: left ? "#1e293b" : "#6366f1",
      alignSelf: right ? "flex-end" : "flex-start",
      padding: "14px 18px",
      borderRadius: "18px",
      marginBottom: "14px",
      maxWidth: "70%"
    }}
  >
    {text}
  </motion.div>
);

const NavItem = ({ to, label }) => (
  <Link to={to} style={{ color: "white", textDecoration: "none" }}>
    {label}
  </Link>
);

const FooterLink = ({ to, children }) => (
  <Link to={to} style={{ color: "white", textDecoration: "none", opacity: 0.7 }}>
    {children}
  </Link>
);

/* ================= STYLES ================= */

const nav = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const heroCenter = {
  minHeight: "100vh",
  position: "relative",
  zIndex: 5,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px"
};

const heroTitle = {
  fontSize: "clamp(2.8rem,6vw,4.4rem)",
  fontWeight: 900,
  lineHeight: 1.1
};

const gradientText = {
  background: "linear-gradient(135deg,#6366f1,#22d3ee)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const heroSub = {
  marginTop: "16px",
  fontSize: "1.15rem",
  opacity: 0.85
};

const heroCta = {
  display: "inline-block",
  marginTop: "28px",
  padding: "18px 46px",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  borderRadius: "999px",
  color: "white",
  fontWeight: 700,
  textDecoration: "none"
};

const dots = {
  position: "absolute",
  bottom: "30px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "10px"
};

const dot = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "white"
};

const grid = {
  display: "grid",
  gap: "26px",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))"
};

const card = {
  background: "#020617",
  padding: "36px",
  borderRadius: "20px"
};

const footer = {
  background: "#020617",
  padding: "80px 20px",
  borderTop: "1px solid rgba(255,255,255,0.1)"
};

const footerGrid = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "40px"
};

const navCta = {
  padding: "7px 16px",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  borderRadius: "20px",
  color: "white",
  textDecoration: "none"
};

const ghostBtn = {
  background: "transparent",
  border: "1px solid white",
  padding: "6px 14px",
  borderRadius: "20px",
  color: "white",
  cursor: "pointer"
};

const logoutBtn = {
  background: "#ef4444",
  border: "none",
  padding: "6px 14px",
  borderRadius: "20px",
  color: "white",
  cursor: "pointer"
};

export default Home;