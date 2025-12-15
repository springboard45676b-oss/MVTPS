import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <h2>Maritime Platform</h2>
        <div>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      </nav>

      <main style={styles.main}>
        <h1>Maritime Vessel Tracking</h1>
        <p>
          Track vessels, view analytics, and manage safety alerts.
        </p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/login" style={styles.button}>Get Started</Link>
        </div>
      </main>

      <footer style={styles.footer}>
        © 2025 Maritime Platform — Operators · Analysts · Admins
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #020617)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "#0f172a",
  },
  link: {
    marginLeft: "16px",
    color: "#38bdf8",
    textDecoration: "none",
  },
  main: {
    flex: 1,
    padding: "80px 32px",
  },
  button: {
    background: "#14b8a6",
    padding: "10px 20px",
    borderRadius: "6px",
    color: "#000",
    textDecoration: "none",
    fontWeight: "bold",
  },
  footer: {
    padding: "12px",
    textAlign: "center",
    background: "#020617",
    fontSize: "14px",
  },
};
