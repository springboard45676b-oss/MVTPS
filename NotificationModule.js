import React, { useState } from 'react';

const NotificationModule = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Advanced Idea: Notifications with Priority and Categories
  const allNotifications = Array.from({ length: 13 }, (_, i) => ({
    id: i + 1,
    title: `Alert ${i + 1}`,
    message: i % 2 === 0 ? "Vessel deviation detected in Sector 7" : "New compliance document uploaded",
    category: i % 3 === 0 ? 'Security' : i % 3 === 1 ? 'Fleet' : 'System',
    time: `${i + 1}h ago`,
    unread: i < 3
  }));

  const filters = ['All', 'Security', 'Fleet', 'System'];

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Notifications (13)</h2>
        <div>
          <button style={{ marginRight: '10px', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>Clear All</button>
          <button style={{ color: '#0ea5e9', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Update All</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {filters.map(f => (
          <button 
            key={f} 
            onClick={() => setActiveFilter(f)}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0',
              background: activeFilter === f ? '#0ea5e9' : 'white',
              color: activeFilter === f ? 'white' : '#64748b',
              cursor: 'pointer'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allNotifications.filter(n => activeFilter === 'All' || n.category === activeFilter).map(n => (
          <div key={n.id} style={{ 
            background: 'white', padding: '15px', borderRadius: '10px', borderLeft: n.unread ? '5px solid #0ea5e9' : '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <strong style={{ display: 'block' }}>{n.title} <small style={{ color: '#94a3b8' }}>• {n.category}</small></strong>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{n.message}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationModule;