import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="nav">
        <div className="logo">Maritime</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/vessels">Vessels</Link>
          <Link to="/login">Sign in</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-left">
          <h1>Maritime Vessel Tracking</h1>
          <p>Track vessels, view analytics, and manage safety alerts.</p>
          <div className="actions">
            <Link className="btn btn-primary" to="/vessels">Explore Vessels</Link>
            <Link className="btn btn-secondary" to="/login">Sign in</Link>
          </div>
        </div>
        <div className="hero-right">
          {/* SVG ship floating animation */}
          <svg className="ship" width="300" height="180" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
            <g>
              <rect x="0" y="120" width="300" height="40" rx="8" fill="#1f2937"/>
              <rect x="40" y="80" width="200" height="40" rx="6" fill="#0ea5a4"/>
              <circle cx="80" cy="140" r="8" fill="#0ea5a4"/>
              <circle cx="130" cy="140" r="8" fill="#0ea5a4"/>
              <circle cx="180" cy="140" r="8" fill="#0ea5a4"/>
            </g>
          </svg>
        </div>
      </header>

      <section className="features">
        <h2>What you can do</h2>
        <div className="cards">
          <div className="card">Realtime Analytics</div>
          <div className="card">Vessel Tracking</div>
          <div className="card">Port Operations</div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Maritime Platform — Operators · Analysts · Admins
      </footer>
    </div>
  );
}

