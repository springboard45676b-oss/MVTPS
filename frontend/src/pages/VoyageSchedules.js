import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VoyageSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetching data from your coreapi backend
        axios.get('http://127.0.0.1:8000/api/vessels/')
            .then(res => setSchedules(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Active Voyage Schedules</h2>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Return to Dashboard</button>
            </div>
            
            <table style={styles.table}>
                <thead>
                    <tr style={styles.th}>
                        <th>Vessel Name</th>
                        <th>Type</th>
                        <th>Current Lat</th>
                        <th>Current Lon</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map(vessel => (
                        <tr key={vessel.id} style={styles.tr}>
                            <td><strong>{vessel.name}</strong></td>
                            <td>{vessel.type}</td>
                            <td>{vessel.last_position_lat}°</td>
                            <td>{vessel.last_position_lon}°</td>
                            <td><span style={styles.statusBadge}>In Transit</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    th: { backgroundColor: '#f8fafc', textAlign: 'left', padding: '15px', borderBottom: '2px solid #e2e8f0' },
    tr: { borderBottom: '1px solid #e2e8f0', padding: '15px' },
    backBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
    statusBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }
};

export default VoyageSchedules;