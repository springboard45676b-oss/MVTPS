// src/Dashboard.js
import React, { useState } from "react";
import ProjectInfo from "./ProjectInfo"; // Ports panel (live from backend)

export default function Dashboard({ user, onLogout }) {
  const [active, setActive] = useState("Dashboard");

  const username = user?.username || "Operator";
  const role = user?.role || "OPERATOR";

  // --- demo data for vessels & voyages etc. ---
  const vessels = [
    { name: "MV Ocean Pioneer", imo: "9876543", type: "Container", status: "Underway" },
    { name: "SV Harbor Queen", imo: "1234567", type: "Tanker", status: "At berth" },
    { name: "MV Blue Horizon", imo: "7654321", type: "Bulk Carrier", status: "Anchored" },
  ];

  const voyages = [
    { id: "VYG-101", vessel: "MV Ocean Pioneer", route: "Mumbai → Singapore", eta: "In 3 days" },
    { id: "VYG-205", vessel: "SV Harbor Queen", route: "Rotterdam → Hamburg", eta: "Tomorrow" },
  ];

  const events = [
    { type: "Weather Alert", location: "North Arabian Sea", severity: "High" },
    { type: "Port Delay", location: "Singapore Harbor", severity: "Medium" },
  ];

  // -------- choose what to show on the right based on active menu --------
  let mainContent;
  if (active === "Dashboard") {
    mainContent = (
      <div style={styles.placeholderCard}>
        <h3 style={{ marginTop: 0 }}>Overview</h3>
        <p style={styles.text}>
          This dashboard gives an operator view of vessels, ports, voyages and safety events.
        </p>
        <ul style={styles.list}>
          <li>JWT-secured login and logout.</li>
          <li>Ports data fetched live from Django REST API (SQLite database).</li>
          <li>Other sections (vessels, voyages, events) are wired with demo data for now.</li>
        </ul>
      </div>
    );
  } else if (active === "Ports") {
    // real ports from backend
    mainContent = <ProjectInfo />;
  } else if (active === "Vessels") {
    mainContent = (
      <div style={styles.placeholderCard}>
        <h3 style={{ marginTop: 0 }}>Vessels (demo)</h3>
        <p style={styles.text}>Sample fleet records. In the next phase these can come from the API.</p>
        <div style={styles.grid}>
          {vessels.map((v) => (
            <div key={v.imo} style={styles.smallCard}>
              <div style={styles.smallTitle}>{v.name}</div>
              <div style={styles.smallBody}>
                IMO: {v.imo}
                <br />
                Type: {v.type}
                <br />
                Status: {v.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (active === "Voyages") {
    mainContent = (
      <div style={styles.placeholderCard}>
        <h3 style={{ marginTop: 0 }}>Voyages (demo)</h3>
        <p style={styles.text}>Example voyage plans with ETAs.</p>
        <div style={styles.grid}>
          {voyages.map((v) => (
            <div key={v.id} style={styles.smallCard}>
              <div style={styles.smallTitle}>{v.id}</div>
              <div style={styles.smallBody}>
                Vessel: {v.vessel}
                <br />
                Route: {v.route}
                <br />
                ETA: {v.eta}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (active === "Events") {
    mainContent = (
      <div style={styles.placeholderCard}>
        <h3 style={{ marginTop: 0 }}>Events (demo)</h3>
        <p style={styles.text}>Operational and safety-related events.</p>
        <div style={styles.grid}>
          {events.map((e, idx) => (
            <div key={idx} style={styles.smallCard}>
              <div style={styles.smallTitle}>{e.type}</div>
              <div style={styles.smallBody}>
                Location: {e.location}
                <br />
                Severity: {e.severity}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (active === "Notifications") {
    mainContent = (
      <div style={styles.placeholderCard}>
        <h3 style={{ marginTop: 0 }}>Notifications</h3>
        <p style={styles.text}>
          This area will list alerts for delays, safety issues, and port congestion in later milestones.
        </p>
      </div>
    );
  } else if (active === "Live Tracking") {
    mainContent = (
      <div style={styles.placeholderCard}>
        <h3 style={{ marginTop: 0 }}>Live Tracking</h3>
        <p style={styles.text}>
          Live AIS / GPS vessel tracking view will be implemented in a future phase. The menu is already wired.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* LEFT SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.brand}>
            <div style={styles.brandCircle}>MV</div>
            <div>
              <div style={styles.brandTitle}>MVTPS</div>
              <div style={styles.brandSub}>Maritime Platform</div>
            </div>
          </div>

          <div style={styles.userBox}>
            <div style={styles.userAvatar}>
              {username ? username[0].toUpperCase() : "U"}
            </div>
            <div>
              <div style={styles.userName}>{username}</div>
              <div style={styles.userRole}>{role}</div>
            </div>
          </div>

          <nav style={styles.nav}>
            <div style={styles.navGroupTitle}>Main</div>
            <button
              style={active === "Dashboard" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Dashboard")}
            >
              Dashboard
            </button>
            <button
              style={active === "Vessels" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Vessels")}
            >
              Vessels
            </button>
            <button
              style={active === "Ports" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Ports")}
            >
              Ports
            </button>
            <button
              style={active === "Voyages" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Voyages")}
            >
              Voyages
            </button>
            <button
              style={active === "Events" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Events")}
            >
              Events
            </button>
            <button
              style={active === "Notifications" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Notifications")}
            >
              Notifications
            </button>
            <button
              style={active === "Live Tracking" ? styles.navItemActive : styles.navItem}
              onClick={() => setActive("Live Tracking")}
            >
              Live Tracking
            </button>
          </nav>
        </aside>

        {/* RIGHT MAIN AREA */}
        <main style={styles.main}>
          <header style={styles.mainHeader}>
            <div>
              <h2 style={styles.mainTitle}>Operator Dashboard</h2>
              <p style={styles.mainSub}>
                Welcome, {username}. Use the navigation to explore vessels, ports, voyages and safety events.
              </p>
            </div>
            <button style={styles.logoutBtn} onClick={onLogout}>
              Logout
            </button>
          </header>

          <section style={styles.contentSection}>{mainContent}</section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    padding: 20,
    boxSizing: "border-box",
  },
  shell: {
    display: "flex",
    gap: 16,
    maxWidth: 1200,
    margin: "0 auto",
  },
  sidebar: {
    width: 260,
    background: "#020a1a",
    borderRadius: 16,
    padding: 16,
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  brandCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#020617",
  },
  brandTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  brandSub: {
    fontSize: 12,
    color: "#9ca3af",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    background: "#020617",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
  },
  userRole: {
    fontSize: 11,
    color: "#9ca3af",
  },
  nav: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navGroupTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
    marginBottom: 4,
  },
  navItem: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "transparent",
    border: "none",
    color: "#e5e7eb",
    textAlign: "left",
    fontSize: 13,
    cursor: "pointer",
  },
  navItemActive: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#1d4ed8",
    border: "none",
    color: "#e5e7eb",
    textAlign: "left",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  main: {
    flex: 1,
    background: "transparent",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  mainHeader: {
    background: "#020a1a",
    borderRadius: 16,
    padding: "12px 16px",
    color: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mainTitle: {
    margin: 0,
    fontSize: 20,
  },
  mainSub: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#9ca3af",
  },
  contentSection: {
    borderRadius: 16,
    overflow: "hidden",
  },
  placeholderCard: {
    background: "#020a1a",
    borderRadius: 16,
    padding: 20,
    color: "#e5e7eb",
  },
  text: {
    fontSize: 14,
    color: "#cbd5f5",
    marginBottom: 12,
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 14,
    color: "#e5e7eb",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 10,
  },
  smallCard: {
    background: "#020617",
    borderRadius: 12,
    padding: 14,
    border: "1px solid #1e293b",
  },
  smallTitle: {
    fontWeight: 700,
    marginBottom: 6,
  },
  smallBody: {
    fontSize: 13,
    color: "#cbd5f5",
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #4b5563",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: 13,
    cursor: "pointer",
  },
};
