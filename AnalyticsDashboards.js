import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';

const AnalyticsDashboards = () => {
  const [activeTab, setActiveTab] = useState('company');

  // --- MOCK DATA ---
  const fuelData = [
    { day: 'Mon', consumption: 400, speed: 14 },
    { day: 'Tue', consumption: 300, speed: 12 },
    { day: 'Wed', consumption: 600, speed: 18 },
    { day: 'Thu', consumption: 800, speed: 19 },
    { day: 'Fri', consumption: 500, speed: 15 },
  ];

  const yardData = [
    { name: 'Sec A', occupancy: 90 },
    { name: 'Sec B', occupancy: 70 },
    { name: 'Sec C', occupancy: 85 },
    { name: 'Sec D', occupancy: 40 },
  ];

  const riskDistribution = [
    { name: 'Safe', value: 8, color: '#10b981' },
    { name: 'Warning', value: 3, color: '#f59e0b' },
    { name: 'Critical', value: 2, color: '#ef4444' },
  ];

  const styles = {
    container: { padding: '30px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    nav: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0' },
    tab: (active) => ({
      padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
      color: active ? '#2563eb' : '#64748b',
      borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
      transition: '0.3s'
    }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' },
    card: { background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={styles.container}>
      {/* Header & Navigation */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Stakeholder Analytics</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Milestone 4: Data Visualization & Audit</p>
      </div>

      <div style={styles.nav}>
        <div style={styles.tab(activeTab === 'company')} onClick={() => setActiveTab('company')}>Ship Owner</div>
        <div style={styles.tab(activeTab === 'port')} onClick={() => setActiveTab('port')}>Port Authority</div>
        <div style={styles.tab(activeTab === 'insurer')} onClick={() => setActiveTab('insurer')}>Insurer</div>
      </div>

      <div style={styles.grid}>
        
        {/* --- COMPANY VIEW --- */}
        {activeTab === 'company' && (
          <>
            <div style={styles.card}>
              <h4>Fuel Consumption vs. Fleet Speed</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fuelData}>
                    <defs>
                      <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="consumption" stroke="#2563eb" fillOpacity={1} fill="url(#colorFuel)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={styles.card}>
              <h4>Fleet Distribution</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* --- PORT VIEW --- */}
        {activeTab === 'port' && (
          <>
            <div style={styles.card}>
              <h4>Yard Occupancy by Sector (%)</h4>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yardData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="occupancy" radius={[4, 4, 0, 0]}>
                      {yardData.map((entry, index) => (
                        <Cell key={index} fill={entry.occupancy > 80 ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={styles.card}>
              <h4>Turnaround KPI</h4>
              <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                <h1 style={{ fontSize: '48px', color: '#0f172a', margin: 0 }}>14.2h</h1>
                <p style={{ color: '#10b981', fontWeight: 'bold' }}>↓ 1.5h Improvement</p>
                <div style={{ marginTop: '20px', height: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
                  <div style={{ width: '70%', height: '100%', background: '#3b82f6', borderRadius: '5px' }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>Target: 12.0h</p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AnalyticsDashboards;