import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';

const PortAnalytics = () => {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    search: '',
  });

  useEffect(() => {
    fetchPorts();
  }, [filters]);

  const fetchPorts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.country) params.append('country', filters.country);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/ports/?${params}`);
      setPorts(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch ports:', error);
      toast.error('Failed to load ports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const getCongestionColor = (level) => {
    switch (level) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const createPortIcon = (congestionLevel) => {
    const color = getCongestionColor(congestionLevel);
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  if (loading) {
    return <div className="loading">Loading ports...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h1>Port Analytics</h1>

      {/* Filters */}
      <div className="card">
        <h3>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              className="form-control"
              placeholder="Enter country name"
              value={filters.country}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Search port name"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Congestion Legend */}
      <div className="card">
        <h3>Congestion Levels</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'green', borderRadius: '50%' }}></div>
            <span>Low</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'yellow', borderRadius: '50%' }}></div>
            <span>Medium</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'orange', borderRadius: '50%' }}></div>
            <span>High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'red', borderRadius: '50%' }}></div>
            <span>Critical</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: 'gray', borderRadius: '50%' }}></div>
            <span>No Data</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card">
        <h3>Port Locations & Congestion</h3>
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
            {ports.map((port) => (
              <Marker
                key={port.id}
                position={[port.latitude, port.longitude]}
                icon={createPortIcon(port.latest_congestion?.congestion_level)}
              >
                <Popup>
                  <div>
                    <h4>{port.name}</h4>
                    <p><strong>Code:</strong> {port.code}</p>
                    <p><strong>Country:</strong> {port.country}</p>
                    <p><strong>Coordinates:</strong> {port.latitude.toFixed(4)}, {port.longitude.toFixed(4)}</p>
                    {port.latest_congestion ? (
                      <div>
                        <p><strong>Congestion Level:</strong> {port.latest_congestion.congestion_level}</p>
                        <p><strong>Vessels Waiting:</strong> {port.latest_congestion.vessels_waiting}</p>
                        <p><strong>Avg Wait Time:</strong> {port.latest_congestion.average_wait_time.toFixed(1)} hours</p>
                        <p><strong>Last Update:</strong> {new Date(port.latest_congestion.timestamp).toLocaleString()}</p>
                      </div>
                    ) : (
                      <p><em>No congestion data available</em></p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Port List */}
      <div className="card">
        <h3>Port List ({ports.length} ports)</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {ports.length === 0 ? (
            <p>No ports found matching your criteria.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {ports.map((port) => (
                <div
                  key={port.id}
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
                    <h4>{port.name} ({port.code})</h4>
                    <p>
                      <strong>Country:</strong> {port.country} |{' '}
                      <strong>Coordinates:</strong> {port.latitude.toFixed(4)}, {port.longitude.toFixed(4)}
                    </p>
                    {port.latest_congestion ? (
                      <p>
                        <strong>Congestion:</strong> {port.latest_congestion.congestion_level} |{' '}
                        <strong>Waiting Vessels:</strong> {port.latest_congestion.vessels_waiting} |{' '}
                        <strong>Avg Wait:</strong> {port.latest_congestion.average_wait_time.toFixed(1)}h
                      </p>
                    ) : (
                      <p><em>No congestion data available</em></p>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: getCongestionColor(port.latest_congestion?.congestion_level),
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      title={port.latest_congestion?.congestion_level || 'No data'}
                    ></div>
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

export default PortAnalytics;