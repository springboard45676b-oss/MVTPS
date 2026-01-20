import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminPanel = () => {
  // 1. DATA: API Source Health
  const [apiSources] = useState([
    { id: 1, name: 'AIS Global Feed (Spire)', status: 'Active', latency: '42ms', uptime: '99.9%' },
    { id: 2, name: 'OpenWeather Marine', status: 'Active', latency: '128ms', uptime: '98.5%' },
    { id: 3, name: 'Port Authority Sync', status: 'Warning', latency: '850ms', uptime: '92.1%' },
    { id: 4, name: 'Satellite Imagery Hub', status: 'Offline', latency: '0ms', uptime: '85.0%' }
  ]);

  // 2. DATA: Server Load Monitoring
  const serverLoad = [
    { time: '10:00', load: 30 }, { time: '11:00', load: 45 },
    { time: '12:00', load: 85 }, { time: '13:00', load: 50 },
    { time: '14:00', load: 40 }, { time: '15:00', load: 60 }
  ];

  const handleExport = (format) => {
    alert(`Generating ${format} report for Milestone 4 Audit...`);
    // Logic for CSV/PDF generation would go here
  };

  const styles = {
    container: { padding: '30px', background: '#0f172a', minHeight: '100vh', color: '#f8fafc' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
    card: { background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' },
    statusBadge: (status) => ({
      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
      background: status === 'Active' ? '#065f46' : status === 'Warning' ? '#92400e' : '#7f1d1d',
      color: status === 'Active' ? '#34d399' : status === 'Warning' ? '#fbbf24' : '#f87171'
    }),
    btn: { padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Control Center</h1>
          <p style={{ color: '#94a3b8' }}>Milestone 4: API Management & Data Export</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleExport('CSV')} style={{ ...styles.btn, background: '#334155', color: '#fff' }}>Export CSV</button>
          <button onClick={() => handleExport('PDF')} style={{ ...styles.btn, background: '#3b82f6', color: '#fff' }}>Generate PDF Audit</button>
        </div>
      </header>

      <div style={styles.grid}>
        {/* API MONITORING TABLE */}
        <div style={styles.card}>
          <h3>External API Source Management</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '10px' }}>Source Name</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {apiSources.map(api => (
                <tr key={api.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '15px 10px' }}>{api.name}</td>
                  <td><span style={styles.statusBadge(api.status)}>{api.status}</span></td>
                  <td>{api.latency}</td>
                  <td>{api.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SERVER LOAD CHART */}
        <div style={styles.card}>
          <h3>System CPU Load</h3>
          <div style={{ height: '250px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serverLoad}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="load" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COMPLIANCE AUDIT LOGS */}
      <div style={{ ...styles.card, marginTop: '20px' }}>
        <h3>Security & Compliance Audit Log</h3>
        <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#10b981' }}>
          <div>[2026-01-18 14:22:01] INFO: Vessel 'Ever Ace' entered Sanctioned Zone (EEZ-4). Violation flagged.</div>
          <div>[2026-01-18 15:05:44] WARN: Port of Shanghai API latency exceeded 800ms. Switching to backup source.</div>
          <div>[2026-01-18 16:10:12] AUTH: Admin 'Pravinaa' generated monthly insurance risk report.</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;