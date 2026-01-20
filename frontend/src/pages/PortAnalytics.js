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
    <div className="container" style={{ paddingTop: '0.5rem' }}>
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Port Analytics</h1>
        <p style={{ fontSize: '0.9rem', margin: '0' }}>Monitor port congestion and traffic patterns worldwide</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Search Ports</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Search by port name..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              className="form-control"
              placeholder="Filter by country..."
              value={filters.country}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card">
        <h2>Port Locations</h2>
        <div style={{ height: '400px', width: '100%' }}>
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

      {/* Statistics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🏗️</div>
          <div className="metric-content">
            <div className="metric-number">{ports.length}</div>
            <div className="metric-label">Total Ports</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🚨</div>
          <div className="metric-content">
            <div className="metric-number">
              {ports.filter(p => p.latest_congestion?.congestion_level === 'critical').length}
            </div>
            <div className="metric-label">Critical Congestion</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-number">
              {ports.filter(p => p.latest_congestion?.congestion_level === 'high').length}
            </div>
            <div className="metric-label">High Congestion</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-number">
              {ports.filter(p => p.latest_congestion?.congestion_level === 'low').length}
            </div>
            <div className="metric-label">Low Congestion</div>
          </div>
        </div>
      </div>

      {/* Port List */}
      <div className="card">
        <h2>Port Details ({ports.length} ports)</h2>
        {ports.length === 0 ? (
          <p>No ports found matching your criteria.</p>
        ) : (
          <div className="features-grid">
            {ports.map((port) => (
              <div key={port.id} className="feature-card">
                <h3>{port.name}</h3>
                <p><strong>Code:</strong> {port.code}</p>
                <p><strong>Country:</strong> {port.country}</p>
                {port.latest_congestion ? (
                  <div>
                    <p><strong>Congestion:</strong> {port.latest_congestion.congestion_level}</p>
                    <p><strong>Waiting:</strong> {port.latest_congestion.vessels_waiting} vessels</p>
                    <p><strong>Wait Time:</strong> {port.latest_congestion.average_wait_time.toFixed(1)} hours</p>
                  </div>
                ) : (
                  <p><em>No congestion data</em></p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortAnalytics;