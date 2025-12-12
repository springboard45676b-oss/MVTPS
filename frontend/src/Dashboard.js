import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserShield, FaChartLine, FaShip } from "react-icons/fa"; 
import MapComponent from "./MapComponent"; 
import PortAnalytics from "./PortAnalytics"; 
import SafetyWidgets from "./SafetyWidgets"; 

const Dashboard = ({ onLogout }) => {
  const [message, setMessage] = useState("Loading...");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token"); 
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/dashboard/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(res.data.message);
        setRole(res.data.role);
        setUsername(res.data.username);
      } catch (error) { 
        console.error(error);
        setMessage("Session expired. Please login again.");
      }
    };
    fetchDashboard();
  }, []);

  const isActive = (targetRole) => role === targetRole ? "active-role" : "inactive-role";

  return (
    <div style={fullPageBackground}>
      <div style={dashboardContainer}>
        
        {/* --- LEFT COLUMN (Scrollable) --- */}
        <div style={leftColumnStyle}>
          <div style={{borderBottom: "1px solid #ddd", paddingBottom: "15px", marginBottom: "20px"}}>
            <h1 style={{color: "#0c2461", margin: 0, fontSize: "1.8rem"}}>Maritime Ops</h1>
            <p style={{color: "#666", margin: "5px 0 0 0"}}>User: <strong>{username}</strong></p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <div className={isActive("operator")} style={roleBoxStyle}><FaShip /> Operator</div>
            <div className={isActive("analyst")} style={roleBoxStyle}><FaChartLine /> Analyst</div>
            <div className={isActive("admin")} style={roleBoxStyle}><FaUserShield /> Admin</div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            {(role === "analyst" || role === "admin") && <PortAnalytics />}
            <SafetyWidgets />
          </div>

          {/* LOGOUT BUTTON (Always at bottom) */}
          <button onClick={onLogout} className="primary-btn" style={logoutButtonStyle}>LOGOUT</button>
        </div>

        {/* --- RIGHT COLUMN (Fixed Map) --- */}
        <div style={rightColumnStyle}>
          <div style={{ height: "100%", borderRadius: "15px", overflow: "hidden", border: "1px solid #ddd", minHeight: "500px" }}>
             <MapComponent />
          </div>
        </div>
      </div>
      <style>{`
        .active-role { background: #2980b9; color: white; transform: scale(1.02); border: none; }
        .inactive-role { background: white; color: #aaa; border: 1px solid #eee; }
        
        /* Custom Scrollbar for left panel */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};

// --- UPDATED STYLES FOR FULL VISIBILITY ---

const fullPageBackground = {
  minHeight: "100vh", 
  width: "100vw",
  backgroundImage: "url('https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=2070&auto=format&fit=crop')",
  backgroundSize: "cover", 
  backgroundPosition: "center",
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  padding: "20px", 
  boxSizing: "border-box", 
  position: "fixed", 
  top: 0, 
  left: 0
};

const dashboardContainer = {
  display: "flex", 
  flexDirection: "row", 
  backgroundColor: "rgba(255, 255, 255, 0.96)",
  borderRadius: "20px", 
  boxShadow: "0 25px 50px rgba(0,0,0,0.5)", 
  width: "100%", 
  maxWidth: "1300px", 
  height: "90vh", // Fixed height relative to viewport
  overflow: "hidden"
};

const leftColumnStyle = { 
  width: "400px", 
  padding: "25px", 
  borderRight: "1px solid #eee", 
  display: "flex", 
  flexDirection: "column", 
  backgroundColor: "#fff", 
  overflowY: "auto" // Allows scrolling if content is too long!
};

const rightColumnStyle = { 
  flex: 1, 
  padding: "20px", 
  backgroundColor: "#fcfcfc", 
  display: "flex", 
  flexDirection: "column" 
};

const roleBoxStyle = { 
  padding: "8px", 
  borderRadius: "5px", 
  display: "flex", 
  alignItems: "center", 
  gap: "5px", 
  fontSize: "0.8rem", 
  cursor: "default", 
  flex: 1, 
  justifyContent: "center" 
};

const logoutButtonStyle = { 
  marginTop: "auto", // Pushes button to bottom
  width: "100%", 
  padding: "15px", 
  background: "#c0392b", 
  color: "white", 
  border: "none", 
  borderRadius: "6px", 
  fontWeight: "bold", 
  cursor: "pointer",
  fontSize: "1rem"
};

export default Dashboard;