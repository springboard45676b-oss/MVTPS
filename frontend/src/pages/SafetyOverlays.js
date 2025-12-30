import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';

const SafetyOverlays = () => {
  const [safetyZones, setSafetyZones] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    zoneType: '',
    riskLevel: '',
  });

  useEffect(() => {
    fetchSafetyData();
  }, [filters]);

  const fetchSafetyData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.zoneType) params.append('type', filters.zoneType);
      if (filters.riskLevel) params.append('risk_level', filters.riskLevel);

      const [zonesResponse, weatherResponse] = await Promise.all([
        api.get(`/safety/zones/?${params}`),
        api.get('/safety/weather/')
      ]);

      setSafetyZones(zonesResponse.data.results || zonesResponse.data);
      setWeatherData(weatherResponse.data.results || weatherResponse.data);
    } catch (error) {
      console.error('Failed to fetch safety data:', error);
      toast.error('Failed to load safety data');
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

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getZoneTypeColor = (zoneType) => {
    switch (zoneType) {
      case 'piracy': return '#dc3545';
      case 'storm': return '#007bff';
      case 'accident': return '#fd7e14';
      case 'restricted': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading safety data...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h1>Safety Overlays</h1>

      {/* Filters */}
      <div className="card">
        <h3>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label>Zone Type</label>
            <select
              name="zoneType"
              className="form-control"
              value={filters.zoneType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="piracy">Piracy Risk</option>
              <option value="storm">Storm Warning</option>
              <option value="accident">Accident Zone</option>
              <option value="restricted">Restricted Area</option>
            </select>
          </div>

          <div className="form-group">
            <label>Risk Level</label>
            <select
              name="riskLevel"
              className="form-control"
              value={filters.riskLevel}
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3>Legend</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <h4>Zone Types</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545' }}></div>
                <span>Piracy Risk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#007bff' }}></div>
                <span>Storm Warning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#fd7e14' }}></div>
                <span>Accident Zone</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#6f42c1' }}></div>
                <span>Restricted Area</span>
              </div>
            </div>
          </div>
          <div>
            <h4>Risk Levels</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#28a745' }}></div>
                <span>Low Risk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107' }}></div>
                <span>Medium Risk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#fd7e14' }}></div>
                <span>High Risk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545' }}></div>
                <span>Critical Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card">
        <h3>Safety Zones & Weather Data</h3>
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Safety Zones */}
            {safetyZones.map((zone) => (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color: getZoneTypeColor(zone.zone_type),
                  fillColor: getRiskColor(zone.risk_level),
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <h4>{zone.name}</h4>
                    <p><strong>Type:</strong> {zone.zone_type}</p>
                    <p><strong>Risk Level:</strong> {zone.risk_level}</p>
                    <p><strong>Description:</strong> {zone.description}</p>
                    <p><strong>Active:</strong> {zone.active ? 'Yes' : 'No'}</p>
                    {zone.expires_at && (
                      <p><strong>Expires:</strong> {new Date(zone.expires_at).toLocaleString()}</p>
                    )}
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* Weather Data Points */}
            {weatherData.slice(0, 50).map((weather, index) => (
              <Marker
                key={index}
                position={[weather.latitude, weather.longitude]}
              >
                <Popup>
                  <div>
                    <h4>Weather Data</h4>
                    <p><strong>Wind Speed:</strong> {weather.wind_speed} m/s</p>
                    <p><strong>Wind Direction:</strong> {weather.wind_direction}°</p>
                    {weather.wave_height && (
                      <p><strong>Wave Height:</strong> {weather.wave_height} m</p>
                    )}
                    {weather.visibility && (
                      <p><strong>Visibility:</strong> {weather.visibility} km</p>
                    )}
                    {weather.temperature && (
                      <p><strong>Temperature:</strong> {weather.temperature}°C</p>
                    )}
                    <p><strong>Timestamp:</strong> {new Date(weather.timestamp).toLocaleString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Safety Zones List */}
      <div className="card">
        <h3>Active Safety Zones ({safetyZones.length} zones)</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {safetyZones.length === 0 ? (
            <p>No safety zones found matching your criteria.</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {safetyZones.map((zone) => (
                <div
                  key={zone.id}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    borderLeft: `5px solid ${getZoneTypeColor(zone.zone_type)}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4>{zone.name}</h4>
                      <p><strong>Type:</strong> {zone.zone_type} | <strong>Risk:</strong> {zone.risk_level}</p>
                      <p>{zone.description}</p>
                      {zone.expires_at && (
                        <p><strong>Expires:</strong> {new Date(zone.expires_at).toLocaleString()}</p>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '5px 10px',
                        backgroundColor: getRiskColor(zone.risk_level),
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {zone.risk_level.toUpperCase()}
                    </div>
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

export default SafetyOverlays;