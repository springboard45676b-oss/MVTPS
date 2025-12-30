import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [vesselAnalytics, setVesselAnalytics] = useState(null);
  const [fleetComposition, setFleetComposition] = useState(null);
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedVessel]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data with error handling for each endpoint
      const promises = [
        api.get('/analytics/dashboard/').catch(err => {
          console.error('Dashboard API error:', err.response?.status || err.message);
          return { data: { summary: { total_voyages: 0, active_voyages: 0, completed_voyages: 0 }, vessel_statistics: [], recent_events: [] } };
        }),
        api.get('/analytics/vessels/').catch(err => {
          console.error('Vessel analytics API error:', err.response?.status || err.message);
          return { data: { overview: { total_vessels: 0, active_vessels: 0, total_positions: 0 }, by_type: [], by_flag: [], size_categories: {}, speed_statistics: {}, container_ships: {}, tankers: {}, passenger_ships: {}, cargo_ships: {} } };
        }),
        api.get('/analytics/fleet-composition/').catch(err => {
          console.error('Fleet composition API error:', err.response?.status || err.message);
          return { data: { fleet_composition: [], total_fleet_size: 0, total_tonnage: 0 } };
        }),
        api.get(`/analytics/voyages/${selectedVessel ? `?vessel_id=${selectedVessel}` : ''}`).catch(err => {
          console.error('Voyages API error:', err.response?.status || err.message);
          return { data: { results: [] } };
        })
      ];
      
      const [dashboardRes, vesselRes, fleetRes, voyageRes] = await Promise.all(promises);
      
      setAnalytics(dashboardRes.data);
      setVesselAnalytics(vesselRes.data);
      setFleetComposition(fleetRes.data);
      setVoyages(voyageRes.data.results || voyageRes.data);
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load some analytics data');
      
      // Set default values if everything fails
      setAnalytics({ summary: { total_voyages: 0, active_voyages: 0, completed_voyages: 0 }, vessel_statistics: [], recent_events: [] });
      setVesselAnalytics({ overview: { total_vessels: 0, active_vessels: 0, total_positions: 0 }, by_type: [], by_flag: [], size_categories: {}, speed_statistics: {}, container_ships: {}, tankers: {}, passenger_ships: {}, cargo_ships: {} });
      setFleetComposition({ fleet_composition: [], total_fleet_size: 0, total_tonnage: 0 });
      setVoyages([]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300'];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"></div>
        <p>Loading comprehensive analytics...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <span className="page-icon">📈</span>
          Maritime Analytics & Reports
        </h1>
        <p className="page-description">
          Comprehensive analysis of vessel operations, fleet composition, and maritime activities
        </p>
      </div>

      {/* Analytics Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'vessels' ? 'active' : ''}`}
          onClick={() => setActiveTab('vessels')}
        >
          🚢 Vessel Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          🏭 Fleet Composition
        </button>
        <button 
          className={`tab-button ${activeTab === 'voyages' ? 'active' : ''}`}
          onClick={() => setActiveTab('voyages')}
        >
          🗺️ Voyage Analysis
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Summary Cards */}
          {vesselAnalytics && vesselAnalytics.overview && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🚢</div>
                <div className="stat-content">
                  <div className="stat-number">{vesselAnalytics.overview.total_vessels || 0}</div>
                  <div className="stat-label">Total Vessels</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📡</div>
                <div className="stat-content">
                  <div className="stat-number">{vesselAnalytics.overview.active_vessels || 0}</div>
                  <div className="stat-label">Active Vessels</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📍</div>
                <div className="stat-content">
                  <div className="stat-number">{vesselAnalytics.overview.total_positions || 0}</div>
                  <div className="stat-label">Position Reports</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚓</div>
                <div className="stat-content">
                  <div className="stat-number">{analytics?.summary?.total_voyages || 0}</div>
                  <div className="stat-label">Total Voyages</div>
                </div>
              </div>
            </div>
          )}

          {/* Fleet Overview Charts */}
          <div className="charts-grid">
            {/* Vessel Types Distribution */}
            {vesselAnalytics?.by_type && vesselAnalytics.by_type.length > 0 && (
              <div className="chart-card">
                <h3>Fleet Distribution by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vesselAnalytics.by_type.map(item => ({
                        name: item.vessel_type || 'Unknown',
                        value: item.count || 0,
                        tonnage: item.total_tonnage || 0
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vesselAnalytics.by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [
                      `${value} vessels`,
                      `${props.payload.tonnage?.toLocaleString() || 0} GT total`
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Flags */}
            {vesselAnalytics?.by_flag && vesselAnalytics.by_flag.length > 0 && (
              <div className="chart-card">
                <h3>Top 10 Flag States</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vesselAnalytics.by_flag.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="flag" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vessel Analytics Tab */}
      {activeTab === 'vessels' && vesselAnalytics && (
        <div className="tab-content">
          {/* Vessel Type Analytics */}
          <div className="analytics-section">
            <h2>Vessel Type Analysis</h2>
            <div className="vessel-type-grid">
              {/* Container Ships */}
              {vesselAnalytics.container_ships && (
                <div className="vessel-type-card">
                  <div className="vessel-type-header">
                    <span className="vessel-icon">📦</span>
                    <h3>Container Ships</h3>
                  </div>
                  <div className="vessel-stats">
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.container_ships.total_count}</span>
                      <span className="stat-label">Total Vessels</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.container_ships.avg_capacity?.toLocaleString() || 'N/A'}</span>
                      <span className="stat-label">Avg Capacity (GT)</span>
                    </div>
                  </div>
                  {vesselAnalytics.container_ships.largest_ship && (
                    <div className="largest-vessel">
                      <strong>Largest:</strong> {vesselAnalytics.container_ships.largest_ship.name}
                      <br />
                      <small>{vesselAnalytics.container_ships.largest_ship.gross_tonnage?.toLocaleString()} GT</small>
                    </div>
                  )}
                </div>
              )}

              {/* Tankers */}
              {vesselAnalytics.tankers && (
                <div className="vessel-type-card">
                  <div className="vessel-type-header">
                    <span className="vessel-icon">🛢️</span>
                    <h3>Tankers</h3>
                  </div>
                  <div className="vessel-stats">
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.tankers.total_count}</span>
                      <span className="stat-label">Total Vessels</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.tankers.avg_capacity?.toLocaleString() || 'N/A'}</span>
                      <span className="stat-label">Avg Capacity (GT)</span>
                    </div>
                  </div>
                  {vesselAnalytics.tankers.largest_tanker && (
                    <div className="largest-vessel">
                      <strong>Largest:</strong> {vesselAnalytics.tankers.largest_tanker.name}
                      <br />
                      <small>{vesselAnalytics.tankers.largest_tanker.gross_tonnage?.toLocaleString()} GT</small>
                    </div>
                  )}
                </div>
              )}

              {/* Passenger Ships */}
              {vesselAnalytics.passenger_ships && (
                <div className="vessel-type-card">
                  <div className="vessel-type-header">
                    <span className="vessel-icon">🛳️</span>
                    <h3>Passenger Ships</h3>
                  </div>
                  <div className="vessel-stats">
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.passenger_ships.total_count}</span>
                      <span className="stat-label">Total Vessels</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.passenger_ships.avg_size?.toLocaleString() || 'N/A'}</span>
                      <span className="stat-label">Avg Size (GT)</span>
                    </div>
                  </div>
                  {vesselAnalytics.passenger_ships.largest_cruise && (
                    <div className="largest-vessel">
                      <strong>Largest:</strong> {vesselAnalytics.passenger_ships.largest_cruise.name}
                      <br />
                      <small>{vesselAnalytics.passenger_ships.largest_cruise.gross_tonnage?.toLocaleString()} GT</small>
                    </div>
                  )}
                </div>
              )}

              {/* Cargo Ships */}
              {vesselAnalytics.cargo_ships && (
                <div className="vessel-type-card">
                  <div className="vessel-type-header">
                    <span className="vessel-icon">📋</span>
                    <h3>Cargo Ships</h3>
                  </div>
                  <div className="vessel-stats">
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.cargo_ships.total_count}</span>
                      <span className="stat-label">Total Vessels</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{vesselAnalytics.cargo_ships.avg_capacity?.toLocaleString() || 'N/A'}</span>
                      <span className="stat-label">Avg Capacity (GT)</span>
                    </div>
                  </div>
                  {vesselAnalytics.cargo_ships.largest_cargo && (
                    <div className="largest-vessel">
                      <strong>Largest:</strong> {vesselAnalytics.cargo_ships.largest_cargo.name}
                      <br />
                      <small>{vesselAnalytics.cargo_ships.largest_cargo.gross_tonnage?.toLocaleString()} GT</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Size Categories */}
          {vesselAnalytics.size_categories && (
            <div className="chart-card">
              <h3>Fleet Size Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { category: 'Small (<100m)', count: vesselAnalytics.size_categories.small },
                  { category: 'Medium (100-200m)', count: vesselAnalytics.size_categories.medium },
                  { category: 'Large (200-300m)', count: vesselAnalytics.size_categories.large },
                  { category: 'Very Large (>300m)', count: vesselAnalytics.size_categories.very_large },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Fleet Composition Tab */}
      {activeTab === 'fleet' && fleetComposition && (
        <div className="tab-content">
          <div className="fleet-overview">
            <h2>Fleet Composition Analysis</h2>
            <div className="fleet-summary">
              <div className="summary-item">
                <span className="summary-value">{fleetComposition.total_fleet_size}</span>
                <span className="summary-label">Total Fleet Size</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{fleetComposition.total_tonnage?.toLocaleString() || 0}</span>
                <span className="summary-label">Total Tonnage (GT)</span>
              </div>
            </div>
          </div>

          <div className="fleet-composition-grid">
            {fleetComposition.fleet_composition.map((type, index) => (
              <div key={type.type} className="fleet-type-card">
                <div className="fleet-type-header">
                  <h3>{type.type_name}</h3>
                  <span className="fleet-percentage">{type.percentage.toFixed(1)}%</span>
                </div>
                
                <div className="fleet-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Count:</span>
                    <span className="metric-value">{type.count}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Avg Length:</span>
                    <span className="metric-value">{type.avg_length?.toFixed(1) || 'N/A'}m</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Avg Tonnage:</span>
                    <span className="metric-value">{type.avg_tonnage?.toLocaleString() || 'N/A'} GT</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Total Tonnage:</span>
                    <span className="metric-value">{type.total_tonnage?.toLocaleString() || 'N/A'} GT</span>
                  </div>
                </div>

                {type.newest_vessel && (
                  <div className="vessel-highlight">
                    <strong>Newest:</strong> {type.newest_vessel.name} ({type.newest_vessel.built_year})
                  </div>
                )}

                {type.largest_vessel && (
                  <div className="vessel-highlight">
                    <strong>Largest:</strong> {type.largest_vessel.name} ({type.largest_vessel.gross_tonnage?.toLocaleString()} GT)
                  </div>
                )}

                {type.top_flags && type.top_flags.length > 0 && (
                  <div className="top-flags">
                    <strong>Top Flags:</strong>
                    {type.top_flags.slice(0, 3).map((flag, i) => (
                      <span key={i} className="flag-badge">
                        {flag.flag} ({flag.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voyages Tab */}
      {activeTab === 'voyages' && (
        <div className="tab-content">
          <div className="voyage-controls">
            <h2>Voyage Analysis</h2>
            <div className="filter-section">
              <label>Filter by Vessel ID:</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Enter vessel ID"
                value={selectedVessel}
                onChange={(e) => setSelectedVessel(e.target.value)}
              />
            </div>
          </div>

          {/* Voyage Statistics */}
          {analytics && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🗺️</div>
                <div className="stat-content">
                  <div className="stat-number">{analytics.summary.total_voyages}</div>
                  <div className="stat-label">Total Voyages</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚢</div>
                <div className="stat-content">
                  <div className="stat-number">{analytics.summary.active_voyages}</div>
                  <div className="stat-label">Active Voyages</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">{analytics.summary.completed_voyages}</div>
                  <div className="stat-label">Completed Voyages</div>
                </div>
              </div>
            </div>
          )}

          {/* Voyage List */}
          <div className="voyage-list">
            {voyages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗺️</div>
                <h3>No voyage data available</h3>
                <p>No voyages found matching your criteria.</p>
              </div>
            ) : (
              voyages.map((voyage) => (
                <div key={voyage.id} className="voyage-card">
                  <div className="voyage-header">
                    <h4>
                      {voyage.vessel?.name || 'Unknown Vessel'} - Voyage #{voyage.id}
                    </h4>
                    <span className={`status-badge status-${voyage.status}`}>
                      {voyage.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="voyage-details">
                    <div className="route-info">
                      <span className="route-point">
                        📍 {voyage.origin_port?.name || 'Unknown Origin'}
                      </span>
                      <span className="route-arrow">→</span>
                      <span className="route-point">
                        🏗️ {voyage.destination_port?.name || 'Unknown Destination'}
                      </span>
                    </div>
                    
                    <div className="voyage-metadata">
                      {voyage.departure_time && (
                        <div className="metadata-item">
                          <strong>Departure:</strong> {new Date(voyage.departure_time).toLocaleString()}
                        </div>
                      )}
                      {voyage.arrival_time && (
                        <div className="metadata-item">
                          <strong>Arrival:</strong> {new Date(voyage.arrival_time).toLocaleString()}
                        </div>
                      )}
                      {voyage.distance && (
                        <div className="metadata-item">
                          <strong>Distance:</strong> {voyage.distance.toFixed(1)} nautical miles
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;