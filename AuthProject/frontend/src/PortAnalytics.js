import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, 
  AreaChart, Area 
} from 'recharts';
import { FaExchangeAlt, FaShip, FaAnchor } from 'react-icons/fa';

const PortAnalytics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/port-stats/')
      .then(res => {
        if (!res.ok) throw new Error("Backend Connection Failed");
        return res.json();
      })
      .then(fetchedData => setData(fetchedData))
      .catch(err => {
        console.error("Fetch Error:", err);
        setError("Could not connect to Django. Is the server running?");
      });
  }, []);

  // LOADING STATE
  if (error) return <div className="p-10 text-red-600 font-bold text-center">{error}</div>;
  if (!data) return <div className="p-10 text-blue-600 font-bold text-center text-xl">Loading Live UNCTAD Data...</div>;

  // DATA IS READY
  const { kpi, charts } = data;
  const congestedPorts = charts.port_data.filter(p => p.wait > 3).length;

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER - BUTTON IS GONE */}
      <div style={{ marginBottom: "30px" }}>
           <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#0f172a", marginBottom: "5px" }}>Port Analytics & UNCTAD Stats</h2>
           <p style={{ color: "#64748b", fontSize: "1rem" }}>
             Real-time maritime trade statistics & congestion monitoring.
           </p>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px", marginBottom:"30px" }}>
         
         {/* LSCI CARD */}
         <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #2563eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>CONNECTIVITY INDEX (LSCI)</div>
                <FaAnchor style={{ color: "#2563eb", opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: "2.5rem", color: "#0f172a", fontWeight: "800" }}>{kpi.connectivity_index}</div>
            <div style={{ color: "#16a34a", fontSize: "0.9rem", fontWeight: "500", marginTop: "5px" }}>
               Official UNCTAD Score ({kpi.connectivity_year})
            </div>
         </div>

         {/* TRAFFIC CARD */}
         <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #8b5cf6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>PORT THROUGHPUT</div>
                <FaExchangeAlt style={{ color: "#8b5cf6", opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: "2.5rem", color: "#0f172a", fontWeight: "800" }}>{kpi.port_traffic}</div>
            <div style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "5px" }}>
               {kpi.traffic_year} Total Volume
            </div>
         </div>
         
         {/* CONGESTION CARD */}
         <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: congestedPorts > 0 ? "5px solid #ef4444" : "5px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>CONGESTION ALERT</div>
                <FaShip style={{ color: congestedPorts > 0 ? "#ef4444" : "#10b981", opacity: 0.5 }} />
            </div>
            <div style={{ fontSize: "2.5rem", color: "#0f172a", fontWeight: "800" }}>{congestedPorts} Ports</div>
            <div style={{ color: congestedPorts > 0 ? "#ef4444" : "#10b981", fontSize: "0.9rem", fontWeight: "500", marginTop: "5px" }}>
               {congestedPorts > 0 ? "Exceeding Wait Thresholds" : "Traffic Flow Normal"}
            </div>
         </div>
      </div>

      {/* CHARTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
         <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h4 style={{ marginBottom: "20px", color: "#334155", fontWeight: "600" }}>Global Trade Volume Trends</h4>
            <ResponsiveContainer width="100%" height={280}>
               <AreaChart data={charts.trade_data}>
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
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Legend />
                  <Area type="monotone" dataKey="import" stroke="#8884d8" fillOpacity={1} fill="url(#colorImport)" />
                  <Area type="monotone" dataKey="export" stroke="#82ca9d" fillOpacity={1} fill="url(#colorExport)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         
         <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h4 style={{ marginBottom: "20px", color: "#334155", fontWeight: "600" }}>Vessel Wait Times (Hrs)</h4>
            <ResponsiveContainer width="100%" height={280}>
               <BarChart data={charts.port_data}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="wait" radius={[6, 6, 0, 0]} barSize={40}>
                    {charts.port_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.wait > 3 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default PortAnalytics;