import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <strong>Maritime Platform</strong>
          <p className="muted">Vessel tracking • Port analytics • Alerts</p>
        </div>

        <div className="footer__links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer__copy">© {new Date().getFullYear()} Maritime Platform</div>
      </div>
    </footer>
  );
}
