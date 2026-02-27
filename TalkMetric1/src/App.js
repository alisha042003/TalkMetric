import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Chat from "./pages/Chat";  // Make sure this is uncommented

function App() {
  const [user, setUser] = useState(null);

  const clientId = "7gn61stvaktbbnl60d1v7tm9us";
  const redirectUri = "http://localhost:3000";
  const cognitoDomain = "https://ap-south-1o1h22d3my.auth.ap-south-1.amazoncognito.com";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      setUser({ code });
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const login = () => {
    window.location.href = `${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
  };

  const logout = () => {
    setUser(null);
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      redirectUri
    )}`;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home user={user} login={login} logout={logout} />}
        />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/chat" element={<Chat />} />  {/* Make sure this is uncommented */}
      </Routes>
    </Router>
  );
}

export default App;