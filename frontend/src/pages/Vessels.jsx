import React, { useState, useEffect } from 'react';
import { Ship, Search, Filter, RefreshCw, Bell, Activity } from 'lucide-react';
import { getVessels } from '../api/vessels';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import NotificationManager from '../components/NotificationManager';
import { websocketService } from '../services/websocket';

const Vessels = () => {
  const { user } = useAuth();
  
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    flag: '',
    operator: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vessel type emojis
  const vesselEmojis = {
    'Container Ship': '🚢',
    'Oil Tanker': '🛢️',
    'Bulk Carrier': '📦',
    'Cruise Ship': '🛳️',
    'Ferry': '⛴️',
    'LNG Carrier': '⚓',
    'Research Vessel': '🔬',
    'Offshore Supply': '🚤',
    'Icebreaker': '🧊',
    'Fishing Vessel': '🎣',
    'Naval Vessel': '⚔️',
    'Tugboat': '🚁',
    'General Cargo': '📦',
    'Yacht': '⛵',
    'Heavy Lift': '🏗️',
    'Chemical Tanker': '⚗️',
    'Ro-Ro Vessel': '🚗',
    'Grain Carrier': '🌾'
  };

  const fetchVessels = async () => {
    setLoading(true);
    setError(null);
    
    console.log('Starting fetchVessels...');
    
    try {
      const response = await getVessels();
      console.log('Full API Response:', response);
      
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.results && Array.isArray(response.results)) {
        data = response.results;
      } else {
        if (response && typeof response === 'object') {
          data = response.data || response.vessels || response.results || [];
        } else {
          data = [];
        }
      }
      
      console.log('Final data to set:', data);
      setVessels(data);
      setFilteredVessels(data);
      
      if (data.length > 0 && !selectedVessel) {
        setSelectedVessel(data[0]);
      }
    } catch (err) {
      console.error('Fetch error details:', err);
      setError(`Failed to fetch vessels: ${err.message || err.toString()}`);
      setVessels([]);
      setFilteredVessels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    let filtered = vessels;

    if (searchTerm) {
      filtered = filtered.filter(vessel =>
        vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vessel.mmsi && vessel.mmsi.includes(searchTerm)) ||
        (vessel.vessel_type && vessel.vessel_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.type) {
      filtered = filtered.filter(v => v.vessel_type === filters.type);
    }
    if (filters.flag) {
      filtered = filtered.filter(v => v.flag === filters.flag);
    }

    setFilteredVessels(filtered);
  }, [searchTerm, filters, vessels]);

  const handleBellClick = (vessel, e) => {
    e.stopPropagation();
    toast.success(`🔔 Subscribed to ${vessel.name} alerts`, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      flag: '',
      operator: ''
    });
  };

  const uniqueTypes = Array.isArray(vessels) 
    ? [...new Set(vessels.map(v => v.vessel_type).filter(Boolean))]
    : [];
  const uniqueFlags = Array.isArray(vessels)
    ? [...new Set(vessels.map(v => v.flag).filter(Boolean))]
    : [];

  const getVesselIcon = (type) => {
    const colors = {
      'Container Ship': '#3b82f6',
      'Oil Tanker': '#ef4444',
      'Bulk Carrier': '#f59e0b',
      'Cruise Ship': '#8b5cf6',
      'Ferry': '#10b981',
      'LNG Carrier': '#06b6d4',
      'Research Vessel': '#6366f1',
      'Offshore Supply': '#f97316',
      'Icebreaker': '#0ea5e9',
      'Fishing Vessel': '#14b8a6',
      'Naval Vessel': '#64748b',
      'Tugboat': '#84cc16',
      'General Cargo': '#a855f7',
      'Yacht': '#ec4899',
      'Heavy Lift': '#f43f5e',
      'Chemical Tanker': '#d946ef',
      'Ro-Ro Vessel': '#22c55e',
      'Grain Carrier': '#eab308'
    };
    return colors[type] || '#3b82f6';
  };

  const getVesselEmoji = (type) => {
    return vesselEmojis[type] || '🚢';
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: showFilters ? '20px' : 0 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                width: '20px',
                height: '20px'
              }} />
              <input
                type="text"
                placeholder="Search vessels by name, MMSI, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '48px',
                  paddingRight: '20px',
                  paddingTop: '14px',
                  paddingBottom: '14px',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: showFilters ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f1f5f9',
                color: showFilters ? 'white' : '#475569',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: showFilters ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
              }}
            >
              <Filter style={{ width: '18px', height: '18px' }} />
              Filters
            </button>
            <button
              onClick={fetchVessels}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {showFilters && (
            <div style={{
              paddingTop: '20px',
              borderTop: '2px solid #e2e8f0'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    Vessel Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="">All Types ({uniqueTypes.length})</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    Flag State
                  </label>
                  <select
                    value={filters.flag}
                    onChange={(e) => setFilters({...filters, flag: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="">All Flags ({uniqueFlags.length})</option>
                    {uniqueFlags.map(flag => (
                      <option key={flag} value={flag}>{flag}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={clearFilters}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          color: '#ffffff',
          marginBottom: '20px', 
          fontSize: '14px',
          fontWeight: '600',
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          display: 'inline-block'
        }}>
          Showing {filteredVessels.length} of {vessels.length} vessels
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Vessels List */}
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '700px',
                overflowY: 'auto',
                padding: '8px'
              }}>
                {filteredVessels.length === 0 ? (
                  <div style={{
                    padding: '64px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <Ship style={{
                      width: '64px',
                      height: '64px',
                      color: '#cbd5e1',
                      margin: '0 auto 16px'
                    }} />
                    <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      {loading ? 'Loading vessels...' : 'No vessels found'}
                    </p>
                  </div>
                ) : (
                  filteredVessels.map(vessel => (
                    <div
                      key={vessel.id}
                      onClick={() => setSelectedVessel(vessel)}
                      style={{
                        backgroundColor: selectedVessel?.id === vessel.id ? '#f0f4ff' : 'white',
                        border: selectedVessel?.id === vessel.id ? '2px solid #667eea' : '2px solid transparent',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedVessel?.id === vessel.id ? '0 8px 24px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedVessel?.id !== vessel.id) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedVessel?.id !== vessel.id) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          backgroundColor: getVesselIcon(vessel.vessel_type) + '20',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '28px',
                          lineHeight: 1
                        }}>
                          {getVesselEmoji(vessel.vessel_type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontWeight: '700',
                            color: '#1e293b',
                            margin: 0,
                            fontSize: '16px'
                          }}>
                            {vessel.name}
                          </h3>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            backgroundColor: getVesselIcon(vessel.vessel_type) + '15',
                            color: getVesselIcon(vessel.vessel_type),
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            marginTop: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {vessel.vessel_type}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleBellClick(vessel, e)}
                          style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.4)';
                          }}
                        >
                          <Bell style={{ width: '18px', height: '18px', color: 'white' }} />
                        </button>
                      </div>
                      
                      <div style={{ 
                        fontSize: '13px', 
                        lineHeight: '1.8',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                        <div>
                          <span style={{ color: '#94a3b8', fontWeight: '500' }}>MMSI:</span>
                          <span style={{ color: '#1e293b', fontWeight: '600', marginLeft: '6px' }}>
                            {vessel.mmsi}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontWeight: '500' }}>Flag:</span>
                          <span style={{ color: '#1e293b', fontWeight: '600', marginLeft: '6px' }}>
                            {vessel.flag}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px'
                      }}>
                        <Activity style={{ width: '14px', height: '14px', color: '#0ea5e9' }} />
                        <span style={{ 
                          fontSize: '12px',
                          color: '#0284c7',
                          fontWeight: '600'
                        }}>
                          Speed: {vessel.speed || 'N/A'} kn • Course: {vessel.course || 'N/A'}°
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Vessel Details */}
          <div style={{ width: '420px' }}>
            {selectedVessel ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '28px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      background: `linear-gradient(135deg, ${getVesselIcon(selectedVessel.vessel_type)} 0%, ${getVesselIcon(selectedVessel.vessel_type)}dd 100%)`,
                      padding: '16px',
                      borderRadius: '16px',
                      boxShadow: `0 8px 24px ${getVesselIcon(selectedVessel.vessel_type)}40`,
                      fontSize: '32px',
                      lineHeight: 1
                    }}>
                      {getVesselEmoji(selectedVessel.vessel_type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#1e293b',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        {selectedVessel.name}
                      </h2>
                      <p style={{
                        color: '#64748b',
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        MMSI: {selectedVessel.mmsi}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVessel(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      lineHeight: 1
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e2e8f0';
                      e.target.style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Vessel Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Type', value: selectedVessel.vessel_type },
                      { label: 'Flag', value: selectedVessel.flag },
                      { label: 'IMO', value: selectedVessel.imo },
                      { label: 'Built', value: selectedVessel.year_built }
                    ].map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px'
                      }}>
                        <span style={{ 
                          color: '#64748b',
                          fontWeight: '600'
                        }}>
                          {item.label}:
                        </span>
                        <span style={{ 
                          color: '#1e293b', 
                          fontWeight: '700'
                        }}>
                          {item.value || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Live Metrics
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px', fontWeight: '600' }}>
                        SPEED
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>
                        {selectedVessel.speed || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                        knots
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px', fontWeight: '600' }}>
                        COURSE
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>
                        {selectedVessel.course || 'N/A'}°
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                        heading
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '64px 32px',
                textAlign: 'center',
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '24px',
                  borderRadius: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  <Ship style={{
                    width: '64px',
                    height: '64px',
                    color: 'white'
                  }} />
                </div>
                <p style={{ 
                  color: '#64748b', 
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Select a vessel to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Manager Component */}
        <NotificationManager />
      </div>
    </div>
  );
};

export default Vessels;