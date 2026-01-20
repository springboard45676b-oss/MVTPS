import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminTools = () => {
  // 1. Mock API Source Data
  const [apiStatus] = useState([
    { name: 'AIS Global Feed', status: 'Online', latency: '42ms', load: '12%' },
    { name: 'Weather Layer API', status: 'Online', latency: '120ms', load: '45%' },
    { name: 'Port Database Sync', status: 'Degraded', latency: '850ms', load: '89%' },
    { name: 'Satellite Imagery', status: 'Offline', latency: '0ms', load: '0%' },
  ]);

  // 2. Server Load Monitoring Data
  const performanceData = [
    { time: '10:00', cpu: 20, mem: 40 },
    { time: '11:00', cpu: 35, mem: 45 },
    { time: '12:00', cpu: 75, mem: 80 },
    { time: '13:00', cpu: 40, mem: 55 },
    { time: '14:00', cpu: 30, mem: 50 },
  ];

  const handleExport = (type) => {
    alert(`Generating ${type} report for Milestone 4 compliance...`);
    // In a real app, this would trigger a CSV download or PDF generation
  };

  const styles = {
    container: { padding: '30px', background: '#0f172a', minHeight: '100vh', color: '#f8fafc' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
    card: { background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' },
    status: (s) => ({
      color: s === 'Online' ? '#10b981' : s === 'Degraded' ? '#f59e0b' : '#ef4444',
      fontWeight: 'bold'
    }),
    btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Console</h1>
          <p style={{ color: '#94a3b8' }}>API Source Management & Compliance Monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleExport('CSV')} style={{ ...styles.btn, background: '#334155', color: '#fff' }}>Export CSV</button>
          <button onClick={() => handleExport('Audit PDF')} style={{ ...styles.btn, background: '#3b82f6', color: '#fff' }}>Generate Audit PDF</button>
        </div>
      </header>

      <div style={styles.grid}>
        {/* API HEALTH TABLE */}
        <div style={styles.card}>
          <h3>Data Source Health</h3>
          <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '10px' }}>Source</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Load</th>
              </tr>
            </thead>
            <tbody>
              {apiStatus.map((api, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '15px 10px' }}>{api.name}</td>
                  <td style={styles.status(api.status)}>● {api.status}</td>
                  <td>{api.latency}</td>
                  <td>{api.load}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESOURCE MONITOR */}
        <div style={styles.card}>
          <h3>Server Performance</h3>
          <div style={{ height: '250px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SYSTEM LOGS */}
      <div style={{ ...styles.card, marginTop: '20px', fontFamily: 'monospace' }}>
        <h3 style={{ fontFamily: 'sans-serif' }}>System Audit Logs</h3>
        <div style={{ height: '150px', overflowY: 'auto', background: '#0f172a', padding: '15px', borderRadius: '8px', fontSize: '12px', color: '#10b981' }}>
          <div>[2026-01-18 18:30:01] INFO: Vessel tracking data refreshed from AIS Spire Feed.</div>
          <div>[2026-01-18 18:35:12] WARN: Port Authority Sync latency spike detected (850ms).</div>
          <div>[2026-01-18 18:42:55] ERROR: Satellite Imagery Hub connection timeout.</div>
          <div>[2026-01-18 19:00:10] AUTH: Admin session started by user 'Pravinaa'.</div>
        </div>
      </div>
    </div>
  );
};

export default AdminTools;