import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

const StakeholderAnalytics = () => {
  const [role, setRole] = useState('company');

  // --- DATA SOURCES ---
  const fuelEfficiency = [
    { name: 'Vessel A', consumption: 45, speed: 12 },
    { name: 'Vessel B', consumption: 52, speed: 14 },
    { name: 'Vessel C', consumption: 38, speed: 11 },
    { name: 'Vessel D', consumption: 65, speed: 18 },
  ];

  const yardData = [
    { sector: 'Alpha', load: 85 }, { sector: 'Bravo', load: 40 },
    { sector: 'Charlie', load: 92 }, { sector: 'Delta', load: 60 },
  ];

  const riskData = [
    { name: 'In Storm', value: 3, color: '#ef4444' },
    { name: 'High Traffic', value: 5, color: '#f59e0b' },
    { name: 'Safe Path', value: 12, color: '#10b981' },
  ];

  const styles = {
    container: { padding: '30px', background: '#f8fafc', minHeight: '100vh' },
    card: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
    tabBtn: (active) => ({
      padding: '10px 20px', marginRight: '10px', borderRadius: '8px', cursor: 'pointer',
      border: 'none', background: active ? '#0f172a' : '#e2e8f0', color: active ? '#fff' : '#475569',
      fontWeight: 'bold', transition: '0.3s'
    })
  };

  return (
    <div style={styles.container}>
      {/* ROLE SWITCHER */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0 }}>Analytics Center</h1>
          <p style={{ color: '#64748b' }}>Switch views to see stakeholder-specific metrics.</p>
        </div>
        <div>
          <button style={styles.tabBtn(role === 'company')} onClick={() => setRole('company')}>🏢 Company</button>
          <button style={styles.tabBtn(role === 'port')} onClick={() => setRole('port')}>⚓ Port</button>
          <button style={styles.tabBtn(role === 'insurer')} onClick={() => setRole('insurer')}>🛡️ Insurer</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* --- COMPANY VIEW: Fleet & Profit --- */}
        {role === 'company' && (
          <>
            <div style={styles.card}>
              <h3>Fuel Efficiency (Consumption vs knots)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={fuelEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="consumption" stroke="#3b82f6" fill="#bfdbfe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.card}>
              <h3>Operating Margin</h3>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '60px', color: '#10b981', margin: 0 }}>$4.2M</h1>
                <p>Quarterly Profit Forecast</p>
              </div>
            </div>
          </>
        )}

        {/* --- PORT VIEW: Congestion & Logistics --- */}
        {role === 'port' && (
          <>
            <div style={styles.card}>
              <h3>Yard Density by Sector (%)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yardData}>
                  <XAxis dataKey="sector" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="load" radius={[5, 5, 0, 0]}>
                    {yardData.map((entry, index) => (
                      <Cell key={index} fill={entry.load > 80 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.card}>
              <h3>Average Vessel Turnaround</h3>
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1 style={{ margin: 0 }}>14.2 hrs</h1>
                <p style={{ color: '#ef4444' }}>⚠️ 12% slower than target</p>
              </div>
            </div>
          </>
        )}

        {/* --- INSURER VIEW: Risk & Liability --- */}
        {role === 'insurer' && (
          <>
            <div style={styles.card}>
              <h3>Fleet Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {riskData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.card}>
              <h3>Compliance Audit Log</h3>
              <div style={{ fontSize: '12px' }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>🚢 <b>Ever Ace:</b> No speed violations in ECA zones. <span style={{ color: 'green' }}>PASSED</span></div>
                <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>🚢 <b>Maersk H:</b> Minor AIS downtime (4m). <span style={{ color: 'orange' }}>FLAGGED</span></div>
                <div style={{ padding: '10px' }}>🚢 <b>Nordic T:</b> Entering Sanctioned Waters. <span style={{ color: 'red' }}>ALERT</span></div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default StakeholderAnalytics;