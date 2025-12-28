import React, { useState, useEffect } from 'react';
import { Ship, Search, Filter, RefreshCw, MapPin, Clock, Anchor } from 'lucide-react';
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Vessels = () => {
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilteras] = useState({
    type: '',
    flag: '',
    cargoType: '',
    operator: ''
  });

  const sampleVessels = [
    {
      id: 1,
      name: 'MSC Gulseum',
      imoNumber: '9632730',
      type: 'Container Ship',
      flag: 'Liberia',
      cargoType: 'Containers',
      operator: 'Mediterranean Shipping Company',
      position: '24.3498°N, -44.9939°E',
      lastUpdated: '2 mins ago',
      speed: '18.5 knots',
      course: '045°'
    },
    {
      id: 2,
      name: 'COSCO Shipping Universe',
      imoNumber: '9350627',
      type: 'Container Ship',
      flag: 'Hong Kong',
      cargoType: 'Containers',
      operator: 'COSCO Shipping Lines',
      position: '34.3567°, -74.1129°',
      lastUpdated: '5 mins ago',
      speed: '16.2 knots',
      course: '180°'
    },
    {
      id: 3,
      name: 'Emma Maersk',
      imoNumber: '9321483',
      type: 'Container Ship',
      flag: 'Denmark',
      cargoType: 'Containers',
      operator: 'Maersk Line',
      position: '51.5074°N, -0.1278°W',
      lastUpdated: '1 min ago',
      speed: '22.1 knots',
      course: '270°'
    },
    {
      id: 4,
      name: 'Pacific Explorer',
      imoNumber: '9187887',
      type: 'Bulk Carrier',
      flag: 'Panama',
      cargoType: 'Iron Ore',
      operator: 'Pacific Shipping Co',
      position: '35.6762°N, 139.6503°E',
      lastUpdated: '8 mins ago',
      speed: '14.8 knots',
      course: '090°'
    },
    {
      id: 5,
      name: 'Atlantic Spirit',
      imoNumber: '9456123',
      type: 'Tanker',
      flag: 'Marshall Islands',
      cargoType: 'Crude Oil',
      operator: 'Atlantic Tankers Ltd',
      position: '40.7128°N, -74.0060°W',
      lastUpdated: '3 mins ago',
      speed: '12.5 knots',
      course: '315°'
    }
  ];

  useEffect(() => {
    setVessels(sampleVessels);
    setFilteredVessels(sampleVessels);
    if (sampleVessels.length > 0) {
      setSelectedVessel(sampleVessels[0]);
    }
  }, []);

  useEffect(() => {
    let filtered = vessels;

    if (searchTerm) {
      filtered = filtered.filter(vessel =>
        vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.imoNumber.includes(searchTerm) ||
        vessel.operator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(v => v.type === filters.type);
    }
    if (filters.flag) {
      filtered = filtered.filter(v => v.flag === filters.flag);
    }
    if (filters.cargoType) {
      filtered = filtered.filter(v => v.cargoType === filters.cargoType);
    }

    setFilteredVessels(filtered);
  }, [searchTerm, filters, vessels]);

  const handleRefresh = () => {
    console.log('Refreshing vessel data...');
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      flag: '',
      cargoType: '',
      operator: ''
    });
  };

  const uniqueTypes = [...new Set(vessels.map(v => v.type))];
  const uniqueFlags = [...new Set(vessels.map(v => v.flag))];
  const uniqueCargoTypes = [...new Set(vessels.map(v => v.cargoType))];

  return (
    <main className="content" style={{ 
      width: '100%', 
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <Navbar title="Vessels" />
      
      {/* Page Header */}
      <div style={{ marginBottom: '24px', marginTop: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              padding: '8px', 
              borderRadius: '8px' 
            }}>
              <Ship style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: 'white',
              margin: 0
            }}>
              Fleet Management
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'white',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Auto-refresh every 10 seconds
            </label>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Refresh
            </button>
          </div>
        </div>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '14px',
          margin: 0 
        }}>
          Search, filter, and monitor your vessel fleet in real-time
        </p>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: showFilters ? '16px' : 0 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              width: '20px',
              height: '20px'
            }} />
            <input
              type="text"
              placeholder="Search by vessel name, IMO, or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                backgroundColor: '#334155',
                color: 'white',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: showFilters ? '#3b82f6' : '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            Filters
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #334155'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginBottom: '8px'
                }}>
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#334155',
                    color: 'white',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginBottom: '8px'
                }}>
                  Flag
                </label>
                <select
                  value={filters.flag}
                  onChange={(e) => setFilters({...filters, flag: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#334155',
                    color: 'white',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Flags</option>
                  {uniqueFlags.map(flag => (
                    <option key={flag} value={flag}>{flag}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#94a3b8',
                  marginBottom: '8px'
                }}>
                  Cargo Type
                </label>
                <select
                  value={filters.cargoType}
                  onChange={(e) => setFilters({...filters, cargoType: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#334155',
                    color: 'white',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Cargo</option>
                  {uniqueCargoTypes.map(cargo => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={clearFilters}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: '#334155',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
        Showing {filteredVessels.length} of {vessels.length} vessels
      </div>

      {/* Vessel Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr',
        gap: '24px'
      }}>
        {/* Vessel List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {filteredVessels.map(vessel => (
            <div
              key={vessel.id}
              onClick={() => setSelectedVessel(vessel)}
              style={{
                backgroundColor: '#1e293b',
                border: selectedVessel?.id === vessel.id ? '2px solid #3b82f6' : '1px solid #334155',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Ship style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                <h3 style={{
                  fontWeight: '600',
                  color: 'white',
                  margin: 0,
                  fontSize: '16px'
                }}>
                  {vessel.name}
                </h3>
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ color: '#94a3b8' }}>IMO: {vessel.imoNumber}</div>
                <div style={{ color: '#94a3b8' }}>Type: {vessel.type}</div>
                <div style={{ color: '#94a3b8' }}>Flag: {vessel.flag}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#60a5fa',
                  marginTop: '4px'
                }}>
                  <MapPin style={{ width: '12px', height: '12px' }} />
                  {vessel.position}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vessel Details */}
        <div>
          {selectedVessel ? (
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    backgroundColor: '#3b82f6',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <Anchor style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: 'white',
                      margin: 0
                    }}>
                      {selectedVessel.name}
                    </h2>
                    <p style={{
                      color: '#94a3b8',
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      IMO: {selectedVessel.imoNumber}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#94a3b8',
                  fontSize: '14px'
                }}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  Last Updated: {selectedVessel.lastUpdated}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>
                    Vessel Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Type:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>{selectedVessel.type}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Flag:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>{selectedVessel.flag}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Cargo Type:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>{selectedVessel.cargoType}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Operator:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>{selectedVessel.operator}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>
                    Current Position
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Coordinates</div>
                        <div style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>
                          {selectedVessel.position}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid #334155',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Speed:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>{selectedVessel.speed}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>Course:</span>
                      <span style={{ color: 'white', fontWeight: '500' }}>{selectedVessel.course}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                paddingTop: '24px',
                borderTop: '1px solid #334155'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '16px'
                }}>
                  Movement Statistics
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  <div style={{
                    backgroundColor: '#334155',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      Average Speed
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
                      17.3 kn
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#334155',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      Distance Traveled
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>
                      2,847 nm
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#334155',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      ETA
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a78bfa' }}>
                      32h 15m
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <Ship style={{
                width: '64px',
                height: '64px',
                color: '#475569',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#94a3b8' }}>Select a vessel to view details</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Vessels;