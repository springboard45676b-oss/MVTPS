import React, { useState } from 'react';

const Vessels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Simulated Vessel Fleet Data
  const fleet = [
    { id: "V001", name: "Oceanic Star", type: "Cargo", status: "At Sea", speed: "14.2 kn", fuel: "65%", destination: "Singapore", eta: "Jan 20, 14:00" },
    { id: "V002", name: "Sea Knight", type: "Tanker", status: "Docked", speed: "0.0 kn", fuel: "20%", destination: "Rotterdam", eta: "Arrived" },
    { id: "V003", name: "Arctic Pearl", type: "Container", status: "At Sea", speed: "18.5 kn", fuel: "88%", destination: "Los Angeles", eta: "Jan 22, 09:30" },
    { id: "V004", name: "Global Titan", type: "Bulk Carrier", status: "Maintenance", speed: "0.0 kn", fuel: "45%", destination: "Shanghai", eta: "N/A" },
    { id: "V005", name: "Blue Marlin", type: "Cargo", status: "At Sea", speed: "12.0 kn", fuel: "55%", destination: "Mumbai", eta: "Jan 19, 21:15" },
    { id: "V006", name: "Pacific Spirit", type: "Tanker", status: "At Sea", speed: "15.7 kn", fuel: "72%", destination: "Busan", eta: "Jan 21, 11:00" },
  ];

  const filteredVessels = fleet.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || v.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const styles = {
    container: { padding: '30px', background: '#f8fafc', minHeight: '100%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    searchBar: { padding: '12px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '300px', fontSize: '14px' },
    filterBtn: (active) => ({
      padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
      background: active ? '#0ea5e9' : '#e2e8f0', color: active ? 'white' : '#64748b',
      fontWeight: '600', marginLeft: '10px', transition: '0.3s'
    }),
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' },
    tr: { background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '10px' },
    th: { textAlign: 'left', padding: '15px', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    td: { padding: '15px', color: '#1e293b', fontSize: '14px' },
    badge: (status) => ({
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
      background: status === 'At Sea' ? '#dcfce7' : status === 'Maintenance' ? '#fee2e2' : '#fef9c3',
      color: status === 'At Sea' ? '#166534' : status === 'Maintenance' ? '#991b1b' : '#854d0e'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <input 
          style={styles.searchBar} 
          placeholder="Search vessel name or IMO..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          {['All', 'At Sea', 'Docked', 'Maintenance'].map(s => (
            <button 
              key={s} 
              style={styles.filterBtn(filterStatus === s)} 
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Vessel ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Speed</th>
            <th style={styles.th}>Fuel</th>
            <th style={styles.th}>Destination</th>
            <th style={styles.th}>ETA</th>
          </tr>
        </thead>
        <tbody>
          {filteredVessels.map(v => (
            <tr key={v.id} style={styles.tr}>
              <td style={{...styles.td, borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px'}}><b>{v.id}</b></td>
              <td style={styles.td}>{v.name}</td>
              <td style={styles.td}>{v.type}</td>
              <td style={styles.td}><span style={styles.badge(v.status)}>{v.status}</span></td>
              <td style={styles.td}>{v.speed}</td>
              <td style={styles.td}>
                <div style={{ width: '100px', background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: v.fuel, background: parseInt(v.fuel) < 30 ? '#ef4444' : '#10b981', height: '100%' }} />
                </div>
                <small style={{fontSize: '10px', color: '#64748b'}}>{v.fuel}</small>
              </td>
              <td style={styles.td}>{v.destination}</td>
              <td style={{...styles.td, borderTopRightRadius: '10px', borderBottomRightRadius: '10px'}}>{v.eta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vessels;