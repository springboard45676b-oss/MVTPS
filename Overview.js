import React from 'react';

const Overview = () => {
  const stats = [
    { label: 'Active Vessels', value: '42', change: '+2', color: '#3b82f6' },
    { label: 'Ports Reached', value: '12', change: 'On Track', color: '#10b981' },
    { label: 'Critical Alerts', value: '3', change: '-1', color: '#ef4444' },
    { label: 'Fleet Fuel Avg', value: '12.4t', change: '-5%', color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>Fleet Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{s.label}</p>
            <h1 style={{ margin: '10px 0', color: s.color }}>{s.value}</h1>
            <small style={{ color: '#10b981', fontWeight: 'bold' }}>{s.change}</small>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
        <h3>Recent Fleet Activity</h3>
        <p style={{ color: '#64748b' }}>Maersk Sovereign has entered the Singapore Strait (10 mins ago)</p>
        <p style={{ color: '#64748b' }}>System Audit: AIS Feed synced successfully (1 hour ago)</p>
      </div>
    </div>
  );
};

export default Overview;