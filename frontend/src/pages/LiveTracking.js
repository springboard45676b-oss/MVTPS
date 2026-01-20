// 1. Imports (React, Leaflet, Axios)
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from 'react-leaflet'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-rotatedmarker'; 

// 2. Icon Definitions
const shipIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/96/cruise-ship.png', 
    iconSize: [45, 45],       
    iconAnchor: [22, 22],     
    popupAnchor: [0, -22],    
    className: 'realistic-ship-icon'
});

const selectedShipIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067208.png', 
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
    className: 'selected-ship-glow'
});

// Helper component to recenter map
const RecenterMap = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lon) {
            map.flyTo([lat, lon], 6, { animate: true }); 
        }
    }, [lat, lon, map]);
    return null;
};

// 3. Component Function
const LiveTracking = ({ user, setUser }) => {
    const [vessels, setVessels] = useState([]);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const navigate = useNavigate();
    
    const WEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY"; 

    const fetchVessels = useCallback(() => {
        axios.get('http://127.0.0.1:8000/api/vessels/')
            .then(res => {
                setVessels(res.data);
                if (selectedVessel) {
                    const updated = res.data.find(v => v.id === selectedVessel.id);
                    if (updated) setSelectedVessel(updated);
                }
            })
            .catch(err => console.error("Data Fetch Error:", err));
    }, [selectedVessel]); 

    useEffect(() => { 
        fetchVessels(); 
        const interval = setInterval(fetchVessels, 10000); 
        return () => clearInterval(interval);
    }, [fetchVessels]); 

    // --- NEW: Export to CSV Function ---
    const exportToCSV = () => {
        if (!selectedVessel || !selectedVessel.history) return;

        const headers = ["Latitude,Longitude,Timestamp\n"];
        const rows = selectedVessel.history.map(h => 
            `${h.latitude},${h.longitude},${new Date(h.timestamp).toLocaleString()}`
        ).join("\n");

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${selectedVessel.name}_voyage_history.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleLogout = () => { 
        setUser(null); 
        navigate('/login'); 
    };

    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <div style={styles.logoStyle}>🚢 MVTPS</div>
                <div style={styles.navLinks}>
                    <span onClick={() => navigate('/dashboard')} style={styles.linkStyle}>Dashboard</span>
                    <span onClick={() => navigate('/vessels')} style={styles.linkStyle}>Vessels</span>
                    <span style={{color: '#3b82f6', borderBottom: '2px solid #3b82f6', cursor: 'pointer'}}>Live Tracking</span>
                </div>
                <div style={styles.userBadge}>
                    <div style={styles.userTextContainer}>
                        <small style={{color: '#64748b'}}>Signed in</small>
                        <strong style={{fontSize: '14px'}}>emmadishettianjali</strong>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <div style={{ padding: '20px 60px' }}>
                <div style={styles.headerRow}>
                    <h1>Live Vessel Tracking</h1>
                    <button style={styles.updateAllBtn} onClick={fetchVessels}>🔄 Update All</button>
                </div>

                <div style={styles.layoutGrid}>
                    <div style={styles.sidebarStyle}>
                        <h4 style={styles.sidebarHeader}>Fleet ({vessels.length})</h4>
                        <div style={styles.listContainer}>
                            {vessels.map(v => (
                                <div key={v.id} style={styles.vCard} onClick={() => setSelectedVessel(v)}>
                                    <strong>{v.name}</strong><br/>
                                    <div style={styles.coordText}>● {v.last_position_lat}°, {v.last_position_lon}°</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={styles.mapBox}>
                            <MapContainer center={[20, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LayersControl position="topright">
                                    <LayersControl.Overlay name="Precipitation (Rain)">
                                        <TileLayer url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`} />
                                    </LayersControl.Overlay>
                                    <LayersControl.Overlay name="Wind Speed">
                                        <TileLayer url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`} />
                                    </LayersControl.Overlay>
                                </LayersControl>

                                {selectedVessel && (
                                    <RecenterMap lat={selectedVessel.last_position_lat} lon={selectedVessel.last_position_lon} />
                                )}

                                {vessels.map(ship => (
                                    <Marker 
                                        key={ship.id} 
                                        position={[ship.last_position_lat, ship.last_position_lon]} 
                                        icon={selectedVessel?.id === ship.id ? selectedShipIcon : shipIcon} 
                                        rotationAngle={ship.heading || 0} 
                                        rotationOrigin="center center"
                                        eventHandlers={{ click: () => setSelectedVessel(ship) }}
                                    >
                                        <Popup><strong>{ship.name}</strong></Popup>
                                    </Marker>
                                ))}

                                {selectedVessel?.history?.length > 1 && (
                                    <Polyline positions={selectedVessel.history.map(h => [h.latitude, h.longitude])} color="#3b82f6" weight={3} opacity={0.6} dashArray="5, 10" />
                                )}
                            </MapContainer>
                        </div>
                        
                        <div style={styles.bottomInfoPanel}>
                            <div style={styles.infoSection}>
                                <h4>🚀 Vessel Details</h4>
                                {selectedVessel ? (
                                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        <p><b>Name:</b> {selectedVessel.name}</p>
                                        <p><b>Heading:</b> {selectedVessel.heading || 0}°</p>
                                        <p><b>Type:</b> {selectedVessel.type}</p>
                                        <p><b>Flag:</b> {selectedVessel.flag || 'N/A'}</p>
                                    </div>
                                ) : <p style={{ color: '#64748b' }}>Select a ship...</p>}
                            </div>

                            <div style={styles.infoSection}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0 }}>📜 Recent Voyage Points</h4>
                                    {/* CSV Button Added Here */}
                                    {selectedVessel?.history?.length > 0 && (
                                        <button onClick={exportToCSV} style={styles.csvBtn}>📥 Export CSV</button>
                                    )}
                                </div>
                                {selectedVessel && selectedVessel.history && selectedVessel.history.length > 0 ? (
                                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                                <th style={{ padding: '5px' }}>Latitude</th>
                                                <th style={{ padding: '5px' }}>Longitude</th>
                                                <th style={{ padding: '5px' }}>Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedVessel.history.map((h, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '5px' }}>{h.latitude}°</td>
                                                    <td style={{ padding: '5px' }}>{h.longitude}°</td>
                                                    <td style={{ padding: '5px' }}>{new Date(h.timestamp).toLocaleTimeString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p style={{ fontSize: '12px', color: '#64748b' }}>No voyage history recorded.</p>}
                            </div>

                            <div style={styles.infoSection}>
                                <h4>📍 Current Position</h4>
                                {selectedVessel ? (
                                    <p style={{ fontSize: '14px' }}>
                                        <b>Lat:</b> {selectedVessel.last_position_lat}°<br/>
                                        <b>Lon:</b> {selectedVessel.last_position_lon}°<br/>
                                        <b>Updated:</b> {new Date().toLocaleTimeString()}
                                    </p>
                                ) : <p style={{ color: '#64748b' }}>Select a ship...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial' },
    nav: { display: 'flex', justifyContent: 'space-between', padding: '10px 60px', background: 'white', borderBottom: '1px solid #e2e8f0', alignItems: 'center' },
    logoStyle: { fontWeight: 'bold', fontSize: '20px' },
    navLinks: { display: 'flex', gap: '30px' },
    linkStyle: { color: '#64748b', cursor: 'pointer', fontWeight: '500' },
    userBadge: { display: 'flex', alignItems: 'center', gap: '15px' },
    userTextContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    logoutBtn: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 12px', cursor: 'pointer', fontWeight: 'bold' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    updateAllBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    layoutGrid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' },
    sidebarStyle: { background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    sidebarHeader: { padding: '15px', margin: 0, borderBottom: '1px solid #eee', color: '#3b82f6' },
    listContainer: { padding: '10px', maxHeight: '450px', overflowY: 'auto' },
    vCard: { padding: '12px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' },
    coordText: { color: '#10b981', fontSize: '12px', fontWeight: 'bold' },
    mapBox: { borderRadius: '15px', overflow: 'hidden', border: '1px solid #e2e8f0' },
    bottomInfoPanel: { display: 'flex', gap: '20px' },
    infoSection: { flex: 1, background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', minHeight: '150px' },
    csvBtn: { background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' } // Added Style
};

export default LiveTracking;