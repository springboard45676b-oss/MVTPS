import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVessels } from '../api/vessels';

const LiveTrackingSimple = () => {
  const { token } = useAuth();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const data = await getVessels();
        console.log('API Response:', data);
        
        const dataArray = Array.isArray(data) ? data : [];
        const transformedVessels = dataArray.map(vessel => ({
          id: vessel.id,
          name: vessel.name,
          mmsi: vessel.mmsi,
          type: vessel.vessel_type || vessel.type || 'Unknown',
          flag: vessel.flag,
          speed: vessel.latest_position?.speed || 0,
          lat: vessel.latest_position?.latitude || 0,
          lng: vessel.latest_position?.longitude || 0,
          latest_position: vessel.latest_position
        }));
        
        console.log('Transformed Vessels:', transformedVessels);
        setVessels(transformedVessels);
      } catch (err) {
        console.error("Failed to fetch vessels:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchVessels();
    }
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Please login to view Live Tracking</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading vessels...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Live Tracking (Simple Version)</h1>
      <p>Vessels found: {vessels.length}</p>
      
      {vessels.length === 0 ? (
        <p>No vessels found in database.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {vessels.map(vessel => (
            <div key={vessel.id} style={{ 
              border: '1px solid #ccc', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>{vessel.name}</h3>
              <p><strong>MMSI:</strong> {vessel.mmsi}</p>
              <p><strong>Type:</strong> {vessel.type}</p>
              <p><strong>Flag:</strong> {vessel.flag}</p>
              <p><strong>Speed:</strong> {vessel.speed} knots</p>
              <p><strong>Position:</strong> {vessel.lat.toFixed(3)}, {vessel.lng.toFixed(3)}</p>
              {vessel.latest_position && (
                <p><strong>Last Update:</strong> {new Date(vessel.latest_position.timestamp).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveTrackingSimple;
