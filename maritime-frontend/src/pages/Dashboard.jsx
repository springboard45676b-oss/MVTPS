import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "Operator";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Maritime Vessel Tracking Platform</h1>
          <p>Monitor vessels, ports, voyages, and safety events.</p>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="avatar">👤</div>
            <div>
              <div className="username">{username}</div>
              <div className="role">{role}</div>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD CARDS */}
      <main className="dashboard-content">
        <div className="dashboard-card">🚢 Vessels</div>
        <div className="dashboard-card">⚓ Ports</div>
        <div className="dashboard-card">🧭 Voyages</div>
        <div className="dashboard-card">🚨 Events</div>
      </main>
    </div>
  );
}
