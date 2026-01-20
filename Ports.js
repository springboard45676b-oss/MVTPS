import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 10, { duration: 2 });
  }, [target, map]);
  return null;
}

const Ports = () => {
  const [countrySearch, setCountrySearch] = useState('');
  const [portSearch, setPortSearch] = useState('');
  const [focusTarget, setFocusTarget] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [subscribed, setSubscribed] = useState([]);
  const [alerts, setAlerts] = useState([
    { id: 1, port: 'Shanghai', msg: 'Extreme Weather: Berth 4 closed', time: '10m ago' },
    { id: 2, port: 'Singapore', msg: 'High Congestion: +4h delay', time: '25m ago' }
  ]);

  const portsData = [
    { id: "SGSIN", name: "Port of Singapore", country: "Singapore", lat: 1.28, lng: 103.77, congestion: "High", warnings: 5, entry: 10, berth: 2.5, updated: "2m ago" },
    { id: "NLRTM", name: "Port of Rotterdam", country: "Netherlands", lat: 51.95, lng: 4.14, congestion: "Low", warnings: 0, entry: 5, berth: 2.9, updated: "5m ago" },
    { id: "USLAX", name: "Port of Los Angeles", country: "USA", lat: 33.73, lng: -118.26, congestion: "Critical", warnings: 12, entry: 30, berth: 5.8, updated: "1h ago" },
    { id: "CNSHA", name: "Port of Shanghai", country: "China", lat: 30.62, lng: 122.06, congestion: "High", warnings: 15, entry: 48, berth: 17, updated: "Just now" },
    { id: "INNSA", name: "Nhava Sheva", country: "India", lat: 18.95, lng: 72.95, congestion: "Medium", warnings: 3, entry: 12, berth: 5.2, updated: "10m ago" },
    { id: "AEJEA", name: "Jebel Ali", country: "UAE", lat: 25.02, lng: 55.04, congestion: "Low", warnings: 1, entry: 4, berth: 2.5, updated: "40m ago" },
    { id: "DEHAM", name: "Port of Hamburg", country: "Germany", lat: 53.50, lng: 9.96, congestion: "Medium", warnings: 4, entry: 14, berth: 6.8, updated: "15m ago" },
    { id: "BEANR", name: "Antwerp", country: "Belgium", lat: 51.24, lng: 4.40, congestion: "Medium", warnings: 2, entry: 10, berth: 5.1, updated: "22m ago" },
    { id: "KRBUS", name: "Busan", country: "South Korea", lat: 35.10, lng: 129.04, congestion: "High", warnings: 7, entry: 20, berth: 5.9, updated: "8m ago" },
    { id: "AUPBT", name: "Port Botany", country: "Australia", lat: -33.97, lng: 151.21, congestion: "Low", warnings: 0, entry: 3, berth: 1.8, updated: "2h ago" },
    { id: "UKFXT", name: "Felixstowe", country: "UK", lat: 51.94, lng: 1.32, congestion: "Medium", warnings: 2, entry: 9, berth: 3.6, updated: "11m ago" },
    { id: "BRSSZ", name: "Port of Santos", country: "Brazil", lat: -23.96, lng: -46.33, congestion: "High", warnings: 6, entry: 18, berth: 4.5, updated: "50m ago" },
    { id: "ZACPT", name: "Cape Town", country: "South Africa", lat: -33.91, lng: 18.43, congestion: "Low", warnings: 1, entry: 5, berth: 2.1, updated: "3h ago" }
  ];

  const handleLocate = () => {
    const found = portsData.find(p => 
      p.name.toLowerCase().includes(portSearch.toLowerCase()) && 
      p.country.toLowerCase().includes(countrySearch.toLowerCase())
    );
    if (found) setFocusTarget([found.lat, found.lng]);
  };

  const toggleSubscribe = (id, name) => {
    if (!subscribed.includes(id)) {
      setSubscribed([...subscribed, id]);
      setAlerts([{ id: Date.now(), port: name, msg: `Subscribed to live feed`, time: 'Just now' }, ...alerts]);
    }
  };

  return (
    <div style={{ padding: '25px', background: '#f8fafc', position: 'relative', height: '100vh' }}>
      {/* Search Header */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <input style={styles.input} placeholder="Country Name" onChange={e => setCountrySearch(e.target.value)} />
        <input style={styles.input} placeholder="Port Name" onChange={e => setPortSearch(e.target.value)} />
        
        <button onClick={() => setShowNotifs(true)} style={styles.iconBtn}>
          🔔 {alerts.length > 0 && <span style={styles.badge}>{alerts.length}</span>}
        </button>
        
        <button onClick={handleLocate} style={styles.primaryBtn}>Locate</button>
      </div>

      {/* Map Container - HEIGHT IS CRITICAL */}
      <div style={{ height: '75vh', borderRadius: '15px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 1 }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController target={focusTarget} />
          
          {portsData
            .filter(p => p.country.toLowerCase().includes(countrySearch.toLowerCase()))
            .filter(p => p.name.toLowerCase().includes(portSearch.toLowerCase()))
            .map(p => (
              <Marker key={p.id} position={[p.lat, p.lng]}>
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <b style={{ fontSize: '14px' }}>{p.name}</b>
                      <button 
                        onClick={() => toggleSubscribe(p.id, p.name)}
                        style={{ background: subscribed.includes(p.id) ? '#10b981' : '#0ea5e9', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {subscribed.includes(p.id) ? '✓ Subscribed' : 'Subscribe'}
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                      <b>Code:</b> {p.id} | <b>Country:</b> {p.country}<br/>
                      <b>Coordinates:</b> {p.lat}, {p.lng}<br/>
                      <b>Congestion:</b> <span style={{ color: p.congestion === 'Critical' ? 'red' : 'orange' }}>{p.congestion}</span><br/>
                      <b>Vessel Warnings:</b> ⚠️ {p.warnings}<br/>
                      <b>Avg Wait:</b> {(p.entry - p.berth).toFixed(1)}h <small>(Entry - Berthing)</small><br/>
                      <small style={{ color: '#94a3b8' }}>Last Updated: {p.updated}</small>
                    </div>
                  </div>
                </Popup>
              </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Notification Drawer */}
      {showNotifs && (
        <div style={styles.drawer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Alerts</h3>
            <button onClick={() => setShowNotifs(false)} style={styles.closeBtn}>Go Back</button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {alerts.map(a => (
              <div key={a.id} style={styles.alertItem}>
                <strong>{a.port}</strong>: {a.msg}
                <br/><small style={{ color: '#94a3b8' }}>{a.time}</small>
              </div>
            ))}
          </div>
          <button onClick={() => setAlerts([])} style={styles.clearBtn}>Clear All</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' },
  iconBtn: { background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', cursor: 'pointer', position: 'relative' },
  primaryBtn: { background: '#0f172a', color: '#fff', padding: '10px 25px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '50%' },
  drawer: { position: 'absolute', top: '85px', right: '30px', width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, padding: '20px' },
  alertItem: { padding: '10px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' },
  closeBtn: { background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
  clearBtn: { width: '100%', marginTop: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Ports;