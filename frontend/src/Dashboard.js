import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
// --- LEAFLET MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Tooltip as LeafletTooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  FaShip, FaSearch, FaBell, FaUserCircle, FaTimes, 
  FaSignOutAlt, FaExclamationTriangle, FaWind, FaSkullCrossbones, 
  FaAnchor, FaThLarge, FaClipboardList, FaCompass, 
  FaCheckSquare, FaFilter, FaSyncAlt, FaChartBar, FaLock, FaToggleOn, 
  FaInfoCircle, FaEye, FaEyeSlash, FaPlus, FaSlidersH, 
  FaArrowDown, FaExchangeAlt, FaRegBell, FaTrash, FaSpinner, 
  FaExternalLinkAlt, FaClock, FaHistory, FaPlay, FaPause, FaFileContract, 
  FaArrowLeft, FaServer, FaDatabase, FaDownload, FaTools, FaPowerOff, FaCheckCircle,
  FaBuilding, FaFileSignature, FaShieldAlt, FaBolt, FaMoneyBillWave, FaTruck, FaWarehouse
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis, CartesianGrid, 
  Legend, AreaChart, Area, PieChart, Pie
} from 'recharts';

// --- IMPORTING DATASET ---
import { initialVessels, initialPortData, initialTradeData } from "./mockData";

// Define Active Safety Zones
const activeSafetyZones = [
  { id: 'zone1', type: 'PIRACY', coords: [12.5, 48.0], radius: 600000, color: '#ef4444', name: "Gulf of Aden - High Risk" }, 
  { id: 'zone2', type: 'STORM', coords: [25.0, -70.0], radius: 800000, color: '#f59e0b', name: "Tropical Storm 'Helene'" },
  { id: 'zone3', type: 'ACCIDENT', coords: [35.0, 140.0], radius: 400000, color: '#3b82f6', name: "Collision History Zone" }
];

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const bgImage = "https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=2070&auto=format&fit=crop";

// --- MAP COMPONENT ---
const MapComponent = ({ vessels, selectedVessel, setSelectedVessel, safetyZones, displayPath, lockView }) => {
  const RecenterMap = ({ selectedVessel, displayPath, lockView }) => {
    const map = useMap();
    useEffect(() => {
      // 1. If Replay Mode is active (lockView), do nothing (user controls zoom)
      if (lockView) return;

      // 2. If a vessel is selected, ZOOM IN
      if (selectedVessel && typeof selectedVessel.lat === 'number' && typeof selectedVessel.lng === 'number') {
        const targetZoom = displayPath ? 5 : 10;
        map.setView([selectedVessel.lat, selectedVessel.lng], targetZoom, { animate: true });
      } 
      // 3. CRITICAL FIX: If NO vessel is selected, ZOOM OUT to Global View
      else {
        map.setView([20, 0], 2, { animate: true });
      }
    }, [selectedVessel, map, displayPath, lockView]);
    return null;
  };

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }} zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      
      {/* Voyage Path Line */}
      {displayPath && displayPath.length > 1 && <Polyline positions={displayPath} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }} />}
      
      {/* Safety Zones - HIGH VISIBILITY */}
      {safetyZones.map((zone, idx) => {
         if (!zone.coords || zone.coords.length !== 2) return null;
         return (
            <Circle 
              key={idx} center={zone.coords} radius={zone.radius} 
              pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.5, weight: 3, dashArray: zone.type === 'STORM' ? '10, 10' : null }} 
            >
              <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}><span><b>{zone.type}:</b> {zone.name}</span></LeafletTooltip>
            </Circle>
         );
      })}

      {/* Vessels */}
      {vessels.map((vessel) => {
        if (typeof vessel.lat !== 'number' || typeof vessel.lng !== 'number') return null;
        return (
            <Marker key={vessel.id} position={[vessel.lat, vessel.lng]} eventHandlers={{ click: () => setSelectedVessel(vessel) }}>
              <Popup>
                <div style={{ minWidth: "150px" }}>
                  <h3 style={{ margin: "0 0 5px 0", color: "#0f172a" }}>{vessel.name}</h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Type: {vessel.type}</p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Status: {vessel.speed} kn</p>
                </div>
              </Popup>
            </Marker>
        );
      })}
      <RecenterMap selectedVessel={selectedVessel} displayPath={displayPath} lockView={lockView} />
    </MapContainer>
  );
};

// --- LOGIN VIEW ---
const LoginView = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "Akhila T.", password: "", role: "ADMIN" });
  const [loading, setLoading] = useState(false);
  const roles = ["ADMIN", "ANALYST", "OPERATOR"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.username) return toast.error("Username required");
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onLogin({
            name: formData.username,
            role: formData.role,
            initials: formData.username.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        });
    }, 800);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url('${bgImage}')`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "white", padding: "40px 50px", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", width: "400px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ width: "60px", height: "60px", background: "#0ea5e9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-10deg)", boxShadow: "0 10px 20px rgba(14, 165, 233, 0.3)" }}><FaCompass size={32} color="white" style={{ transform: "rotate(10deg)" }} /></div>
        </div>
        <h1 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: "1.8rem" }}>Welcome to MVTPS</h1>
        <p style={{ margin: "0 0 30px 0", color: "#64748b", fontSize: "0.9rem" }}>Maritime Vessel Tracking & Port Systems</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>Select Role</label>
                <div style={{ display: "flex", gap: "10px" }}>{roles.map(r => (<div key={r} onClick={() => setFormData({...formData, role: r})} style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: "8px", border: formData.role === r ? "2px solid #0ea5e9" : "1px solid #cbd5e1", background: formData.role === r ? "#f0f9ff" : "white", color: formData.role === r ? "#0369a1" : "#64748b", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}>{r}</div>))}</div>
            </div>
            <div style={{ textAlign: "left" }}><label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>Username</label><div style={{ position: "relative" }}><FaUserCircle style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }} /><input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="Enter username" style={{ width: "100%", padding: "10px 10px 10px 35px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem", boxSizing: "border-box" }} /></div></div>
            <div style={{ textAlign: "left" }}><label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>Password</label><div style={{ position: "relative" }}><FaLock style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }} /><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" style={{ width: "100%", padding: "10px 10px 10px 35px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem", boxSizing: "border-box" }} /></div></div>
            <button type="submit" disabled={loading} style={{ background: "#0f172a", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontSize: "1rem", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>{loading ? <FaSpinner className="spin" /> : <FaShip />} {loading ? "Authenticating..." : "Access Dashboard"}</button>
        </form>
      </div>
    </div>
  );
};

// --- SUB-DASHBOARDS ---
const CompanyView = ({ onBack }) => {
  const financialData = [{ month: 'Jan', revenue: 4000, cost: 2400 }, { month: 'Feb', revenue: 3000, cost: 1398 }, { month: 'Mar', revenue: 2000, cost: 9800 }, { month: 'Apr', revenue: 2780, cost: 3908 }, { month: 'May', revenue: 1890, cost: 4800 }, { month: 'Jun', revenue: 2390, cost: 3800 }];
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "30px", fontWeight: "bold", color: "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><FaArrowLeft /> Back to Main Dashboard</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}><div><h1 style={{ color: "#0f172a", margin: 0, fontSize: "2.5rem" }}>Company Logistics</h1><p style={{ color: "#64748b", margin: "10px 0 0 0" }}>Real-time fleet performance.</p></div><div style={{ background: "#2563eb", color: "white", padding: "15px 30px", borderRadius: "12px", textAlign: "center" }}><div style={{ fontSize: "0.8rem", opacity: 0.8, fontWeight: "bold" }}>NET PROFIT</div><div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>$1.2M</div></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}><div style={{ background: "white", padding: "25px", borderRadius: "12px", borderLeft: "5px solid #3b82f6", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ color: "#64748b", fontWeight: "bold", fontSize: "0.9rem" }}>REVENUE</div><div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#0f172a" }}>$4.2M</div></div><div style={{ background: "white", padding: "25px", borderRadius: "12px", borderLeft: "5px solid #10b981", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ color: "#64748b", fontWeight: "bold", fontSize: "0.9rem" }}>FLEET</div><div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#0f172a" }}>24</div></div><div style={{ background: "white", padding: "25px", borderRadius: "12px", borderLeft: "5px solid #f59e0b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ color: "#64748b", fontWeight: "bold", fontSize: "0.9rem" }}>FUEL</div><div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#0f172a" }}>12k T</div></div><div style={{ background: "white", padding: "25px", borderRadius: "12px", borderLeft: "5px solid #ef4444", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ color: "#64748b", fontWeight: "bold", fontSize: "0.9rem" }}>DELAYS</div><div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#0f172a" }}>3</div></div></div>
        <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><h3 style={{ margin: "0 0 20px 0", color: "#334155" }}><FaMoneyBillWave /> Financials</h3><ResponsiveContainer width="100%" height={400}><AreaChart data={financialData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" /><Area type="monotone" dataKey="cost" stackId="1" stroke="#82ca9d" fill="#82ca9d" /></AreaChart></ResponsiveContainer></div>
    </div>
  );
};

const PortAuthorityView = ({ onBack }) => {
    const terminalData = [{ hour: '00:00', trucks: 12 }, { hour: '04:00', trucks: 8 }, { hour: '08:00', trucks: 45 }, { hour: '12:00', trucks: 78 }, { hour: '16:00', trucks: 60 }, { hour: '20:00', trucks: 30 }];
    return (
      <div style={{ minHeight: "100vh", background: "#f0fdfa", padding: "40px" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", border: "1px solid #ccfbf1", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "30px", fontWeight: "bold", color: "#0f766e", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><FaArrowLeft /> Back to Dashboard</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}><div><h1 style={{ color: "#115e59", margin: 0, fontSize: "2.5rem" }}>Port Authority</h1><p style={{ color: "#0d9488", margin: "10px 0 0 0" }}>Terminal Operations & Gate Flow.</p></div><div style={{ background: "#0f766e", color: "white", padding: "15px 30px", borderRadius: "12px", textAlign: "center" }}><div style={{ fontSize: "0.8rem", opacity: 0.8, fontWeight: "bold" }}>OCCUPANCY</div><div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>82%</div></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "30px", marginBottom: "30px" }}><div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><div style={{ background: "#ccfbf1", padding: "10px", borderRadius: "50%" }}><FaTruck color="#0f766e" size={24} /></div><h3 style={{ margin: "0", color: "#334155" }}>Gate Activity</h3></div><div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0f172a" }}>340</div></div><div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><div style={{ background: "#ccfbf1", padding: "10px", borderRadius: "50%" }}><FaWarehouse color="#0f766e" size={24} /></div><h3 style={{ margin: "0", color: "#334155" }}>Containers</h3></div><div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0f172a" }}>12,450</div></div><div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><div style={{ background: "#ccfbf1", padding: "10px", borderRadius: "50%" }}><FaAnchor color="#0f766e" size={24} /></div><h3 style={{ margin: "0", color: "#334155" }}>Active Berths</h3></div><div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0f172a" }}>8 / 10</div></div></div>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><h3 style={{ margin: "0 0 20px 0", color: "#334155" }}>Gate Traffic Volume</h3><ResponsiveContainer width="100%" height={350}><BarChart data={terminalData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="hour" /><YAxis /><Tooltip /><Bar dataKey="trucks" fill="#0d9488" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    );
};

const InsurerView = ({ onBack }) => {
  const riskData = [{ name: 'Maersk Ohio', risk: 85 }, { name: 'Ever Given', risk: 45 }, { name: 'MSC Oscar', risk: 65 }, { name: 'HMM Algeciras', risk: 30 }, { name: 'CMA CGM', risk: 90 }];
  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ff", padding: "40px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", border: "1px solid #ddd6fe", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "30px", fontWeight: "bold", color: "#6d28d9", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><FaArrowLeft /> Back to Dashboard</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}><div><h1 style={{ color: "#4c1d95", margin: 0, fontSize: "2.5rem" }}>Insurer Risk Portal</h1><p style={{ color: "#7c3aed", margin: "10px 0 0 0" }}>Risk & Compliance.</p></div><div style={{ background: "#6d28d9", color: "white", padding: "15px 30px", borderRadius: "12px", textAlign: "center" }}><div style={{ fontSize: "0.8rem", opacity: 0.8, fontWeight: "bold" }}>CLAIMS</div><div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>$8.5M</div></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}><div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><h3 style={{ margin: "0 0 20px 0", color: "#334155" }}><FaShieldAlt /> Fleet Risk Scores</h3><ResponsiveContainer width="100%" height={350}><BarChart data={riskData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} /><YAxis dataKey="name" type="category" width={100} /><Tooltip /><Bar dataKey="risk" fill="#8884d8">{riskData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.risk > 70 ? '#ef4444' : entry.risk > 40 ? '#f59e0b' : '#10b981'} />))}</Bar></BarChart></ResponsiveContainer></div><div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><h3 style={{ margin: "0 0 20px 0", color: "#334155" }}><FaExclamationTriangle /> Recent Claims</h3><div style={{ display: "flex", flexDirection: "column", gap: "15px" }}><div style={{ padding: "20px", background: "#fff1f2", borderLeft: "4px solid #ef4444", borderRadius: "8px" }}><div style={{ fontWeight: "bold", color: "#991b1b", fontSize: "1.1rem" }}>Cargo Damage</div><div style={{ fontSize: "0.9rem", color: "#ef4444", marginTop: "5px" }}>$45,000 Est.</div></div><div style={{ padding: "20px", background: "#fefce8", borderLeft: "4px solid #f59e0b", borderRadius: "8px" }}><div style={{ fontWeight: "bold", color: "#854d0e", fontSize: "1.1rem" }}>Delay Penalty</div><div style={{ fontSize: "0.9rem", color: "#ca8a04", marginTop: "5px" }}>$12,500 Est.</div></div><div style={{ padding: "20px", background: "#f0fdf4", borderLeft: "4px solid #10b981", borderRadius: "8px" }}><div style={{ fontWeight: "bold", color: "#166534", fontSize: "1.1rem" }}>Audit Passed</div><div style={{ fontSize: "0.9rem", color: "#15803d", marginTop: "5px" }}>Maersk Ohio</div></div></div></div></div>
    </div>
  );
};

// --- PORTS ANALYTICS VIEW (UPDATED: UNCTAD Button Removed) ---
const PortsAnalyticsView = ({ portData, tradeData }) => {
  const congestedPorts = [...portData].sort((a, b) => b.wait - a.wait).slice(0, 3);
  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px", height: "100%", overflowY: "auto" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div><h2 style={{ color: "#0f172a", marginBottom: "5px", fontSize: "2rem" }}>Port Analytics & UNCTAD Stats</h2><p style={{ color: "#64748b", margin: 0 }}>Real-time UNCTAD trade statistics, congestion, and connectivity monitoring.</p></div>
        {/* --- UNCTAD BUTTON REMOVED --- */}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
        {congestedPorts.map(p => (
           <div key={p.id} style={{ background: p.wait > 24 ? "#fff1f2" : "white", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>{p.wait > 24 ? <FaExclamationTriangle color="#ef4444" /> : <FaCheckCircle color="#10b981" />}<div><div style={{ fontWeight: "bold", color: "#1e293b" }}>{p.name}</div><div style={{ fontSize: "0.8rem", color: "#64748b" }}>Status: {p.wait > 24 ? "Congested" : "Normal"}</div></div></div>
              <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: p.wait > 24 ? "#ef4444" : "#10b981" }}>{p.wait}h</div>
           </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}><div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Global Average Wait Time</div><div style={{ fontSize: "2rem", color: "#0f172a", fontWeight: "bold", margin: "10px 0" }}>18.5 Hrs</div></div><div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Connectivity Index</div><div style={{ fontSize: "2rem", color: "#2563eb", fontWeight: "bold", margin: "10px 0" }}>142.5</div></div><div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Efficiency Score</div><div style={{ fontSize: "2rem", color: "#16a34a", fontWeight: "bold", margin: "10px 0" }}>87/100</div></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", minHeight: "300px" }}>
         <div style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><h4 style={{ margin: "0 0 20px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}><FaExchangeAlt /> Trade Volume</h4><ResponsiveContainer width="100%" height={250}><AreaChart data={tradeData}><XAxis dataKey="month" /><YAxis /><CartesianGrid strokeDasharray="3 3" /><Tooltip /><Area type="monotone" dataKey="import" stroke="#8884d8" fill="#8884d8" /></AreaChart></ResponsiveContainer></div>
         <div style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}><h4 style={{ margin: "0 0 20px 0", color: "#334155" }}>Vessel Wait Time</h4><ResponsiveContainer width="100%" height={250}><BarChart data={portData}><XAxis dataKey="name" /><YAxis /><Bar dataKey="wait" fill="#3b82f6">{portData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.wait > 30 ? '#ef4444' : '#3b82f6'} />))}</Bar></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};

// --- ADMIN TOOLS ---
const AdminToolsView = () => {
  const [sources, setSources] = useState([
    { id: 1, name: "AIS Satellite Feed A", status: "Active", latency: "45ms", type: "Stream" },
    { id: 2, name: "Port Authority API", status: "Active", latency: "120ms", type: "REST" },
    { id: 3, name: "NOAA Weather Data", status: "Active", latency: "200ms", type: "REST" },
    { id: 4, name: "UNCTAD Trade Stats", status: "Active", latency: "150ms", type: "REST" },
  ]);

  const toggleSource = (id) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Active" ? "Offline" : "Active" } : s));
    toast.success("Source status updated");
  };

  const handleExport = (type) => {
    toast.loading(`Preparing ${type} export...`);
    setTimeout(() => { toast.dismiss(); toast.success(`${type} downloaded successfully!`); }, 2000);
  };

  return (
     <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", height: "100%", overflowY: "auto" }}>
        <div style={{ marginBottom: "30px" }}>
            <h2 style={{ color: "#0f172a", marginBottom: "5px", fontSize: "2rem", display: "flex", alignItems: "center", gap: "10px" }}><FaTools /> Admin Console</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
            <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
               <h3 style={{ margin: "0 0 20px 0", color: "#334155", fontSize: "1.1rem" }}>API Source Management</h3>
               <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}><th style={{ padding: "10px", color: "#64748b" }}>SOURCE</th><th style={{ padding: "10px", color: "#64748b" }}>TYPE</th><th style={{ padding: "10px", color: "#64748b" }}>STATUS</th><th style={{ padding: "10px", color: "#64748b" }}>ACTION</th></tr></thead>
                  <tbody>
                    {sources.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "15px 10px", fontWeight: "600", color: "#334155" }}>{s.name}</td>
                        <td style={{ padding: "15px 10px", color: "#64748b" }}>{s.type}</td>
                        <td style={{ padding: "15px 10px" }}><span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", background: s.status === "Active" ? "#dcfce7" : "#fee2e2", color: s.status === "Active" ? "#166534" : "#991b1b" }}>{s.status}</span></td>
                        <td style={{ padding: "15px 10px" }}><button onClick={() => toggleSource(s.id)} style={{ cursor: "pointer", background: "none", border: "1px solid #e2e8f0", padding: "5px 10px", borderRadius: "6px" }}><FaPowerOff size={12} /> Toggle</button></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#334155", fontSize: "1.1rem" }}>Data Exports</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <button onClick={() => handleExport("Voyage Logs")} style={{ padding: "15px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "space-between" }}><span>Voyage Logs</span><FaDownload /></button>
                    <button onClick={() => handleExport("Compliance Audit")} style={{ padding: "15px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "space-between" }}><span>Compliance Report</span><FaDownload /></button>
                </div>
            </div>
        </div>
     </div>
  );
};

// --- HISTORY REPLAY ---
const HistoryAuditView = ({ vessels }) => {
  const [selectedVesselId, setSelectedVesselId] = useState(vessels[0]?.id || 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [historyPath, setHistoryPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  useEffect(() => {
    const generateMockHistory = () => {
      const path = []; const logs = [];
      let lat = 1.3521; let lon = 103.8198;
      for (let i = 0; i <= 100; i++) {
        lat += 0.5 + Math.random() * 0.5; lon -= 0.5 + Math.random() * 0.5;
        path.push({ lat, lng: lon, speed: 15, step: i });
        if (i % 20 === 0) logs.push({ id: i, time: `T+${i}h`, event: "Check", value: "15 kn", status: "Pass" });
      }
      setHistoryPath(path); setAuditLogs(logs); setCurrentPosition(path[0]);
    };
    generateMockHistory();
  }, [selectedVesselId]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setSliderValue((prev) => { if (prev >= 100) { setIsPlaying(false); return 100; } return prev + 1; });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => { if (historyPath[sliderValue]) setCurrentPosition(historyPath[sliderValue]); }, [sliderValue, historyPath]);

  const traveledPathCoords = historyPath.slice(0, sliderValue + 1).map(p => [p.lat, p.lng]);

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "30px", height: "100%" }}>
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
         <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div><h2 style={{ margin: 0, color: "#0f172a" }}>Voyage Replay</h2></div>
                <select style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={selectedVesselId} onChange={(e) => setSelectedVesselId(Number(e.target.value))}>
                   {vessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", background: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
                <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: isPlaying ? "#f59e0b" : "#10b981", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{isPlaying ? <FaPause /> : <FaPlay style={{marginLeft:"3px"}}/>}</button>
                <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => { setIsPlaying(false); setSliderValue(Number(e.target.value)); }} style={{ flex: 1, cursor: "pointer" }} />
            </div>
         </div>
         <div style={{ flex: 1, background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", minHeight: "400px", position: "relative" }}>
             <MapComponent vessels={currentPosition ? [{ ...vessels[0], lat: currentPosition.lat, lng: currentPosition.lng }] : []} selectedVessel={vessels[0]} setSelectedVessel={()=>{}} safetyZones={activeSafetyZones} displayPath={traveledPathCoords} lockView={isPlaying || sliderValue > 0} />
         </div>
      </div>
      <div style={{ flex: 1, background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}><FaFileContract className="text-blue-600" /> Compliance Audit</h3>
          <div style={{ overflowY: "auto", flex: 1 }}>
              {auditLogs.map((log) => (
                  <div key={log.id} style={{ display: "flex", gap: "15px", padding: "15px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: log.status === "Critical" ? "#ef4444" : "#10b981", marginTop: "5px" }}></div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: "bold", color: "#334155", fontSize: "0.9rem" }}>{log.event}</div><div style={{ fontSize: "0.8rem", color: "#64748b" }}>{log.time}</div></div>
                      <div style={{ fontWeight: "bold", color: log.status === "Critical" ? "#ef4444" : "#1e293b" }}>{log.value}</div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

// --- VOYAGES VIEW ---
const VoyagesView = () => {
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/voyages/')
      .then(res => res.json()).then(data => { setVoyages(data); setLoading(false); })
      .catch(err => {
        setVoyages([
           { id: 1, vessel_name: "Ever Given", port_from: "Singapore", port_to: "Rotterdam", departure_time: "2023-10-01", status: "In Transit" },
           { id: 2, vessel_name: "Maersk Ohio", port_from: "Shanghai", port_to: "Los Angeles", departure_time: "2023-09-28", status: "Arrived" },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px" }}>
       <div><h2 style={{ color: "#0f172a", marginBottom: "5px", fontSize: "2rem" }}>Voyage Schedule</h2></div>
       <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          {loading ? <p>Loading...</p> : (
             <table style={{ width: "100%", borderCollapse: "collapse" }}>
               <thead><tr style={{ background: "#f8fafc", textAlign: "left" }}><th style={{ padding: "15px", color: "#64748b" }}>VESSEL</th><th style={{ padding: "15px", color: "#64748b" }}>ROUTE</th><th style={{ padding: "15px", color: "#64748b" }}>STATUS</th></tr></thead>
               <tbody>
                 {voyages.map((voyage) => (
                   <tr key={voyage.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                     <td style={{ padding: "15px", fontWeight: "bold", color: "#0f172a" }}>{voyage.vessel_name}</td>
                     <td style={{ padding: "15px", color: "#475569" }}>{voyage.port_from} → {voyage.port_to}</td>
                     <td style={{ padding: "15px" }}>{voyage.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
       </div>
    </div>
  );
};

// --- COMPONENT: NOTIFICATION PANEL ---
const NotificationPanel = ({ notifications, onClose, onClear }) => {
  return (
    <div style={{ position: "fixed", top: "75px", right: "25px", width: "320px", background: "white", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", border: "1px solid #cbd5e1", zIndex: 99999, overflow: "hidden" }}>
      <div style={{ padding: "15px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
        <h4 style={{ margin: 0, color: "#0f172a", fontSize: "0.95rem" }}>Notifications</h4>
        <div style={{display:"flex", gap:"10px"}}>
            <button onClick={onClear} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", display:"flex", alignItems:"center", gap:"3px", fontWeight:"600" }}><FaTrash size={10} /> CLEAR</button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1rem" }}><FaTimes /></button>
        </div>
      </div>
      <div style={{ maxHeight: "350px", overflowY: "auto", background:"white" }}>
        {notifications.length === 0 ? <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>No new notifications</div> : notifications.map((notif) => (
            <div key={notif.id} style={{ padding: "12px 15px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "12px", alignItems: "start", background: notif.type === "alert" ? "#fff1f2" : "white" }}>
              <div style={{ marginTop: "3px" }}>{notif.type === "alert" ? <FaExclamationTriangle color="#ef4444" size={14} /> : <FaInfoCircle color="#3b82f6" size={14} />}</div>
              <div><div style={{ fontWeight: "600", fontSize: "0.85rem", color: "#334155" }}>{notif.title}</div><div style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0", lineHeight: "1.3" }}>{notif.message}</div><div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>{notif.time}</div></div>
            </div>
          ))}
      </div>
    </div>
  );
};

// --- COMPONENT: PROFILE MODAL ---
const ProfileModal = ({ isOpen, onClose, onLogout, userProfile }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
      <div style={{ background: "white", width: "600px", padding: "40px", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}><div><h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.5rem" }}>Edit Profile</h2></div><button onClick={onClose} style={{border:"none", background:"#f1f5f9", borderRadius: "50%", width:"32px", height:"32px", cursor:"pointer"}}><FaTimes /></button></div>
        <div style={{ marginBottom: "20px" }}><div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", color: "#0369a1", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}><FaLock size={12} /> {userProfile.role}</div></div>
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "25px", display: "flex", justifyContent: "space-between" }}>
           <button onClick={onLogout} style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Sign Out</button>
           <button onClick={onClose} style={{ background: "#0f172a", border: "none", color: "white", padding: "10px 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: ALERT SETTINGS MODAL ---
const AlertSettingsModal = ({ isOpen, onClose, vessel, isSubscribed, onToggleSubscription }) => {
  if (!isOpen || !vessel) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
      <div style={{ background: "white", width: "400px", borderRadius: "12px", padding: "25px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}><h3 style={{ margin: 0, color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}><FaBell /> Alert Settings</h3><FaTimes style={{ cursor: "pointer", color: "#94a3b8" }} onClick={onClose} /></div>
         <h4 style={{margin:"0 0 15px 0", color:"#1e293b"}}>{vessel.name}</h4>
         <div style={{ background: isSubscribed ? "#f0fdf4" : "#f8fafc", padding: "15px", borderRadius: "8px", border: isSubscribed ? "1px solid #bbf7d0" : "1px solid #e2e8f0", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor:"pointer" }} onClick={() => onToggleSubscription(vessel.id)}>
            <div><div style={{ fontSize: "0.9rem", fontWeight: "bold", color: isSubscribed ? "#166534" : "#64748b" }}>{isSubscribed ? "Alerts Active" : "Alerts Disabled"}</div></div><FaToggleOn size={30} color={isSubscribed ? "#16a34a" : "#cbd5e1"} style={{transform: isSubscribed ? "none" : "rotate(180deg)", transition: "all 0.3s"}} />
         </div>
         <button onClick={onClose} style={{ width: "100%", background: "#0f172a", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Done</button>
      </div>
    </div>
  );
};

const ProfileView = ({ onEnterDashboard, userProfile }) => {
  return (
    <div style={{ height: "100vh", width: "100vw", backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url('${bgImage}')`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(255, 255, 255, 0.95)", padding: "40px", borderRadius: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", width: "450px", textAlign: "center", backdropFilter: "blur(10px)" }}>
        <div style={{ marginBottom: "20px" }}><div style={{ width: "100px", height: "100px", background: "#e2e8f0", borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}><FaUserCircle size={60} color="#64748b" /></div></div>
        <h2 style={{ margin: "10px 0 5px 0", color: "#0f172a", fontSize: "1.8rem" }}>{userProfile.name}</h2>
        <p style={{ margin: "0 0 20px 0", color: "#0ea5e9", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>{userProfile.role}</p>
        <button onClick={onEnterDashboard} style={{ width: "100%", padding: "15px", background: "#0f172a", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><FaShip /> ACCESS DASHBOARD</button>
      </div>
    </div>
  );
};

// --- HOME CARDS VIEW (FIXED NAVIGATION) ---
const HomeCardsView = ({ setActiveTab, portData, onOpenSubView }) => {
  const cardStyle = { background: "white", borderRadius: "12px", padding: "25px", cursor: "pointer", transition: "transform 0.2s", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "140px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" };
  const companyCardStyle = { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", borderRadius: "12px", padding: "25px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "white", position: "relative", overflow: "hidden" };
  const portCardStyle = { background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)", borderRadius: "12px", padding: "25px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "white", position: "relative", overflow: "hidden" };
  const insurerCardStyle = { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", borderRadius: "12px", padding: "25px", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "white", position: "relative", overflow: "hidden" };

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px" }}>
      <div><h2 style={{ color: "#0f172a", marginBottom: "10px", fontSize: "2.5rem" }}>Welcome, Admin Dashboard</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "25px" }}> 
        <div style={cardStyle} onClick={() => setActiveTab('Live Tracking')}><div><FaShip size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Live Tracking</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Vessels')}><div><FaClipboardList size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Vessels DB</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Ports')}><div><FaAnchor size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Ports</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Voyages')}><div><FaCompass size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Voyages</div></div></div> 
        <div style={cardStyle} onClick={() => setActiveTab('History')}><div><FaHistory size={28} color="#f59e0b" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>History/Audit</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Vessels')}><div><FaBell size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Alerts</div></div></div>
      </div>
      <h3 style={{ fontSize: "1.2rem", color: "#334155", fontWeight: "700", margin: "30px 0 20px 0" }}>Analytics & Dashboards</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px", marginBottom: "30px" }}>
          <div style={companyCardStyle} onClick={() => onOpenSubView('Company')}>
             <div style={{position: "relative", zIndex: 2}}><h3 style={{margin: "0 0 5px 0", fontSize: "1.5rem"}}>Company</h3><p style={{margin: 0, opacity: 0.9, fontSize: "0.9rem"}}>Fleet & Logistics Analytics</p></div>
             <FaShip style={{position: "absolute", bottom: "-10px", right: "-10px", fontSize: "6rem", opacity: 0.1}} />
          </div>
          <div style={portCardStyle} onClick={() => onOpenSubView('PortAuthority')}>
             <div style={{position: "relative", zIndex: 2}}><h3 style={{margin: "0 0 5px 0", fontSize: "1.5rem"}}>Port Authority</h3><p style={{margin: 0, opacity: 0.9, fontSize: "0.9rem"}}>Traffic & Wait Times</p></div>
             <FaAnchor style={{position: "absolute", bottom: "-10px", right: "-10px", fontSize: "6rem", opacity: 0.1}} />
          </div>
          <div style={insurerCardStyle} onClick={() => onOpenSubView('Insurer')}>
             <div style={{position: "relative", zIndex: 2}}><h3 style={{margin: "0 0 5px 0", fontSize: "1.5rem"}}>Insurer</h3><p style={{margin: 0, opacity: 0.9, fontSize: "0.9rem"}}>Risk Scores & Audits</p></div>
             <FaExclamationTriangle style={{position: "absolute", bottom: "-10px", right: "-10px", fontSize: "6rem", opacity: 0.1}} />
          </div>
      </div>
    </div>
  );
};

// --- VESSELS DATABASE VIEW ---
const VesselsDatabaseView = ({ vessels, selectedVessel, setSelectedVessel, subscribedVessels, onOpenAlertModal, addNotification, searchQuery, setSearchQuery, onRefresh, onSimulate, isFilterOpen, onFilterToggle, filterCriteria, setFilterCriteria, onToggleSubscription }) => {
  const filteredVessels = vessels.filter(v => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = v.name.toLowerCase().includes(searchLower) || v.imo.includes(searchLower);
      const matchesCategory = filterCriteria.categories.length === 0 || filterCriteria.categories.some(cat => v.type.includes(cat));
      const matchesFlag = filterCriteria.flags.length === 0 || filterCriteria.flags.includes(v.flag);
      return matchesSearch && matchesCategory && matchesFlag;
  });

  const toggleFilterCategory = (cat) => setFilterCriteria(prev => ({ ...prev, categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat] }));
  const toggleFilterFlag = (flag) => setFilterCriteria(prev => ({ ...prev, flags: prev.flags.includes(flag) ? prev.flags.filter(f => f !== flag) : [...prev.flags, flag] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "20px", gap: "20px" }}>
      <div style={{ background: "white", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <div><h2 style={{ margin: 0, color: "#0f172a" }}>Fleet Management</h2><p style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}> <FaCheckSquare color="#10b981" /> Live tracking active </p></div>
         <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={onRefresh} style={{ background: "white", border: "1px solid #cbd5e1", color: "#475569", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><FaSyncAlt /> Refresh</button>
            <button onClick={onSimulate} style={{ background: "#2563eb", border: "none", color: "white", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><FaPlus /> Simulate Data</button>
         </div>
      </div>
      <div style={{ display: "flex", gap: "30px", flex: 1, minHeight: 0 }}>
         <div style={{ width: "380px", background: "white", borderRadius: "10px", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
               <div style={{ display: "flex", gap: "10px" }}>
                   <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                       <FaSearch color="#cbd5e1" />
                       <input type="text" placeholder="Search vessel, IMO..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: "none", background: "transparent", marginLeft: "10px", outline: "none", width: "100%", fontSize: "0.9rem" }} />
                   </div>
                   <button onClick={onFilterToggle} style={{ background: isFilterOpen ? "#e0f2fe" : "white", border: isFilterOpen ? "1px solid #0ea5e9" : "1px solid #e2e8f0", borderRadius: "6px", padding: "0 15px", cursor: "pointer", color: isFilterOpen ? "#0284c7" : "#64748b" }}><FaSlidersH /></button>
               </div>
               {isFilterOpen && (
                   <div style={{ marginTop: "15px", padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                       <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>VESSEL CATEGORY</div>
                       <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>{["Cargo", "Tanker", "Container", "LNG"].map(cat => (<div key={cat} onClick={() => toggleFilterCategory(cat)} style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "4px", background: filterCriteria.categories.includes(cat) ? "#2563eb" : "white", color: filterCriteria.categories.includes(cat) ? "white" : "#475569", border: "1px solid #cbd5e1", cursor: "pointer" }}>{cat}</div>))}</div>
                       <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>FLAG</div>
                       <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{["Panama", "Denmark", "Marshall Islands", "Bahamas"].map(flag => (<div key={flag} onClick={() => toggleFilterFlag(flag)} style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "4px", background: filterCriteria.flags.includes(flag) ? "#2563eb" : "white", color: filterCriteria.flags.includes(flag) ? "white" : "#475569", border: "1px solid #cbd5e1", cursor: "pointer" }}>{flag}</div>))}</div>
                   </div>
               )}
            </div>
            <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>Showing {filteredVessels.length} of {vessels.length} vessels</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
               {filteredVessels.map(ship => {
                  const isSelected = selectedVessel && selectedVessel.id === ship.id; 
                  return (
                    <div key={ship.id} onClick={() => setSelectedVessel(ship)} style={{ padding: "15px", marginBottom: "10px", borderRadius: "8px", cursor: "pointer", border: isSelected ? "1px solid #2563eb" : "1px solid transparent", background: isSelected ? "#eff6ff" : "white", borderLeft: isSelected ? "4px solid #2563eb" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#1e293b" }}>{ship.name}</div><div style={{ fontSize: "0.8rem", color: "#64748b" }}>IMO: {ship.imo}</div></div>
                        {subscribedVessels.includes(ship.id) && <FaBell color="#16a34a" />}
                    </div>
                  );
               })}
            </div>
         </div>
         <div style={{ flex: 1, background: "white", borderRadius: "10px", padding: "0", overflowY: "auto", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "25px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
               <h4 style={{ margin: "0 0 20px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}><FaAnchor /> Vessel Details</h4>
               {selectedVessel ? (
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div><h1 style={{ margin: "0", color: "#1e293b", fontSize: "1.8rem" }}>{selectedVessel.name}</h1><p style={{ margin: "5px 0 0 0", color: "#64748b" }}>IMO: {selectedVessel.imo}</p></div>
                      
                      {/* --- TOGGLE SUBSCRIPTION BUTTON --- */}
                      <div onClick={() => onToggleSubscription(selectedVessel.id)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "8px 15px", background: subscribedVessels.includes(selectedVessel.id) ? "#dcfce7" : "#f1f5f9", borderRadius: "20px", border: "1px solid", borderColor: subscribedVessels.includes(selectedVessel.id) ? "#86efac" : "#e2e8f0" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: subscribedVessels.includes(selectedVessel.id) ? "#166534" : "#64748b" }}>{subscribedVessels.includes(selectedVessel.id) ? "Subscribed" : "Subscribe"}</span>
                          <FaToggleOn size={24} color={subscribedVessels.includes(selectedVessel.id) ? "#16a34a" : "#cbd5e1"} style={{ transform: subscribedVessels.includes(selectedVessel.id) ? "none" : "rotate(180deg)", transition: "all 0.3s" }} />
                      </div>

                   </div>
               ) : <p style={{color: "#94a3b8"}}>Select a vessel to view details.</p>}
            </div>
            {selectedVessel && (
                <div style={{ padding: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                   <div><label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#94a3b8" }}>OPERATOR</label><div style={{ fontSize: "1rem", fontWeight: "600" }}>{selectedVessel.operator}</div></div>
                   <div><label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#94a3b8" }}>FLAG</label><div style={{ fontSize: "1rem", fontWeight: "600" }}>{selectedVessel.flag}</div></div>
                   <div><label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#94a3b8" }}>POSITION</label><div style={{ fontSize: "1rem", fontWeight: "600" }}>{selectedVessel.lat.toFixed(4)} N, {selectedVessel.lng.toFixed(4)} E</div></div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- LIVE TRACKING VIEW ---
const LiveTrackingView = ({ vessels, selectedVessel, setSelectedVessel, subscribedVessels, onOpenAlertModal, addNotification, onUpdatePositions }) => {
  const [selectedCategories, setSelectedCategories] = useState(["Cargo", "Tanker", "Container", "LNG"]);
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false); 

  const filteredVessels = vessels.filter(ship => {
    const typeMatch = selectedCategories.length === 0 || selectedCategories.some(cat => ship.type.includes(cat));
    const flagMatch = selectedFlags.length === 0 || selectedFlags.includes(ship.flag);
    return typeMatch && flagMatch;
  });

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const toggleFlag = (flag) => setSelectedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);

  const handleUpdateClick = () => { setIsUpdating(true); if (onUpdatePositions) onUpdatePositions(); setTimeout(() => setIsUpdating(false), 1000); };
  const getCount = (cat) => vessels.filter(v => v.type.includes(cat)).length;

  return (
    <div style={{ display: "flex", width: "100%", padding: "20px", gap: "20px", height: "100%" }}>
      <div style={{ width: "300px", background: "white", borderRadius: "8px", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "20px", background: "#0ea5e9", color: "white", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}><h3 style={{ margin: "0", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }}><FaThLarge /> MaritimeTrack</h3><div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Live Vessel Tracking</div></div>
        <div style={{ padding: "15px" }}>
            <button onClick={handleUpdateClick} disabled={isUpdating} style={{ width: "100%", background: isUpdating ? "#94a3b8" : "#0ea5e9", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: isUpdating ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.3s" }}>{isUpdating ? <FaSpinner className="spin" /> : <FaSyncAlt />} {isUpdating ? "Updating..." : "Update All Positions"}</button>
        </div>
        <div style={{ padding: "0 15px 15px 15px", overflowY: "auto", flex: 1 }}>
           <div style={{ background: "#0284c7", color: "white", padding: "8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", marginBottom: "15px" }}><FaFilter /> Filters</div>
           <div style={{ marginBottom: "20px" }}><div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>VESSEL CATEGORY</div>{["Cargo", "Tanker", "Container", "LNG", "Fishing"].map(cat => (<div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155", marginBottom: "6px" }}><input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} /> <span>{cat}</span> <span style={{marginLeft:"auto", color:"#94a3b8", fontSize:"0.7rem"}}>({getCount(cat)})</span></div>))}</div>
           <div><div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>FLAG STATE</div>{["Denmark", "Panama", "Marshall Islands", "Bahamas"].map(flag => (<div key={flag} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155", marginBottom: "6px" }}><input type="checkbox" checked={selectedFlags.includes(flag)} onChange={() => toggleFlag(flag)} /> <span>{flag}</span></div>))}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", gap: "15px" }}>
        <div style={{ flex: 1, position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <MapComponent vessels={filteredVessels} selectedVessel={selectedVessel} setSelectedVessel={setSelectedVessel} safetyZones={activeSafetyZones} />
        </div>
        {selectedVessel ? (
          <div style={{ height: "130px", background: "white", borderRadius: "8px", padding: "20px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}><div style={{ color: "#334155" }}><FaCompass size={24} /></div><div><h3 style={{ margin: "0", color: "#0f172a", fontSize: "1.2rem" }}>{selectedVessel.name}</h3><div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "3px" }}>IMO: {selectedVessel.imo}</div></div></div>
              <div style={{ borderLeft: "1px solid #e2e8f0", height: "60px", margin: "0 20px" }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "40px", flex: 1 }}>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>FLAG</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.flag}</div></div>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>DESTINATION</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.destination}</div></div>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>CARGO TYPE</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.cargo}</div></div>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>POSITION</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.lat.toFixed(4)} N, {selectedVessel.lng.toFixed(4)} E</div></div>
              </div>
          </div>
        ) : (
          <div style={{ height: "130px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", border: "1px solid #e2e8f0", flexDirection: "column", gap: "10px" }}><FaShip size={24} style={{ opacity: 0.3 }} /><span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Select a vessel from the map or list to view live details</span></div>
        )}
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---
const MainDashboard = ({ onLogout, userProfile }) => {
  const [vessels, setVessels] = useState(initialVessels); 
  const [portStats, setPortStats] = useState(initialPortData); 
  const [tradeStats, setTradeStats] = useState(initialTradeData); 
  const [selectedVessel, setSelectedVessel] = useState(null); 
  const [activeTab, setActiveTab] = useState("Dashboard"); 
  const [subView, setSubView] = useState(null); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({ categories: [], flags: [] });
  const [subscribedVessels, setSubscribedVessels] = useState([]);

  const alertedVesselsRef = useRef(new Set());

  // --- UPDATED TABS (ADDED ADMIN TOOLS) ---
  const baseTabs = ["Dashboard", "Vessels", "Ports", "Live Tracking", "Voyages", "History"];
  const tabs = userProfile.role === 'ADMIN' ? [...baseTabs, "Admin Tools"] : baseTabs;

  const addNotification = (title, message, type="info") => { 
     setNotifications(prev => [{ id: Date.now(), title, message, type, time: new Date().toLocaleTimeString() }, ...prev]); 
     toast(message, { icon: type === 'alert' ? '⚠️' : 'ℹ️' }); 
  };

  const toggleSubscription = (vesselId) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (subscribedVessels.includes(vesselId)) { setSubscribedVessels(prev => prev.filter(id => id !== vesselId)); addNotification("Subscription", `Unsubscribed from ${vessel.name}`); }
    else { setSubscribedVessels(prev => [...prev, vesselId]); addNotification("Subscription", `Subscribed to ${vessel.name}`); }
  };

  const handleRefresh = () => { toast.loading("Fetching data...", { duration: 1500 }); setTimeout(() => { setVessels(prev => prev.map(v => ({ ...v, lastUpdate: new Date().toLocaleTimeString() }))); toast.success("Refreshed!"); }, 1500); };
  
  const handleSimulate = () => { 
     setVessels(prev => prev.map(v => ({ ...v, lat: v.lat + (Math.random() - 0.5), lng: v.lng + (Math.random() - 0.5) }))); 
     toast.success("Simulated!"); 
  };

  useEffect(() => {
    const monitorInterval = setInterval(() => {
       vessels.forEach(vessel => {
          activeSafetyZones.forEach(zone => {
             const dist = Math.sqrt(Math.pow(vessel.lat - zone.coords[0], 2) + Math.pow(vessel.lng - zone.coords[1], 2));
             if (dist < 5.0 && !alertedVesselsRef.current.has(vessel.id + zone.id)) {
                 addNotification("Safety Alert", `Vessel ${vessel.name} entered ${zone.type} zone: ${zone.name}`, "alert");
                 alertedVesselsRef.current.add(vessel.id + zone.id); 
             }
          });
       });
       const highlyCongested = portStats.filter(p => p.wait > 40); 
       if (highlyCongested.length > 0 && !alertedVesselsRef.current.has("congestion_alert")) {
           addNotification("Port Congestion Alert", `Critical delays detected at: ${highlyCongested.map(p=>p.name).join(", ")}`, "alert");
           alertedVesselsRef.current.add("congestion_alert");
       }
    }, 5000); 
    return () => clearInterval(monitorInterval);
  }, [vessels, portStats]);

  useEffect(() => {
    const vesselInterval = setInterval(() => { setVessels(prev => prev.map(v => ({ ...v, lat: v.lat + (Math.random() - 0.5) * 0.02, lng: v.lng + (Math.random() - 0.5) * 0.02 }))); }, 3000); 
    return () => clearInterval(vesselInterval);
  }, []);

  if (subView === 'Company') return <CompanyView onBack={() => setSubView(null)} />;
  if (subView === 'Insurer') return <InsurerView onBack={() => setSubView(null)} />;
  if (subView === 'PortAuthority') return <PortAuthorityView onBack={() => setSubView(null)} />;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>
      <div style={{ background: "white", padding: "0px 25px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", height: "70px", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.02)", zIndex: 2000, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ position: "relative", width: "42px", height: "42px", background: "linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.25)", transform: "rotate(-3deg)" }}><FaCompass size={22} color="white" style={{ transform: "rotate(3deg)" }} /></div><h1 style={{ margin: "0", fontSize: "1.4rem", fontWeight: "900", color: "#0f172a" }}>MVTPS</h1></div>
        <div style={{ display: "flex", gap: "30px", fontSize: "0.95rem", fontWeight: "600", color: "#64748b", height: "100%" }}>
            {tabs.map((tab) => (
                <div key={tab} 
                     onClick={() => { setActiveTab(tab); setSelectedVessel(null); }} // <-- AUTO-RESET SELECTION ON TAB SWITCH
                     style={{ display: "flex", alignItems: "center", cursor: "pointer", height: "100%", borderBottom: activeTab === tab ? "3px solid #0ea5e9" : "3px solid transparent", color: activeTab === tab ? "#0ea5e9" : "#64748b" }}>
                     {tab}
                </div>
            ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}><div onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}><FaBell color="#94a3b8" size={20} /></div><div onClick={() => setIsProfileOpen(true)}><span style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#475569" }}>{userProfile.initials}</span></div></div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#f8fafc", position: "relative" }}>
        {activeTab === "Dashboard" && (<HomeCardsView setActiveTab={setActiveTab} portData={portStats} onOpenSubView={setSubView} />)}
        {activeTab === "Vessels" && (<VesselsDatabaseView vessels={vessels} selectedVessel={selectedVessel} setSelectedVessel={setSelectedVessel} subscribedVessels={subscribedVessels} onOpenAlertModal={setIsAlertModalOpen} addNotification={addNotification} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onRefresh={handleRefresh} onSimulate={handleSimulate} isFilterOpen={isFilterOpen} onFilterToggle={() => setIsFilterOpen(!isFilterOpen)} filterCriteria={filterCriteria} setFilterCriteria={setFilterCriteria} onToggleSubscription={toggleSubscription} />)}
        {activeTab === "Ports" && (<PortsAnalyticsView portData={portStats} tradeData={tradeStats} />)}
        {activeTab === "Live Tracking" && (<LiveTrackingView vessels={vessels} selectedVessel={selectedVessel} setSelectedVessel={setSelectedVessel} subscribedVessels={subscribedVessels} onOpenAlertModal={setIsAlertModalOpen} addNotification={addNotification} onUpdatePositions={handleSimulate} />)}
        {activeTab === "Voyages" && (<VoyagesView />)}
        {activeTab === "History" && (<HistoryAuditView vessels={vessels} />)}
        {activeTab === "Admin Tools" && userProfile.role === 'ADMIN' && (<AdminToolsView />)}
      </div>

      {isNotifPanelOpen && <NotificationPanel notifications={notifications} onClose={() => setIsNotifPanelOpen(false)} onClear={() => setNotifications([])} />}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={onLogout} userProfile={userProfile} />
      <AlertSettingsModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} vessel={selectedVessel} isSubscribed={selectedVessel && subscribedVessels.includes(selectedVessel.id)} onToggleSubscription={toggleSubscription} />
      <Toaster />
    </div>
  );
};

const Dashboard = ({ onLogout }) => { 
  const [view, setView] = useState("login"); 
  const [userProfile, setUserProfile] = useState(null);

  const handleLogin = (profile) => {
      setUserProfile(profile);
      setView("dashboard");
      toast.success(`Welcome back, ${profile.role}`);
  };

  if (view === "login") return <LoginView onLogin={handleLogin} />;
  return <MainDashboard onLogout={() => setView("login")} userProfile={userProfile} />;
};

export default Dashboard;