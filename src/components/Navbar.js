import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/about">About</Link>
      </div>
    </nav>
  );
}
