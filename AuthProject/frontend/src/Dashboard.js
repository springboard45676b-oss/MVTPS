import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaShip, FaSearch, FaBell, FaUserCircle, FaTimes, 
  FaSignOutAlt, FaExclamationTriangle, FaWind, FaSkullCrossbones, 
  FaAnchor, FaThLarge, FaClipboardList, FaCompass, 
  FaCheckSquare, FaFilter, FaSyncAlt, FaChartBar, FaLock, FaToggleOn, 
  FaInfoCircle, FaEye, FaEyeSlash, FaPlus, FaSlidersH, FaCircle, 
  FaArrowDown, FaArrowUp, FaExchangeAlt, FaRegBell, FaTrash, FaSpinner, FaExternalLinkAlt 
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis, CartesianGrid, 
  LineChart, Line, Legend, AreaChart, Area 
} from 'recharts';
import MapComponent from "./MapComponent";

// --- IMPORTING DATASET ---
import { initialVessels, initialPortData, initialTradeData, safetyZones } from "./mockData";

const alerts = [
  { id: 1, title: 'Cyclone Warning', loc: 'Pacific (12N, 130E)', icon: <FaWind />, color: '#f59e0b' },
  { id: 2, title: 'Piracy Activity', loc: 'Gulf of Aden', icon: <FaSkullCrossbones />, color: '#ef4444' },
];

const bgImage = "https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=2070&auto=format&fit=crop";

// --- COMPONENTS ---

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
        {notifications.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>No new notifications</div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} style={{ padding: "12px 15px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "12px", alignItems: "start", background: notif.type === "alert" ? "#fff1f2" : "white" }}>
              <div style={{ marginTop: "3px" }}>
                {notif.type === "alert" ? <FaExclamationTriangle color="#ef4444" size={14} /> : <FaInfoCircle color="#3b82f6" size={14} />}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "#334155" }}>{notif.title}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0", lineHeight: "1.3" }}>{notif.message}</div>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>{notif.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AlertSettingsModal = ({ isOpen, onClose, vessel, isSubscribed, onToggleSubscription }) => {
  if (!isOpen || !vessel) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
      <div style={{ background: "white", width: "400px", borderRadius: "12px", padding: "25px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}><FaBell /> Alert Settings</h3>
            <FaTimes style={{ cursor: "pointer", color: "#94a3b8" }} onClick={onClose} />
         </div>
         <h4 style={{margin:"0 0 15px 0", color:"#1e293b"}}>{vessel.name}</h4>
         
         <div style={{ background: isSubscribed ? "#f0fdf4" : "#f8fafc", padding: "15px", borderRadius: "8px", border: isSubscribed ? "1px solid #bbf7d0" : "1px solid #e2e8f0", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor:"pointer" }} onClick={() => onToggleSubscription(vessel.id)}>
            <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: isSubscribed ? "#166534" : "#64748b" }}>
                    {isSubscribed ? "Alerts Active" : "Alerts Disabled"}
                </div>
                <div style={{ fontSize: "0.75rem", color: isSubscribed ? "#15803d" : "#94a3b8" }}>
                    {isSubscribed ? "You are receiving live updates" : "Click to enable notifications"}
                </div>
            </div>
            <FaToggleOn size={30} color={isSubscribed ? "#16a34a" : "#cbd5e1"} style={{transform: isSubscribed ? "none" : "rotate(180deg)", transition: "all 0.3s"}} />
         </div>

         <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#64748b", marginBottom: "8px", fontWeight: "600" }}>Notification Type</label>
            <select disabled={!isSubscribed} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem", color: "#334155", background: isSubscribed ? "white" : "#f1f5f9" }}>
                <option>All Events (Weather, Delay, Route)</option>
                <option>Critical Only (Piracy, Mayday)</option>
            </select>
         </div>
         <button onClick={onClose} style={{ width: "100%", background: "#0f172a", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Done
         </button>
      </div>
    </div>
  );
};

const ProfileModal = ({ isOpen, onClose, onLogout, userProfile }) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
      <div style={{ background: "white", width: "600px", padding: "40px", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
           <div><h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.5rem" }}>Edit Profile</h2><p style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>Manage your account settings and preferences</p></div>
           <button onClick={onClose} style={{border:"none", background:"#f1f5f9", borderRadius: "50%", width:"32px", height:"32px", cursor:"pointer", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center"}}><FaTimes /></button>
        </div>
        <div style={{ background: "#fff7ed", borderLeft: "4px solid #f97316", borderRadius: "4px", padding: "15px", marginBottom: "25px", display: "flex", gap: "15px", alignItems: "flex-start" }}>
           <FaInfoCircle color="#f97316" style={{ marginTop: "4px" }} />
           <div><div style={{ color: "#9a3412", fontWeight: "bold", fontSize: "0.9rem" }}>System Notice: Limited Access</div><div style={{ color: "#c2410c", fontSize: "0.8rem", marginTop: "4px", lineHeight: "1.4" }}>Your current role as <strong>{userProfile.role}</strong> restricts modification of sensitive data. Please contact the IT Admin for role escalation.</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
           <div><label style={{ display: "block", fontSize: "0.85rem", color: "#475569", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Username</label><input type="text" value={userProfile.name} disabled style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#f8fafc", color: "#334155", boxSizing:"border-box" }} /></div>
           <div><label style={{ display: "block", fontSize: "0.85rem", color: "#475569", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Email Address</label><input type="text" value="user@mvtps.com" disabled style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#f8fafc", color: "#334155", boxSizing:"border-box" }} /></div>
        </div>
        <div style={{ marginBottom: "20px" }}>
           <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Role Assignment</label>
           <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", color: "#0369a1", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}><FaLock size={12} /> {userProfile.role}</div>
        </div>
        <div style={{ marginBottom: "30px" }}>
           <label style={{ display: "block", fontSize: "0.85rem", color: "#475569", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Security Password</label>
           <div style={{ position: "relative" }}>
             <input type={showPassword ? "text" : "password"} value="SecretPassword123" disabled style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", boxSizing:"border-box" }} />
             <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "14px", color: "#94a3b8", cursor: "pointer" }}>{showPassword ? <FaEyeSlash /> : <FaEye />}</div>
           </div>
        </div>
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "25px", display: "flex", justifyContent: "space-between", gap: "10px" }}>
           <button onClick={onLogout} style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#e11d48", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display:"flex", alignItems:"center", gap:"8px" }}><FaSignOutAlt /> Sign Out</button>
           <button onClick={onClose} style={{ background: "#0f172a", border: "none", color: "white", padding: "10px 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Save Changes</button>
        </div>
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

// 4. PORTS ANALYTICS VIEW (UPDATED)
const PortsAnalyticsView = ({ portData, tradeData }) => {
  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px", height: "100%", overflowY: "auto" }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
           <h2 style={{ color: "#0f172a", marginBottom: "5px", fontSize: "2rem" }}>Port Analytics & UNCTAD Stats</h2>
           <p style={{ color: "#64748b", margin: 0 }}>Real-time UNCTAD trade statistics, congestion, and connectivity monitoring.</p>
        </div>
        <a href="https://unctadstat.unctad.org/datacentre/" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", background: "#0ea5e9", color: "white", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", display:"flex", alignItems:"center", gap:"10px" }}>
            <FaExternalLinkAlt /> UNCTAD Data Source
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
         <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Global Average Wait Time</div>
            <div style={{ fontSize: "2rem", color: "#0f172a", fontWeight: "bold", margin: "10px 0" }}>18.5 Hrs</div>
            <div style={{ color: "#16a34a", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }}><FaArrowDown /> 2.1% from last week</div>
         </div>
         <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Connectivity Index (LSCI)</div>
            <div style={{ fontSize: "2rem", color: "#2563eb", fontWeight: "bold", margin: "10px 0" }}>142.5</div>
            <div style={{ color: "#2563eb", fontSize: "0.8rem" }}>UNCTAD Top Tier</div>
         </div>
         <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Port Efficiency Score</div>
            <div style={{ fontSize: "2rem", color: "#16a34a", fontWeight: "bold", margin: "10px 0" }}>87/100</div>
            <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Based on Throughput</div>
         </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", minHeight: "300px" }}>
         <div style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h4 style={{ margin: "0 0 20px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}><FaExchangeAlt /> Trade Volume (Imports vs Exports)</h4>
            <ResponsiveContainer width="100%" height={250}>
               <AreaChart data={tradeData}>
                  <defs>
                    <linearGradient id="colorImport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="import" stroke="#8884d8" fillOpacity={1} fill="url(#colorImport)" />
                  <Area type="monotone" dataKey="export" stroke="#82ca9d" fillOpacity={1} fill="url(#colorExport)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         <div style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h4 style={{ margin: "0 0 20px 0", color: "#334155" }}>Average Vessel Wait Time (Hrs)</h4>
            <ResponsiveContainer width="100%" height={250}>
               <BarChart data={portData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="wait" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                    {portData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.wait > 30 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* CHARTS ROW 2 - ADDED ARRIVALS/DEPARTURES */}
      <div style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
         <h4 style={{ margin: "0 0 20px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}><FaSyncAlt /> Port Traffic Flow (Arrivals vs Departures)</h4>
         <div style={{ width: "100%", height: "250px" }}>
            <ResponsiveContainer>
               <BarChart data={portData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="arrivals" name="Arrivals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="departures" name="Departures" fill="#f59e0b" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

const HomeCardsView = ({ setActiveTab, portData }) => {
  const cardStyle = {
    background: "white", borderRadius: "12px", padding: "25px", cursor: "pointer",
    transition: "transform 0.2s, boxShadow 0.2s", border: "1px solid #e2e8f0",
    display: "flex", flexDirection: "column", justifyContent: "space-between", height: "140px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px" }}>
      <div>
        <h2 style={{ color: "#0f172a", marginBottom: "10px", fontSize: "2.5rem" }}>Welcome, Admin Dashboard</h2>
        <p style={{ color: "#64748b", margin: 0, fontSize: "1.2rem", fontWeight: "500" }}>Overview of key operational metrics and alerts.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
        <div style={cardStyle} onClick={() => setActiveTab('Live Tracking')}><div><FaShip size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Live Tracking</div><div style={{fontSize: "0.9rem", color: "#64748b", marginTop: "5px"}}>Real-time map</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Vessels')}><div><FaClipboardList size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Vessels Database</div><div style={{fontSize: "0.9rem", color: "#64748b", marginTop: "5px"}}>Fleet details</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Ports')}><div><FaAnchor size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Ports</div><div style={{fontSize: "0.9rem", color: "#64748b", marginTop: "5px"}}>Port management</div></div></div>
        <div style={cardStyle} onClick={() => setActiveTab('Vessels')}><div><FaBell size={28} color="#0ea5e9" style={{marginBottom: "15px"}} /><div style={{fontWeight: "800", color: "#1e293b", fontSize: "1.2rem"}}>Notifications</div><div style={{fontSize: "0.9rem", color: "#64748b", marginTop: "5px"}}>System alerts</div></div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", height: "350px" }}>
         <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h4 style={{ margin: "0 0 20px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}><FaChartBar /> Port Congestion Analysis</h4>
            <div style={{ width: "100%", height: "250px" }}>
              <ResponsiveContainer><BarChart data={portData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 12}} /><YAxis /><Tooltip /><Bar dataKey="wait" name="Wait Time (Hrs)" fill="#3b82f6" radius={[4, 4, 0, 0]}>{portData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.wait > 30 ? '#ef4444' : '#3b82f6'} />))}</Bar></BarChart></ResponsiveContainer>
            </div>
         </div>
         <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflowY: "auto" }}>
            <h4 style={{ margin: "0 0 20px 0", color: "#ef4444", display: "flex", alignItems: "center", gap: "10px" }}><FaExclamationTriangle /> Active Safety Alerts</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>{alerts.map(alert => (<div key={alert.id} style={{ padding: "15px", background: "#fff1f2", borderRadius: "8px", borderLeft: `4px solid ${alert.color}` }}><div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#9f1239", fontSize: "0.95rem" }}>{alert.icon} {alert.title}</div><div style={{ marginLeft: "26px", fontSize: "0.85rem", color: "#be123c", marginTop: "5px" }}>{alert.loc}</div></div>))}</div>
         </div>
      </div>
    </div>
  );
};

const VesselsDatabaseView = ({ vessels, selectedVessel, setSelectedVessel, subscribedVessels, onOpenAlertModal, addNotification, searchQuery, setSearchQuery, onRefresh, onSimulate, isFilterOpen, onFilterToggle, filterCriteria, setFilterCriteria }) => {
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
                       <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>VESSEL TYPE</div>
                       <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>{["Cargo", "Tanker", "Container", "LNG"].map(cat => (<div key={cat} onClick={() => toggleFilterCategory(cat)} style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "4px", background: filterCriteria.categories.includes(cat) ? "#2563eb" : "white", color: filterCriteria.categories.includes(cat) ? "white" : "#475569", border: "1px solid #cbd5e1", cursor: "pointer" }}>{cat}</div>))}</div>
                       <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>FLAG</div>
                       <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>{["Panama", "Denmark", "Marshall Islands", "Bahamas"].map(flag => (<div key={flag} onClick={() => toggleFilterFlag(flag)} style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "4px", background: filterCriteria.flags.includes(flag) ? "#2563eb" : "white", color: filterCriteria.flags.includes(flag) ? "white" : "#475569", border: "1px solid #cbd5e1", cursor: "pointer" }}>{flag}</div>))}</div>
                   </div>
               )}
            </div>
            <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>Showing {filteredVessels.length} of {vessels.length} vessels</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
               {filteredVessels.map(ship => (
                  <div key={ship.id} onClick={() => setSelectedVessel(ship)} style={{ padding: "15px", marginBottom: "10px", borderRadius: "8px", cursor: "pointer", border: selectedVessel.id === ship.id ? "1px solid #2563eb" : "1px solid transparent", background: selectedVessel.id === ship.id ? "#eff6ff" : "white", borderLeft: selectedVessel.id === ship.id ? "4px solid #2563eb" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div><div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#1e293b" }}>{ship.name}</div><div style={{ fontSize: "0.8rem", color: "#64748b" }}>IMO: {ship.imo}</div></div>
                     {subscribedVessels.includes(ship.id) && <FaBell color="#16a34a" />}
                  </div>
               ))}
            </div>
         </div>
         <div style={{ flex: 1, background: "white", borderRadius: "10px", padding: "0", overflowY: "auto", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "25px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
               <h4 style={{ margin: "0 0 20px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}><FaAnchor /> Vessel Details</h4>
               {selectedVessel && (
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div><h1 style={{ margin: "0", color: "#1e293b", fontSize: "1.8rem" }}>{selectedVessel.name}</h1><p style={{ margin: "5px 0 0 0", color: "#64748b" }}>IMO: {selectedVessel.imo}</p></div>
                      <button onClick={() => onOpenAlertModal(true)} style={{ background: subscribedVessels.includes(selectedVessel.id) ? "#dcfce7" : "#e0f2fe", color: subscribedVessels.includes(selectedVessel.id) ? "#166534" : "#0284c7", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>{subscribedVessels.includes(selectedVessel.id) ? <><FaBell /> Subscribed</> : <><FaRegBell /> Enable Alerts</>}</button>
                   </div>
               )}
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

const LiveTrackingView = ({ vessels, selectedVessel, setSelectedVessel, subscribedVessels, onOpenAlertModal, addNotification, onUpdatePositions }) => {
  const [selectedCategories, setSelectedCategories] = useState(["Cargo", "Tanker", "Container", "LNG"]);
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false); // Local state for button spinner

  const filteredVessels = vessels.filter(ship => {
    const typeMatch = selectedCategories.length === 0 || selectedCategories.some(cat => ship.type.includes(cat));
    const flagMatch = selectedFlags.length === 0 || selectedFlags.includes(ship.flag);
    return typeMatch && flagMatch;
  });

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
      addNotification("Filter Updated", `Hidden category: ${cat}`, "info");
    } else {
      setSelectedCategories(prev => [...prev, cat]);
      addNotification("Filter Updated", `Shown category: ${cat}`, "info");
    }
  };

  const toggleFlag = (flag) => {
    if (selectedFlags.includes(flag)) {
      setSelectedFlags(prev => prev.filter(f => f !== flag));
      addNotification("Filter Updated", `Hidden flag: ${flag}`, "info");
    } else {
      setSelectedFlags(prev => [...prev, flag]);
      addNotification("Filter Updated", `Shown flag: ${flag}`, "info");
    }
  };

  const handleUpdateClick = () => {
      setIsUpdating(true);
      // Call the parent handler
      onUpdatePositions();
      // Reset loading state after a delay
      setTimeout(() => setIsUpdating(false), 1000);
  };

  const getCount = (cat) => vessels.filter(v => v.type.includes(cat)).length;

  return (
    <div style={{ display: "flex", width: "100%", padding: "20px", gap: "20px", height: "100%" }}>
      <div style={{ width: "300px", background: "white", borderRadius: "8px", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <div style={{ padding: "20px", background: "#0ea5e9", color: "white", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}><h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }}><FaThLarge /> MaritimeTrack</h3><div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Live Vessel Tracking</div></div>
        <div style={{ padding: "15px" }}>
            <button 
                onClick={handleUpdateClick} 
                disabled={isUpdating}
                style={{ width: "100%", background: isUpdating ? "#94a3b8" : "#0ea5e9", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: isUpdating ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.3s" }}
            >
                {isUpdating ? <FaSpinner className="spin" /> : <FaSyncAlt />} 
                {isUpdating ? "Updating..." : "Update All Positions"}
            </button>
        </div>
        <div style={{ padding: "0 15px 15px 15px", overflowY: "auto", flex: 1 }}>
           <div style={{ background: "#0284c7", color: "white", padding: "8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", marginBottom: "15px" }}><FaFilter /> Filters</div>
           <div style={{ marginBottom: "20px" }}><div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>VESSEL CATEGORY</div>{["Cargo", "Tanker", "Container", "LNG", "Fishing"].map(cat => (<div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155", marginBottom: "6px" }}><input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} /> <span>{cat}</span> <span style={{marginLeft:"auto", color:"#94a3b8", fontSize:"0.7rem"}}>({getCount(cat)})</span></div>))}</div>
           <div><div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>FLAG STATE</div>{["Denmark", "Panama", "Marshall Islands", "Bahamas"].map(flag => (<div key={flag} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155", marginBottom: "6px" }}><input type="checkbox" checked={selectedFlags.includes(flag)} onChange={() => toggleFlag(flag)} /> <span>{flag}</span></div>))}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", gap: "15px" }}>
        <div style={{ flex: 1, position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            {/* PASSING SAFETY ZONES TO MAP COMPONENT */}
            <MapComponent vessels={filteredVessels} selectedVessel={selectedVessel} setSelectedVessel={setSelectedVessel} safetyZones={safetyZones} />
        </div>
        {selectedVessel && (
          <div style={{ height: "130px", background: "white", borderRadius: "8px", padding: "20px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}><div style={{ color: "#334155" }}><FaCompass size={24} /></div><div><h3 style={{ margin: "0", color: "#0f172a", fontSize: "1.2rem" }}>{selectedVessel.name}</h3><div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "3px" }}>IMO: {selectedVessel.imo}</div></div></div>
              <div style={{ borderLeft: "1px solid #e2e8f0", height: "60px", margin: "0 20px" }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "40px", flex: 1 }}>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>FLAG</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.flag}</div></div>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>DESTINATION</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.destination}</div></div>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>CARGO TYPE</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.cargo}</div></div>
                 <div><div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#94a3b8" }}>POSITION</div><div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155" }}>{selectedVessel.lat.toFixed(4)} N, {selectedVessel.lng.toFixed(4)} E</div></div>
              </div>
              <div style={{ marginLeft: "20px" }}><button onClick={() => onOpenAlertModal(true)} style={{ background: "#e0f2fe", color: "#0284c7", border: "none", padding: "10px 15px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}><FaBell /> Enable Alerts</button></div>
          </div>
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
  const [selectedVessel, setSelectedVessel] = useState(initialVessels[0]); // Default to first ship
  const [activeTab, setActiveTab] = useState("Dashboard"); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

  // States for VesselDatabase View
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({ categories: [], flags: [] });

  const [subscribedVessels, setSubscribedVessels] = useState(() => {
    const saved = localStorage.getItem("subscribedVessels");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("subscribedVessels", JSON.stringify(subscribedVessels));
  }, [subscribedVessels]);

  const addNotification = (title, message, type="info") => {
    const newNotif = { id: Date.now(), title, message, type, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [newNotif, ...prev]);
    toast(message, { icon: type === 'alert' ? '⚠️' : 'ℹ️', position: 'top-center' });
  };

  const toggleSubscription = (vesselId) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (subscribedVessels.includes(vesselId)) {
        setSubscribedVessels(prev => prev.filter(id => id !== vesselId));
        addNotification("Subscription", `Unsubscribed from ${vessel.name}`, "info");
    } else {
        setSubscribedVessels(prev => [...prev, vesselId]);
        addNotification("Subscription", `Subscribed to ${vessel.name}`, "info");
    }
  };

  // --- BUTTON ACTIONS ---
  const handleRefresh = () => {
      toast.loading("Fetching latest satellite data...", { duration: 1500 });
      setTimeout(() => {
          setVessels(prev => prev.map(v => ({ ...v, lastUpdate: new Date().toLocaleTimeString() + " UTC" })));
          toast.dismiss();
          toast.success("Fleet data refreshed!");
      }, 1500);
  };

  // UPDATED: handleSimulate also updates positions immediately
  const handleSimulate = () => {
      // 1. Move ships randomly
      setVessels(prev => prev.map(v => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 2, 
          lng: v.lng + (Math.random() - 0.5) * 2,
          speed: (Math.random() * 20).toFixed(1)
      })));
      // 2. Randomize Port Stats
      setPortStats(prev => prev.map(p => ({ ...p, wait: Math.max(1, Math.floor(Math.random() * 40)) })));
      toast.success("Positions & Stats Updated", { icon: "🚀" });
  };

  // --- BACKGROUND SIMULATION ENGINE ---
  useEffect(() => {
    const vesselInterval = setInterval(() => {
      setVessels(prevVessels => prevVessels.map(v => ({
        ...v,
        lat: v.lat + (Math.random() - 0.5) * 0.02, 
        lng: v.lng + (Math.random() - 0.5) * 0.02
      })));
    }, 3000); 

    const portInterval = setInterval(() => {
      setPortStats(prevStats => prevStats.map(p => ({
        ...p,
        wait: Math.max(2, p.wait + Math.floor((Math.random() - 0.5) * 3))
      })));
    }, 5000); 

    return () => {
      clearInterval(vesselInterval);
      clearInterval(portInterval);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>
      {/* HEADER */}
      <div style={{ background: "white", padding: "0px 25px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", height: "70px", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.02)", zIndex: 2000, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{ position: "relative", width: "42px", height: "42px", background: "linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.25)", transform: "rotate(-3deg)" }}><FaCompass size={22} color="white" style={{ transform: "rotate(3deg)" }} /></div>
           <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}><h1 style={{ margin: "0", fontSize: "1.4rem", fontWeight: "900", background: "linear-gradient(to right, #0f172a, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.5px", lineHeight: "1" }}>MVTPS</h1></div>
        </div>
        <div style={{ display: "flex", gap: "30px", fontSize: "0.95rem", fontWeight: "600", color: "#64748b", height: "100%" }}>{["Dashboard", "Vessels", "Ports", "Live Tracking"].map((tab) => (<div key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", cursor: "pointer", height: "100%", borderBottom: activeTab === tab ? "3px solid #0ea5e9" : "3px solid transparent" }}>{tab}</div>))}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}><FaBell color="#94a3b8" size={20} />{notifications.length > 0 && <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "16px", height: "16px", background: "red", borderRadius: "50%", color: "white", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{notifications.length}</div>}</div>
           <div style={{ width: "36px", height: "36px", background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} onClick={() => setIsProfileOpen(true)}><span style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#475569" }}>{userProfile.initials}</span></div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#f8fafc", position: "relative" }}>
        {activeTab === "Dashboard" && (<HomeCardsView setActiveTab={setActiveTab} portData={portStats} />)}
        {activeTab === "Vessels" && (
            <VesselsDatabaseView 
                vessels={vessels} 
                selectedVessel={selectedVessel} 
                setSelectedVessel={setSelectedVessel} 
                subscribedVessels={subscribedVessels} 
                onOpenAlertModal={setIsAlertModalOpen} 
                addNotification={addNotification}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={handleRefresh}
                onSimulate={handleSimulate}
                isFilterOpen={isFilterOpen}
                onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
                filterCriteria={filterCriteria}
                setFilterCriteria={setFilterCriteria}
            />
        )}
        {activeTab === "Ports" && (<PortsAnalyticsView portData={portStats} tradeData={tradeStats} />)}
        {activeTab === "Live Tracking" && (
            <LiveTrackingView 
                vessels={vessels} 
                selectedVessel={selectedVessel} 
                setSelectedVessel={setSelectedVessel} 
                subscribedVessels={subscribedVessels} 
                onOpenAlertModal={setIsAlertModalOpen} 
                addNotification={addNotification}
                onUpdatePositions={handleSimulate} // WIRED UP HERE
            />
        )}
      </div>
      {isNotifPanelOpen && <NotificationPanel notifications={notifications} onClose={() => setIsNotifPanelOpen(false)} onClear={() => setNotifications([])} />}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={onLogout} userProfile={userProfile} />
      <AlertSettingsModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} vessel={selectedVessel} isSubscribed={selectedVessel ? subscribedVessels.includes(selectedVessel.id) : false} onToggleSubscription={toggleSubscription} />
      <Toaster />
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [view, setView] = useState("profile");
  const [userProfile, setUserProfile] = useState({ name: "Loading...", role: "...", initials: ".." });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/dashboard/", { headers: { Authorization: `Bearer ${token}` } });
        let displayName = "Akhila T.", displayInitials = "AT";
        if(res.data.username === "operator_user") { displayName = "Vessel Operator"; displayInitials = "VO"; }
        if(res.data.username === "admin_user") { displayName = "System Admin"; displayInitials = "SA"; }
        setUserProfile({ name: displayName, role: res.data.role.toUpperCase(), initials: displayInitials });
      } catch (err) {
        setUserProfile({ name: "Akhila T.", role: "SENIOR ANALYST", initials: "AT" });
      }
    };
    fetchProfile();
  }, []);

  if (view === "profile") return <ProfileView onEnterDashboard={() => setView("dashboard")} userProfile={userProfile} />;
  return <MainDashboard onLogout={onLogout} userProfile={userProfile} />;
};

export default Dashboard;