import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LiveTracking = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const mapContainerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  
  const [filters, setFilters] = useState({
    vesselType: 'all',
    search: ''
  });

  const vessels = [
    { id: 1, name: 'MV Vessel 17', mmsi: '419000017', type: 'Container', speed: 7, lat: 17.385, lng: 78.486 },
    { id: 2, name: 'Ocean Carrier', mmsi: '419000234', type: 'Cargo', speed: 12, lat: 19.076, lng: 72.877 },
    { id: 3, name: 'Bay Navigator', mmsi: '419000456', type: 'Tanker', speed: 9, lat: 13.082, lng: 80.270 },
    { id: 4, name: 'Coastal Pride', mmsi: '419000789', type: 'Container', speed: 11, lat: 22.572, lng: 88.363 },
    { id: 5, name: 'Marine Express', mmsi: '419001234', type: 'Cargo', speed: 15, lat: 15.317, lng: 75.713 },
    { id: 6, name: 'Port Phoenix', mmsi: '419001567', type: 'Tanker', speed: 8, lat: 21.146, lng: 79.088 },
    { id: 7, name: 'Sea Guardian', mmsi: '419001890', type: 'Container', speed: 10, lat: 18.520, lng: 73.856 },
    { id: 8, name: 'Wave Master', mmsi: '419002123', type: 'Cargo', speed: 11, lat: 16.706, lng: 74.243 },
    { id: 9, name: 'Atlantic Hope', mmsi: '419002456', type: 'Tanker', speed: 13, lat: 20.940, lng: 70.402 },
    { id: 10, name: 'Delta Star', mmsi: '419002789', type: 'Container', speed: 10, lat: 12.971, lng: 77.594 },
    { id: 11, name: 'Horizon Trader', mmsi: '419003012', type: 'Cargo', speed: 14, lat: 11.062, lng: 78.153 },
    { id: 12, name: 'Pacific Belle', mmsi: '419003345', type: 'Tanker', speed: 9, lat: 23.026, lng: 72.571 },
    { id: 13, name: 'Eastern Star', mmsi: '419003678', type: 'Container', speed: 12, lat: 19.913, lng: 85.831 },
    { id: 14, name: 'Sunrise Cargo', mmsi: '419003901', type: 'Cargo', speed: 8, lat: 8.524, lng: 76.936 },
    { id: 15, name: 'Blue Wave', mmsi: '419004234', type: 'Tanker', speed: 15, lat: 17.686, lng: 83.218 },
  ];

  const filteredVessels = vessels.filter(vessel => {
    const matchesType = filters.vesselType === 'all' || vessel.type === filters.vesselType;
    const matchesSearch = !filters.search || 
      vessel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vessel.mmsi.includes(filters.search);
    
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initMap, 200);
        };
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || mapContainerRef.current.querySelector('.leaflet-container')) return;
      
      const L = window.L;
      if (!L) return;

      const map = L.map(mapContainerRef.current).setView([17.385, 78.486], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      vessels.forEach(vessel => {
        const icon = L.divIcon({
          html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([vessel.lat, vessel.lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${vessel.name}</b><br>MMSI: ${vessel.mmsi}<br>Type: ${vessel.type}`);
        marker.on('click', () => {
          setSelectedVessel(vessel);
          map.setView([vessel.lat, vessel.lng], 10);
        });
      });

      setMapReady(true);
    };

    loadLeaflet();
  }, []);

  const handleVesselClick = (vessel) => {
    setSelectedVessel(vessel);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'white' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '6px', color: 'white', fontSize: '24px' }}>
            🚢
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>MVTPS</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '8px 20px', border: 'none', background: 'transparent', color: '#4b5563', fontWeight: '500', cursor: 'pointer' }}>
            Dashboard
          </button>
          <button style={{ padding: '8px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Live Tracking
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '320px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 8px rgba(0,0,0,0.05)' }}>
          {/* Filter Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#374151', fontWeight: '600', cursor: 'pointer', width: '100%', fontSize: '16px' }}
            >
              <span>🔍 Filters</span>
              <span style={{ marginLeft: 'auto', fontSize: '20px' }}>{showFilters ? '×' : '☰'}</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{ padding: '20px', background: '#eff6ff', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Search Vessel</label>
                <input
                  type="text"
                  placeholder="Name or MMSI..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Vessel Type</label>
                <select
                  value={filters.vesselType}
                  onChange={(e) => setFilters({...filters, vesselType: e.target.value})}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                >
                  <option value="all">All Types</option>
                  <option value="Container">Container</option>
                  <option value="Cargo">Cargo</option>
                  <option value="Tanker">Tanker</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ vesselType: 'all', search: '' })}
                style={{ width: '100%', padding: '8px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Vessel List */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', fontWeight: '500' }}>
                {filteredVessels.length} vessel{filteredVessels.length !== 1 ? 's' : ''} found
              </div>
              {filteredVessels.map(vessel => (
                <div
                  key={vessel.id}
                  onClick={() => handleVesselClick(vessel)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '1px solid ' + (selectedVessel?.id === vessel.id ? '#3b82f6' : '#e5e7eb'),
                    background: selectedVessel?.id === vessel.id ? '#3b82f6' : 'white',
                    marginBottom: '12px',
                    boxShadow: selectedVessel?.id === vessel.id ? '0 4px 12px rgba(59,130,246,0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px', color: selectedVessel?.id === vessel.id ? 'white' : '#1f2937' }}>
                        {vessel.name}
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '8px', color: selectedVessel?.id === vessel.id ? '#dbeafe' : '#6b7280' }}>
                        MMSI: {vessel.mmsi}
                      </div>
                      <div style={{ fontSize: '14px', display: 'flex', gap: '12px', color: selectedVessel?.id === vessel.id ? '#dbeafe' : '#6b7280' }}>
                        <span>Type: {vessel.type}</span>
                        <span>Speed: {vessel.speed} kn</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '20px' }}>📍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, position: 'relative', background: '#f3f4f6' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          
          {!mapReady && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', zIndex: 50 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#374151', fontWeight: '600', fontSize: '18px' }}>Loading Map...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            </div>
          )}
          
          {/* Selected Vessel Info Card */}
          {selectedVessel && mapReady && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              padding: '20px',
              width: '320px',
              zIndex: 1000,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '20px', color: '#1f2937', margin: 0 }}>{selectedVessel.name}</h3>
                <button
                  onClick={() => setSelectedVessel(null)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '24px', cursor: 'pointer', padding: 0 }}
                >
                  ×
                </button>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>MMSI:</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedVessel.mmsi}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>Type:</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedVessel.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>Speed:</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{selectedVessel.speed} knots</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                  <span style={{ color: '#6b7280', fontWeight: '500' }}>Position:</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                    {selectedVessel.lat.toFixed(3)}°, {selectedVessel.lng.toFixed(3)}°
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;