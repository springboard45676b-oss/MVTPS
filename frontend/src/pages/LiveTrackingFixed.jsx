import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { getVessels } from '../api/vessels';
import toast from 'react-hot-toast';
import '../styles/Notifications.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LiveTracking = () => {
  const { token } = useAuth();
  const webSocket = useWebSocket('ws://localhost:8000/ws/vessels/positions/');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ vesselType: 'all', search: '' });
  
  // Define vessel types and which ones appear on the map
  // All types are available in filters, but the map focuses on core traffic types
  const allowedVesselTypes = ['Cargo', 'Tanker', 'Container', 'Passenger', 'Fishing'];
  const mapVesselTypes = ['Cargo', 'Tanker', 'Container'];

  useEffect(() => {
    const loadVessels = async () => {
      try {
        const data = await getVessels();

        // Support both plain array and paginated { results: [...] } responses
        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.results)) {
          items = data.results;
        }

        setVessels(items);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch vessels", err);
        setVessels([]);
        setLoading(false);
      }
    };
    loadVessels();
  }, []);

  // Subscribe to real-time alerts
  useEffect(() => {
    if (!token || !webSocket?.subscribeToAlerts) return;

    const unsubscribeAlerts = webSocket.subscribeToAlerts((alert) => {
      if (alert.vessel_id && alert.alert_type) {
        const alertMessage = `${alert.vessel_name} - ${alert.alert_type.toUpperCase()}: ${alert.message}`;
        toast.success(alertMessage, {
          duration: 5000,
          position: 'top-right',
        });
      }
    });

    return () => {
      if (unsubscribeAlerts) unsubscribeAlerts();
    };
  }, [token, webSocket]);

  // Subscribe to real-time position updates with alerts
  useEffect(() => {
    if (!token || !webSocket?.subscribeToPositionUpdates) return;

    const unsubscribe = webSocket.subscribeToPositionUpdates((vesselData, positionData) => {
      setVessels(prevVessels => {
        const updatedVessels = prevVessels.map(vessel => {
          if (vessel.id === vesselData.id || vessel.mmsi === vesselData.mmsi) {
            // Check if position changed significantly (for alert)
            const oldPosition = vessel.latest_position;
            const newPosition = positionData;
            
            if (oldPosition && newPosition) {
              const distance = calculateDistance(
                oldPosition.latitude, oldPosition.longitude,
                newPosition.latitude, newPosition.longitude
              );
              
              // Trigger alert if position changed by more than 0.1 degrees (~11km)
              if (distance > 0.1) {
                const alertMessage = `${vessel.name} position updated: ${newPosition.latitude.toFixed(3)}, ${newPosition.longitude.toFixed(3)}`;
                toast.success(alertMessage, {
                  duration: 5000,
                  position: 'top-right',
                });
              }
            }
            
            return {
              ...vessel,
              lat: positionData.latitude,
              lng: positionData.longitude,
              speed: positionData.speed || vessel.speed,
              latest_position: {
                ...vessel.latest_position,
                latitude: positionData.latitude,
                longitude: positionData.longitude,
                speed: positionData.speed,
                course: positionData.course,
                heading: positionData.heading,
                timestamp: positionData.timestamp
              }
            };
          }
          return vessel;
        });
        return updatedVessels;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [token, webSocket]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredVessels = (vessels || []).filter(vessel => {
    const matchesType = filters.vesselType === 'all' || vessel.vessel_type === filters.vesselType;
    const matchesSearch = !filters.search || 
      vessel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vessel.mmsi.includes(filters.search);
    
    return matchesType && matchesSearch;
  });

  // Vessels to show on map (only allowed types)
  const mapVessels = filteredVessels.filter(vessel => 
    mapVesselTypes.includes(vessel.vessel_type)
  );

  const getVesselIcon = (type) => {
    const icons = {
      'Cargo': '🚢',
      'Tanker': '⛽',
      'Container': '📦',
      'Passenger': '👥',
      'Fishing': '🎣',
    };
    return icons[type] || '🚢';
  };

  const getVesselColor = (type) => {
    const colors = {
      'Cargo': '#3b82f6',
      'Tanker': '#ef4444',
      'Container': '#10b981',
      'Passenger': '#f59e0b',
      'Fishing': '#8b5cf6',
    };
    return colors[type] || '#6b7280';
  };

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '16px 24px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ margin: 0 }}>Live Vessel Tracking</h1>
        <p>{filteredVessels.length} vessels found</p>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ 
          width: '360px', 
          background: 'white', 
          borderRight: '1px solid #e2e8f0', 
          overflowY: 'auto'
        }}>
          {/* Filters */}
          <div style={{ padding: '16px' }}>
            <h3>Vessel Filters</h3>
            <div style={{ marginBottom: '12px' }}>
              <strong>Tracked on Map:</strong> {mapVesselTypes.join(', ')}
            </div>
            <input
              type="text"
              placeholder="Search vessels..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                marginBottom: '8px'
              }}
            />
            <select
              value={filters.vesselType}
              onChange={(e) => setFilters({...filters, vesselType: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px'
              }}
            >
              <option value="all">All Types</option>
              <option value="Cargo">Cargo</option>
              <option value="Tanker">Tanker</option>
              <option value="Container">Container</option>
              <option value="Passenger">Passenger</option>
              <option value="Fishing">Fishing</option>
            </select>
          </div>

          {/* Vessel List */}
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong>{filteredVessels.length} vessels found</strong>
              <br />
              <small>{mapVessels.length} tracked on map</small>
            </div>
            {filteredVessels.map(vessel => {
              const isTracked = mapVesselTypes.includes(vessel.vessel_type);
              return (
                <div
                  key={vessel.id}
                  onClick={() => setSelectedVessel(vessel)}
                  style={{
                    padding: '12px',
                    border: `1px solid ${isTracked ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedVessel?.id === vessel.id ? '#f0f9ff' : 'white',
                    opacity: isTracked ? 1 : 0.6
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getVesselIcon(vessel.vessel_type)} {vessel.name}
                    {isTracked && (
                      <span style={{ 
                        background: '#10b981', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '10px',
                        fontWeight: 'normal'
                      }}>
                        TRACKED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    MMSI: {vessel.mmsi}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Type: {vessel.vessel_type}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Speed: {vessel.latest_position?.speed || 0} knots
                  </div>
                  {!isTracked && (
                    <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>
                      Not tracked on map
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1 }}>
          <MapContainer 
            center={[17.385, 78.486]} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapVessels.map(vessel => {
              const position = vessel.latest_position;
              if (!position || !position.latitude || !position.longitude) {
                return null;
              }
              
              return (
                <Marker
                  key={vessel.id}
                  position={[position.latitude, position.longitude]}
                  eventHandlers={{
                    click: () => setSelectedVessel(vessel)
                  }}
                >
                  <Popup>
                    <div>
                      <strong>{vessel.name}</strong><br />
                      MMSI: {vessel.mmsi}<br />
                      Type: {vessel.vessel_type}<br />
                      Speed: {position.speed} knots<br />
                      Position: {position.latitude.toFixed(3)}, {position.longitude.toFixed(3)}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
