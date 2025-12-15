import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return null;

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <h3 style={styles.logo}>🚢 Maritime Platform</h3>

      <div style={styles.links}>
        <Link style={styles.link} to="/dashboard">Dashboard</Link>
        <span style={styles.user}>
          {user.username} ({user.role})
        </span>
        <button onClick={logout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "#203a43",
    color: "white",
    alignItems: "center",
  },
  logo: { margin: 0 },
  links: { display: "flex", gap: "15px", alignItems: "center" },
  link: { color: "white", textDecoration: "none" },
  user: { fontSize: "14px" },
  logout: {
    background: "#ff4d4d",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
