import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';
import VoyageTracker from '../components/VoyageTracker';
import { useLiveVesselTracking } from '../hooks/useLiveVesselTracking';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VesselTracking = () => {
  const [vessels, setVessels] = useState([]);
  const [liveVessels, setLiveVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [showLiveData, setShowLiveData] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    flag: '',
    search: '',
    speedMin: '',
    speedMax: '',
    status: '',
  });

  // Simplified live tracking without WebSocket for now
  const {
    isConnected = false,
    startTracking = () => true,
    stopTracking = () => {},
    isVesselTracked = () => false,
    requestNotificationPermission = () => {}
  } = {}; // Simplified mock for now

  useEffect(() => {
    fetchVessels();
  }, [filters]);

  useEffect(() => {
    if (showLiveData) {
      fetchLiveVessels();
    }
  }, [filters, showLiveData]);

  const fetchVessels = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.flag) params.append('flag', filters.flag);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/vessels/?${params}`);
      setVessels(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
      toast.error('Failed to load vessels');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveVessels = async () => {
    setLiveLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.flag) params.append('flag', filters.flag);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/vessels/live/?${params}`);
      setLiveVessels(response.data.vessels || []);
      toast.success(`Loaded ${response.data.count} live vessels from ${response.data.source}`);
    } catch (error) {
      console.error('Failed to fetch live vessels:', error);
      toast.error('Failed to load live vessel data');
    } finally {
      setLiveLoading(false);
    }
  };

  const updateLiveVessels = async () => {
    setLiveLoading(true);
    try {
      const response = await api.post('/vessels/update-live/');
      toast.success(response.data.message);
      fetchVessels();
    } catch (error) {
      console.error('Failed to update live vessels:', error);
      toast.error('Failed to update live vessel data');
    } finally {
      setLiveLoading(false);
    }
  };

  const handleSubscribe = async (vesselId, vesselMmsi = null) => {
    try {
      if (showLiveData && vesselMmsi) {
        // For live vessels, use MMSI to subscribe
        const vessel = liveVessels.find(v => v.mmsi === vesselMmsi);
        const vesselName = vessel ? vessel.name : '';
        
        const response = await api.post(`/vessels/subscribe-live/`, { 
          mmsi: vesselMmsi,
          vessel_name: vesselName
        });
        
        toast.success('Subscribed to live vessel updates');
        
        // Start live tracking (simplified)
        if (vessel) {
          toast.success(`🛤️ Started tracking ${vessel.name}`, {
            position: "bottom-right",
            autoClose: 3000,
          });
          requestNotificationPermission();
        }
        
        // Refresh live vessels to get updated subscription status
        fetchLiveVessels();
      } else {
        // For database vessels, use vessel ID
        await api.post(`/vessels/${vesselId}/subscribe/`);
        toast.success('Subscribed to vessel updates');
        fetchVessels();
      }
    } catch (error) {
      console.error('Subscription error:', error);
      if (error.response?.data?.message) {
        toast.info(error.response.data.message);
      } else {
        toast.error('Failed to subscribe');
      }
    }
  };

  const handleUnsubscribe = async (vesselId, vesselMmsi = null) => {
    try {
      if (showLiveData && vesselMmsi) {
        // For live vessels, use MMSI to unsubscribe
        await api.delete(`/vessels/unsubscribe-live/`, { 
          data: { mmsi: vesselMmsi } 
        });
        toast.success('Unsubscribed from live vessel updates');
        
        // Stop live tracking (simplified)
        toast.info(`⏹️ Stopped tracking vessel`, {
          position: "bottom-right", 
          autoClose: 3000,
        });
        
        // Refresh live vessels to get updated subscription status
        fetchLiveVessels();
      } else {
        // For database vessels, use vessel ID
        await api.delete(`/vessels/${vesselId}/subscribe/`);
        toast.success('Unsubscribed from vessel updates');
        fetchVessels();
      }
    } catch (error) {
      console.error('Unsubscription error:', error);
      if (error.response?.data?.message) {
        toast.info(error.response.data.message);
      } else {
        toast.error('Failed to unsubscribe');
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      flag: '',
      search: '',
      speedMin: '',
      speedMax: '',
      status: '',
    });
  };

  // Filter live vessels on the frontend since they come from external API
  const getFilteredLiveVessels = () => {
    return liveVessels.filter(vessel => {
      const matchesType = !filters.type || 
        (vessel.vessel_type && vessel.vessel_type.toLowerCase().includes(filters.type.toLowerCase())) ||
        (vessel.type && vessel.type.toLowerCase().includes(filters.type.toLowerCase()));
      
      const matchesFlag = !filters.flag || 
        (vessel.flag && vessel.flag.toLowerCase().includes(filters.flag.toLowerCase()));
      
      const matchesSearch = !filters.search || 
        (vessel.name && vessel.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (vessel.mmsi && vessel.mmsi.toString().includes(filters.search));
      
      const matchesSpeedMin = !filters.speedMin || 
        (vessel.speed && vessel.speed >= parseFloat(filters.speedMin));
      
      const matchesSpeedMax = !filters.speedMax || 
        (vessel.speed && vessel.speed <= parseFloat(filters.speedMax));
      
      const matchesStatus = !filters.status || 
        (vessel.status && vessel.status.toLowerCase().includes(filters.status.toLowerCase()));
      
      return matchesType && matchesFlag && matchesSearch && matchesSpeedMin && matchesSpeedMax && matchesStatus;
    });
  };

  const displayVessels = showLiveData ? getFilteredLiveVessels() : vessels;

  if (loading) {
    return <div className="loading">Loading vessels...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '0.5rem' }}>
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Vessel Tracking</h1>
        <p style={{ fontSize: '0.9rem', margin: '0' }}>Track vessels in real-time and monitor their movements</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="vessel-header">
          <div className="live-controls">
            <button
              className={`btn ${showLiveData ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowLiveData(!showLiveData)}
            >
              {showLiveData ? 'Live Data' : 'Database'}
            </button>
            <button
              className="btn btn-primary"
              onClick={fetchLiveVessels}
              disabled={liveLoading}
            >
              {liveLoading ? 'Loading...' : 'Fetch Live Data'}
            </button>
            <button
              className="btn btn-success"
              onClick={updateLiveVessels}
              disabled={liveLoading}
            >
              {liveLoading ? 'Updating...' : 'Update Database'}
            </button>
          </div>
        </div>

        <div className="data-source-info">
          <div className="live-info">
            <p><strong>Data Source:</strong> {showLiveData ? 'Live AIS Stream' : 'Database'}</p>
            <p><strong>Vessels:</strong> {displayVessels.length} 
              {showLiveData && liveVessels.length !== displayVessels.length && 
                ` (filtered from ${liveVessels.length})`}
            </p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleTimeString()}</p>
            {showLiveData && (
              <p><strong>Live Tracking:</strong> 
                <span className="connection-status connected">
                  🟢 Subscriptions Active
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Map with Filters Sidebar */}
      <div className="card">
        <h2>Vessel Locations</h2>
        <div className="map-with-filters">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={clearFilters}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Clear All
              </button>
            </div>
            <div className="filter-group">
              <label>Vessel Type</label>
              <select
                name="type"
                className="form-control"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="cargo">Cargo Ship</option>
                <option value="tanker">Tanker</option>
                <option value="container">Container Ship</option>
                <option value="passenger">Passenger Ship</option>
                <option value="fishing">Fishing Vessel</option>
                <option value="military">Military Vessel</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Flag Country</label>
              <input
                type="text"
                name="flag"
                className="form-control"
                placeholder="e.g., Panama, Liberia"
                value={filters.flag}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Search Vessel</label>
              <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Enter vessel name or MMSI"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            
            {showLiveData && (
              <>
                <div className="filter-group">
                  <label>Speed Range (knots)</label>
                  <div className="speed-range">
                    <input
                      type="number"
                      name="speedMin"
                      className="form-control"
                      placeholder="Min"
                      value={filters.speedMin}
                      onChange={handleFilterChange}
                      style={{ width: '48%', display: 'inline-block' }}
                    />
                    <span style={{ margin: '0 4%' }}>-</span>
                    <input
                      type="number"
                      name="speedMax"
                      className="form-control"
                      placeholder="Max"
                      value={filters.speedMax}
                      onChange={handleFilterChange}
                      style={{ width: '48%', display: 'inline-block' }}
                    />
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Vessel Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="under way using engine">Under Way Using Engine</option>
                    <option value="at anchor">At Anchor</option>
                    <option value="not under command">Not Under Command</option>
                    <option value="restricted manoeuvrability">Restricted Manoeuvrability</option>
                    <option value="moored">Moored</option>
                    <option value="aground">Aground</option>
                    <option value="engaged in fishing">Engaged in Fishing</option>
                    <option value="under way sailing">Under Way Sailing</option>
                  </select>
                </div>
              </>
            )}
          </div>
          
          {/* Map Container */}
          <div className="map-container">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
              />
              {displayVessels.map((vessel, index) => {
                const position = showLiveData 
                  ? [vessel.latitude, vessel.longitude]
                  : vessel.latest_position 
                    ? [vessel.latest_position.latitude, vessel.latest_position.longitude]
                    : null;

                if (!position) return null;

                const vesselKey = showLiveData ? `live-${vessel.mmsi}-${index}` : vessel.id;
                const isSubscribed = vessel.is_subscribed || false;

                return (
                  <Marker
                    key={vesselKey}
                    position={position}
                  >
                    <Popup>
                      <div>
                        <h4>{vessel.name} {isSubscribed && '🔔'}</h4>
                        <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                        <p><strong>Type:</strong> {vessel.vessel_type || vessel.type}</p>
                        <p><strong>Flag:</strong> {vessel.flag}</p>
                        {showLiveData ? (
                          <>
                            <p><strong>Speed:</strong> {vessel.speed?.toFixed(1) || 'N/A'} knots</p>
                            <p><strong>Course:</strong> {vessel.course?.toFixed(0) || 'N/A'}°</p>
                            <p><strong>Status:</strong> {vessel.status}</p>
                            <p><strong>Last Update:</strong> {new Date(vessel.timestamp).toLocaleString()}</p>
                            {isSubscribed ? (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUnsubscribe(null, vessel.mmsi)}
                              >
                                🔕 Stop Tracking
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSubscribe(null, vessel.mmsi)}
                              >
                                🔔 Start Tracking
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <p><strong>Speed:</strong> {vessel.latest_position?.speed || 'N/A'} knots</p>
                            <p><strong>Course:</strong> {vessel.latest_position?.course || 'N/A'}°</p>
                            <p><strong>Last Update:</strong> {vessel.latest_position ? new Date(vessel.latest_position.timestamp).toLocaleString() : 'N/A'}</p>
                            {vessel.is_subscribed ? (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUnsubscribe(vessel.id)}
                              >
                                Unsubscribe
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSubscribe(vessel.id)}
                              >
                                Subscribe
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Vessel List */}
      <div className="card">
        <h2>Vessel List ({displayVessels.length} vessels)</h2>
        {displayVessels.length === 0 ? (
          <p>No vessels found matching your criteria.</p>
        ) : (
          <div className="features-grid">
            {displayVessels.map((vessel, index) => (
              <div
                key={showLiveData ? `live-${vessel.mmsi}-${index}` : vessel.id}
                className="feature-card"
              >
                <h3>{vessel.name}</h3>
                <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                <p><strong>Type:</strong> {vessel.vessel_type || vessel.type}</p>
                <p><strong>Flag:</strong> {vessel.flag}</p>
                {showLiveData ? (
                  <>
                    <p><strong>Speed:</strong> {vessel.speed?.toFixed(1) || 'N/A'} knots</p>
                    <div>
                      {vessel.is_subscribed ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUnsubscribe(null, vessel.mmsi)}
                        >
                          Unsubscribe
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSubscribe(null, vessel.mmsi)}
                        >
                          Subscribe
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {vessel.latest_position && (
                      <p><strong>Speed:</strong> {vessel.latest_position.speed || 'N/A'} knots</p>
                    )}
                    <div>
                      {vessel.is_subscribed ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUnsubscribe(vessel.id)}
                        >
                          Unsubscribe
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSubscribe(vessel.id)}
                        >
                          Subscribe
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselTracking;