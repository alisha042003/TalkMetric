import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#282c34" }}>
      <Link to="/" style={{ color: "white", marginRight: "15px" }}>
        Home
      </Link>
      <Link to="/chat" style={{ color: "white", marginRight: "15px" }}>
        Chat
      </Link>
      <Link to="/about" style={{ color: "white" }}>
        About
      </Link>
    </nav>
  );
}

export default Navbar;
