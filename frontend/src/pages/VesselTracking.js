import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';

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
  });

  useEffect(() => {
    fetchVessels();
  }, [filters]);

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
      // Get current map bounds (you can implement this based on map view)
      const response = await api.get('/vessels/live/');
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
      // Refresh the vessel list
      fetchVessels();
    } catch (error) {
      console.error('Failed to update live vessels:', error);
      toast.error('Failed to update live vessel data');
    } finally {
      setLiveLoading(false);
    }
  };

  const handleSubscribe = async (vesselId) => {
    try {
      await api.post(`/vessels/${vesselId}/subscribe/`);
      toast.success('Subscribed to vessel updates');
      fetchVessels(); // Refresh to update subscription status
    } catch (error) {
      toast.error('Failed to subscribe');
    }
  };

  const handleUnsubscribe = async (vesselId) => {
    try {
      await api.delete(`/vessels/${vesselId}/subscribe/`);
      toast.success('Unsubscribed from vessel updates');
      fetchVessels(); // Refresh to update subscription status
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const displayVessels = showLiveData ? liveVessels : vessels;

  if (loading) {
    return <div className="loading">Loading vessels...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div className="vessel-header">
        <h1>Vessel Tracking</h1>
        <div className="live-controls">
          <button
            className={`btn ${showLiveData ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowLiveData(!showLiveData)}
          >
            {showLiveData ? '📡 Live Data' : '💾 Database'}
          </button>
          <button
            className="btn btn-primary"
            onClick={fetchLiveVessels}
            disabled={liveLoading}
          >
            {liveLoading ? '🔄 Loading...' : '🌐 Fetch Live Data'}
          </button>
          <button
            className="btn btn-success"
            onClick={updateLiveVessels}
            disabled={liveLoading}
          >
            {liveLoading ? '🔄 Updating...' : '🔄 Update Database'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
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

          <div className="form-group">
            <label>Flag</label>
            <input
              type="text"
              name="flag"
              className="form-control"
              placeholder="Enter flag country"
              value={filters.flag}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Search vessel name"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="card">
        <div className="data-source-info">
          <h3>
            {showLiveData ? '📡 Live Vessel Data' : '💾 Database Vessels'} 
            ({displayVessels.length} vessels)
          </h3>
          {showLiveData && (
            <div className="live-info">
              <p>
                <strong>Source:</strong> MarineTraffic API (Demo Mode) <br/>
                <strong>Last Updated:</strong> {new Date().toLocaleString()} <br/>
                <strong>Note:</strong> To get real live data, configure MARINE_TRAFFIC_API_KEY in backend settings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="card">
        <h3>Vessel Positions</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {displayVessels.map((vessel, index) => {
              const position = showLiveData 
                ? [vessel.latitude, vessel.longitude]
                : vessel.latest_position 
                  ? [vessel.latest_position.latitude, vessel.latest_position.longitude]
                  : null;

              if (!position) return null;

              return (
                <Marker
                  key={showLiveData ? `live-${vessel.mmsi}-${index}` : vessel.id}
                  position={position}
                >
                  <Popup>
                    <div>
                      <h4>{vessel.name}</h4>
                      <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                      <p><strong>Type:</strong> {vessel.vessel_type || vessel.type}</p>
                      <p><strong>Flag:</strong> {vessel.flag}</p>
                      {showLiveData ? (
                        <>
                          <p><strong>Speed:</strong> {vessel.speed?.toFixed(1) || 'N/A'} knots</p>
                          <p><strong>Course:</strong> {vessel.course?.toFixed(0) || 'N/A'}°</p>
                          <p><strong>Status:</strong> {vessel.status}</p>
                          <p><strong>Last Update:</strong> {new Date(vessel.timestamp).toLocaleString()}</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Speed:</strong> {vessel.latest_position?.speed || 'N/A'} knots</p>
                          <p><strong>Course:</strong> {vessel.latest_position?.course || 'N/A'}°</p>
                          <p><strong>Last Update:</strong> {vessel.latest_position ? new Date(vessel.latest_position.timestamp).toLocaleString() : 'N/A'}</p>
                          {vessel.is_subscribed ? (
                            <button
                              className="btn btn-danger"
                              onClick={() => handleUnsubscribe(vessel.id)}
                            >
                              Unsubscribe
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary"
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

      {/* Vessel List */}
      <div className="card">
        <h3>Vessel List ({displayVessels.length} vessels)</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {displayVessels.length === 0 ? (
            <p>No vessels found matching your criteria.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {displayVessels.map((vessel, index) => (
                <div
                  key={showLiveData ? `live-${vessel.mmsi}-${index}` : vessel.id}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h4>{vessel.name}</h4>
                    <p>
                      <strong>MMSI:</strong> {vessel.mmsi} |{' '}
                      <strong>Type:</strong> {vessel.vessel_type || vessel.type} |{' '}
                      <strong>Flag:</strong> {vessel.flag}
                    </p>
                    {showLiveData ? (
                      <p>
                        <strong>Position:</strong> {vessel.latitude?.toFixed(4)}, {vessel.longitude?.toFixed(4)} |{' '}
                        <strong>Speed:</strong> {vessel.speed?.toFixed(1) || 'N/A'} knots |{' '}
                        <strong>Status:</strong> {vessel.status}
                      </p>
                    ) : (
                      vessel.latest_position && (
                        <p>
                          <strong>Last Position:</strong>{' '}
                          {vessel.latest_position.latitude.toFixed(4)}, {vessel.latest_position.longitude.toFixed(4)} |{' '}
                          <strong>Speed:</strong> {vessel.latest_position.speed || 'N/A'} knots
                        </p>
                      )
                    )}
                  </div>
                  <div>
                    {!showLiveData && (
                      vessel.is_subscribed ? (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleUnsubscribe(vessel.id)}
                        >
                          Unsubscribe
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSubscribe(vessel.id)}
                        >
                          Subscribe
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselTracking;