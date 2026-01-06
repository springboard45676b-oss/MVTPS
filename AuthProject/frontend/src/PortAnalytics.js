// --- DYNAMIC PORTS ANALYTICS VIEW ---
const PortsAnalyticsView = ({ portData, tradeData }) => {
  // 1. CALCULATE REAL METRICS FROM DATA (Data Types Implementation)
  const totalWait = portData.reduce((acc, curr) => acc + curr.wait, 0);
  const avgWait = (totalWait / portData.length).toFixed(1); // One decimal place

  const totalArrivals = portData.reduce((acc, curr) => acc + curr.arrivals, 0);
  const totalDepartures = portData.reduce((acc, curr) => acc + curr.departures, 0);
  const efficiencyScore = Math.round((totalArrivals / (totalArrivals + totalDepartures)) * 100); // Simple mock efficiency logic

  const congestedPorts = portData.filter(p => p.wait > 30).length;

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px", height: "100%", overflowY: "auto" }}>
      
      {/* HEADER WITH UNCTAD LINK */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
           <h2 style={{ color: "#0f172a", marginBottom: "5px", fontSize: "2rem" }}>Port Analytics & UNCTAD Stats</h2>
           <p style={{ color: "#64748b", margin: 0 }}>Real-time calculated metrics from live port feeds.</p>
        </div>
        <a href="https://unctadstat.unctad.org/datacentre/" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", background: "#0ea5e9", color: "white", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", display:"flex", alignItems:"center", gap:"10px" }}>
            <FaExternalLinkAlt /> UNCTAD Data Source
        </a>
      </div>

      {/* DYNAMIC KPI CARDS (Now linked to Data Types) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
         
         {/* CARD 1: AVERAGE WAIT TIME */}
         <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: avgWait > 20 ? "5px solid #f59e0b" : "5px solid #10b981" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Global Average Wait Time</div>
            <div style={{ fontSize: "2rem", color: "#0f172a", fontWeight: "bold", margin: "10px 0" }}>{avgWait} Hrs</div>
            <div style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px", color: avgWait > 20 ? "#d97706" : "#16a34a" }}>
                {avgWait > 20 ? <FaArrowUp /> : <FaArrowDown />} 
                {avgWait > 20 ? "Above Average" : "Optimal Efficiency"}
            </div>
         </div>

         {/* CARD 2: CONGESTION ALERTS */}
         <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: congestedPorts > 0 ? "5px solid #ef4444" : "5px solid #2563eb" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>High Congestion Ports</div>
            <div style={{ fontSize: "2rem", color: congestedPorts > 0 ? "#ef4444" : "#2563eb", fontWeight: "bold", margin: "10px 0" }}>{congestedPorts}</div>
            <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Ports with wait > 30 hrs</div>
         </div>

         {/* CARD 3: TRAFFIC VOLUME */}
         <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #3b82f6" }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Total Vessel Movements</div>
            <div style={{ fontSize: "2rem", color: "#0f172a", fontWeight: "bold", margin: "10px 0" }}>{totalArrivals + totalDepartures}</div>
            <div style={{ color: "#16a34a", fontSize: "0.8rem" }}>{totalArrivals} Arrivals / {totalDepartures} Departures</div>
         </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", minHeight: "300px" }}>
         <div style={{ background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h4 style={{ margin: "0 0 20px 0", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}><FaExchangeAlt /> Trade Volume (UNCTAD)</h4>
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
                    {/* Visual Alert Logic: Red if > 30 */}
                    {portData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.wait > 30 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* CHARTS ROW 2: ARRIVALS vs DEPARTURES */}
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