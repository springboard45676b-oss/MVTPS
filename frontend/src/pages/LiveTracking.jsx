import React, { useState, useEffect, useRef } from 'react';
import { getVessels } from '../api/vessels';
import { getPorts } from '../api/ports';
import NotificationManager from '../components/NotificationManager';
import { MapPin, Anchor, Ship, Navigation } from 'lucide-react';

const LiveTracking = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const portMarkersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [vessels, setVessels] = useState([]);
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ vesselType: 'all', search: '', showVessels: true, showPorts: true });
  const [subscribedVessels, setSubscribedVessels] = useState(new Set());
  const [subscribedPorts, setSubscribedPorts] = useState(new Set());

  // Vessel type to icon mapping
  const getVesselIcon = (type) => {
    const icons = {
      'Container': '📦',
      'Cargo': '⚓',
      'Tanker': '🛢️',
      'Passenger': '🛳️',
      'Bulk Carrier': '🚛',
      'Research': '🔬',
      'Fishing': '🎣',
      'Tug': '⛴️',
      'Pilot': '🧭',
      'Yacht': '⛵',
      'Supply': '📦',
      'Military': '⚔️',
      'Ro-Ro': '🚗',
      'Unknown': '📍'
    };
    return icons[type] || icons['Unknown'];
  };

  const getVesselColor = (type) => {
    const colors = {
      'Container': '#3b82f6',
      'Cargo': '#10b981',
      'Tanker': '#f59e0b',
      'Passenger': '#ec4899',
      'Bulk Carrier': '#8b5cf6',
      'Research': '#06b6d4',
      'Fishing': '#14b8a6',
      'Tug': '#f97316',
      'Pilot': '#6366f1',
      'Yacht': '#a855f7',
      'Supply': '#84cc16',
      'Military': '#ef4444',
      'Ro-Ro': '#eab308',
      'Unknown': '#6b7280'
    };
    return colors[type] || colors['Unknown'];
  };

  // Generate mock vessels for demonstration
  const generateMockVessels = () => {
    const vesselTypes = ['Container', 'Cargo', 'Tanker', 'Passenger', 'Bulk Carrier', 'Research', 'Fishing', 'Tug', 'Pilot', 'Yacht', 'Supply'];
    const vesselNames = [
      'Ocean Pioneer', 'Sea Explorer', 'Pacific Star', 'Atlantic Voyager', 'Indian Queen',
      'Maritime Pride', 'Coastal Guardian', 'Bay Ranger', 'Harbor Master', 'Wave Rider',
      'Neptune Spirit', 'Poseidon Glory', 'Nautical Dream', 'Marine Legend', 'Aqua Phoenix',
      'Blue Horizon', 'Silver Dolphin', 'Golden Anchor'
    ];
    
    const centerLat = 17.385;
    const centerLng = 78.486;
    
    return vesselNames.map((name, index) => ({
      id: `vessel-${index + 1}`,
      name: name,
      mmsi: `${440000000 + index * 1000}`,
      type: vesselTypes[index % vesselTypes.length],
      speed: (Math.random() * 25).toFixed(1),
      lat: centerLat + (Math.random() - 0.5) * 4,
      lng: centerLng + (Math.random() - 0.5) * 4
    }));
  };

  // Generate mock ports for demonstration
  const generateMockPorts = () => {
    const portNames = [
      'Port of Singapore', 'Port of Shanghai', 'Port of Rotterdam', 'Port of Hamburg', 'Port of Los Angeles',
      'Port of Long Beach', 'Port of Dubai', 'Port of Hong Kong', 'Port of Antwerp', 'Port of Tianjin',
      'Port of Busan', 'Port of Qingdao', 'Port of Guangzhou', 'Port of Ningbo-Zhoushan', 'Port of Mumbai',
      'Port of Santos', 'Port of Valencia', 'Port of Kaohsiung'
    ];
    
    const weatherAlerts = ['Low', 'Medium', 'High'];
    const portStatuses = ['Open', 'Restricted', 'Closed'];
    
    const centerLat = 17.385;
    const centerLng = 78.486;
    
    return portNames.map((name, index) => ({
      id: `port-${index + 1}`,
      name: name,
      country: ['Singapore', 'China', 'Netherlands', 'Germany', 'USA', 'USA', 'UAE', 'Hong Kong', 'Belgium', 'China', 
               'South Korea', 'China', 'China', 'China', 'India', 'Brazil', 'Spain', 'Taiwan'][index],
      lat: centerLat + (Math.random() - 0.5) * 6,
      lng: centerLng + (Math.random() - 0.5) * 6,
      vesselCount: Math.floor(Math.random() * 50) + 10,
      capacity: Math.floor(Math.random() * 1000000) + 100000,
      weatherAlert: weatherAlerts[Math.floor(Math.random() * weatherAlerts.length)],
      windSpeed: Math.floor(Math.random() * 25) + 5, // 5-30 knots
      avgWaitTime: (Math.random() * 4 + 0.5).toFixed(1), // 0.5-4.5 hours
      congestionLevel: Math.floor(Math.random() * 100), // 0-100%
      status: portStatuses[Math.floor(Math.random() * portStatuses.length)]
    }));
  };

  // Load initial vessels and ports
  useEffect(() => {
    const initData = async () => {
      try {
        console.log('Starting data initialization...');
        setLoading(true);
        
        // Generate mock data
        const mockVessels = generateMockVessels();
        const mockPorts = generateMockPorts();
        
        console.log('Generated mock vessels:', mockVessels.length);
        console.log('Generated mock ports:', mockPorts.length);
        
        // Try to get real data from APIs, fall back to mock data
        let vesselsData = mockVessels;
        let portsData = mockPorts;
        
        try {
          console.log('Attempting to fetch real vessels...');
          const realVessels = await getVessels();
          if (realVessels && realVessels.length > 0) {
            vesselsData = realVessels;
            console.log('Using real vessels data:', realVessels.length);
          } else {
            console.log('Real vessels API returned empty, using mock data');
          }
        } catch (err) {
          console.log('Using mock vessels data:', err.message);
        }
        
        try {
          console.log('Attempting to fetch real ports...');
          const realPorts = await getPorts();
          if (realPorts && realPorts.length > 0) {
            portsData = realPorts;
            console.log('Using real ports data:', realPorts.length);
          } else {
            console.log('Real ports API returned empty, using mock data');
          }
        } catch (err) {
          console.log('Using mock ports data:', err.message);
        }
        
        console.log('Final vessels data:', vesselsData.length);
        console.log('Final ports data:', portsData.length);
        
        setVessels(vesselsData);
        setPorts(portsData);
      } catch (err) {
        console.error("Failed to initialize data", err);
        setVessels([]);
        setPorts([]);
      } finally {
        setLoading(false);
        console.log('Data initialization completed');
      }
    };
    initData();
  }, []);

  const filteredVessels = (vessels || []).filter(vessel => {
    const matchesType = filters.vesselType === 'all' || vessel.type === filters.vesselType;
    const matchesSearch = !filters.search || 
      vessel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vessel.mmsi.includes(filters.search);
    
    return matchesType && matchesSearch;
  });

  // Update map markers when filters change
  useEffect(() => {
    if (mapRef.current && window.L) {
      updateMapMarkers();
    }
  }, [filteredVessels, ports]);

  const updateMapMarkers = () => {
    const L = window.L;
    if (!L || !mapRef.current) {
      console.log('Map not ready for markers');
      return;
    }

    console.log('Updating map markers...');
    console.log('Filtered vessels:', filteredVessels.length);
    console.log('Ports:', ports.length);

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    portMarkersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    portMarkersRef.current = [];

    // Add vessel markers
    filteredVessels.forEach((vessel, index) => {
      const color = getVesselColor(vessel.type);
      const icon = L.divIcon({
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              transition: transform 0.2s;
            ">${getVesselIcon(vessel.type)}</div>
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: white;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              border: 2px solid ${color};
              animation: pulse 2s infinite;
            "></div>
          </div>
        `,
        className: 'vessel-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([vessel.lat, vessel.lng], { icon }).addTo(mapRef.current);
      
      marker.bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
            ${getVesselIcon(vessel.type)} ${vessel.name}
          </div>
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
            <strong>MMSI:</strong> ${vessel.mmsi}
          </div>
          <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
            <strong>Type:</strong> ${vessel.type}
          </div>
          <div style="font-size: 13px; color: #6b7280;">
            <strong>Speed:</strong> ${vessel.speed} knots
          </div>
        </div>
      `, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        console.log('Vessel clicked:', vessel.name);
        setSelectedVessel(vessel);
        mapRef.current.setView([vessel.lat, vessel.lng], 10, { animate: true });
      });

      markersRef.current.push(marker);
    });

    console.log('Added vessel markers:', markersRef.current.length);

    // Add port markers
    ports.forEach((port, index) => {
      const portIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              transition: transform 0.2s;
            ">🏢</div>
            <div style="
              position: absolute;
              top: -10px;
              right: -10px;
              background: white;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid #3b82f6;
              animation: pulse 2s infinite;
            "></div>
          </div>
        `,
        className: 'port-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      });

      const portMarker = L.marker([port.lat, port.lng], { icon: portIcon }).addTo(mapRef.current);
      
      portMarker.bindPopup(`
        <div style="padding: 12px; min-width: 250px;">
          <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #1f2937;">
            🏢 ${port.name}
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            <strong>Country:</strong> ${port.country}
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            <strong>Vessels:</strong> ${port.vesselCount || 'N/A'}
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            <strong>Capacity:</strong> ${port.capacity ? `${(port.capacity / 1000000).toFixed(1)}M TEU` : 'N/A'}
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
            <strong>Coordinates:</strong> ${port.lat.toFixed(4)}, ${port.lng.toFixed(4)}
          </div>
          <button 
            onclick="window.open('/ports', '_blank')"
            style="
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.3s ease;
              margin-top: 8px;
            "
            onmouseover="this.style.transform='translateY(-2px); this.style.boxShadow='0 8px 24px rgba(59, 130, 246, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(59, 130, 246, 0.3)';"
          >
            View Port Details
          </button>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      portMarker.on('click', () => {
        console.log('Port clicked:', port.name);
        setSelectedPort(port);
        mapRef.current.setView([port.lat, port.lng], 12, { animate: true });
      });

      portMarkersRef.current.push(portMarker);
    });

    console.log('Added port markers:', portMarkersRef.current.length);
    console.log('Total markers added:', markersRef.current.length + portMarkersRef.current.length);
  };

  useEffect(() => {
    const loadLeaflet = () => {
      console.log('Loading Leaflet map...');
      
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        console.log('Loading Leaflet script...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          console.log('Leaflet script loaded, initializing map...');
          setTimeout(initMap, 200);
        };
        document.body.appendChild(script);
      } else {
        console.log('Leaflet already loaded, initializing map...');
        initMap();
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || mapContainerRef.current.querySelector('.leaflet-container')) {
        console.log('Map container not ready or already initialized');
        return;
      }
      
      const L = window.L;
      if (!L) {
        console.error('Leaflet not available');
        return;
      }

      console.log('Initializing map...');
      
      const map = L.map(mapContainerRef.current).setView([17.385, 78.486], 6);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      setMapReady(true);
      console.log('Map initialized successfully');
    };

    loadLeaflet();
  }, []);

  // Update map markers when data changes
  useEffect(() => {
    if (mapReady && mapRef.current) {
      updateMapMarkers();
    }
  }, [vessels, ports, mapReady]);

  const handleVesselClick = (vessel) => {
    setSelectedVessel(vessel);
    setSelectedPort(null);
    if (mapRef.current) {
      mapRef.current.setView([vessel.lat, vessel.lng], 10, { animate: true });
    }
  };

  const handlePortClick = (port) => {
    setSelectedPort(port);
    setSelectedVessel(null);
    if (mapRef.current) {
      mapRef.current.setView([port.lat, port.lng], 12, { animate: true });
    }
  };

  const handleSubscribeVessel = (vesselId) => {
    const newSubscribedVessels = new Set(subscribedVessels);
    if (newSubscribedVessels.has(vesselId)) {
      newSubscribedVessels.delete(vesselId);
      console.log('Unsubscribed from vessel:', vesselId);
    } else {
      newSubscribedVessels.add(vesselId);
      console.log('Subscribed to vessel:', vesselId);
    }
    setSubscribedVessels(newSubscribedVessels);
  };

  const handleSubscribePort = (portId) => {
    const newSubscribedPorts = new Set(subscribedPorts);
    if (newSubscribedPorts.has(portId)) {
      newSubscribedPorts.delete(portId);
      console.log('Unsubscribed from port:', portId);
    } else {
      newSubscribedPorts.add(portId);
      console.log('Subscribed to port:', portId);
    }
    setSubscribedPorts(newSubscribedPorts);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .vessel-marker:hover div div:first-child {
          transform: scale(1.15);
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: '28px' }}>🚢</span>
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: 'white', margin: 0, letterSpacing: '0.5px' }}>Live Maritime Tracking</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
              Real-time monitoring • {vessels.length} vessels • {ports.length} ports
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '360px', 
          background: 'white', 
          borderRight: '1px solid #e2e8f0', 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)' 
        }}>
          {/* Filter Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                background: 'none', 
                border: 'none', 
                color: '#1e293b', 
                fontWeight: '600', 
                cursor: 'pointer', 
                width: '100%', 
                fontSize: '17px' 
              }}
            >
              <span style={{ fontSize: '20px' }}>🔍</span>
              <span>Filters & Search</span>
              <span style={{ marginLeft: 'auto', fontSize: '24px', color: '#64748b' }}>{showFilters ? '−' : '+'}</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderBottom: '1px solid #bae6fd' }}>
              <>
                {/* Show/Hide Options */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Display Options
                  </label>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filters.showVessels}
                        onChange={(e) => setFilters({...filters, showVessels: e.target.checked})}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#1e293b' }}>🚢 Vessels ({vessels.length})</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filters.showPorts}
                        onChange={(e) => setFilters({...filters, showPorts: e.target.checked})}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#1e293b' }}>🏢 Ports ({ports.length})</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="🔍 Enter name, MMSI, or port name..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #bae6fd', 
                      borderRadius: '10px', 
                      fontSize: '14px', 
                      outline: 'none', 
                      boxSizing: 'border-box',
                      background: 'white',
                      transition: 'all 0.3s'
                    }}
                  />
                </div>

                {filters.showVessels && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Vessel Type
                    </label>
                    <select
                      value={filters.vesselType}
                      onChange={(e) => setFilters({...filters, vesselType: e.target.value})}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '2px solid #bae6fd', 
                        borderRadius: '10px', 
                        fontSize: '14px', 
                        outline: 'none', 
                        background: 'white', 
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="Container">📦 Container Ships</option>
                      <option value="Cargo">⚓ Cargo Vessels</option>
                      <option value="Tanker">🛢️ Tankers</option>
                      <option value="Passenger">🛳️ Passenger Ships</option>
                      <option value="Bulk Carrier">🚛 Bulk Carriers</option>
                      <option value="Research">🔬 Research Vessels</option>
                      <option value="Fishing">🎣 Fishing Vessels</option>
                      <option value="Tug">⛴️ Tugs</option>
                      <option value="Pilot">🧭 Pilot Boats</option>
                      <option value="Yacht">⛵ Yachts</option>
                      <option value="Supply">📦 Supply Vessels</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setFilters({ vesselType: 'all', search: '', showVessels: true, showPorts: true })}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s'
                  }}
                >
                  ✕ Clear All Filters
                </button>
              </>
            </div>
          )}

          {/* Vessel and Port List */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
            <div style={{ padding: '24px' }}>
              {/* Vessels Section */}
              {filters.showVessels && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#1f2937', 
                    marginBottom: '16px', 
                    fontWeight: '600',
                    padding: '12px 16px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #bae6fd'
                  }}>
                    🚢 Vessels ({filteredVessels.length})
                  </div>
                  {filteredVessels.map(vessel => {
                    const color = getVesselColor(vessel.type);
                    return (
                      <div
                        key={vessel.id}
                        onClick={() => handleVesselClick(vessel)}
                        style={{
                          padding: '18px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          border: '2px solid ' + (selectedVessel?.id === vessel.id ? color : '#e2e8f0'),
                          background: selectedVessel?.id === vessel.id 
                            ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` 
                            : 'white',
                          marginBottom: '12px',
                          boxShadow: selectedVessel?.id === vessel.id 
                            ? `0 8px 24px ${color}40` 
                            : '0 2px 8px rgba(0,0,0,0.06)',
                          transition: 'all 0.3s',
                          transform: selectedVessel?.id === vessel.id ? 'translateY(-2px)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '700', 
                              marginBottom: '6px', 
                              color: selectedVessel?.id === vessel.id ? 'white' : '#0f172a',
                              fontSize: '16px'
                            }}>
                              {vessel.name}
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              marginBottom: '10px', 
                              color: selectedVessel?.id === vessel.id ? 'rgba(255,255,255,0.9)' : '#64748b',
                              fontWeight: '500'
                            }}>
                              MMSI: {vessel.mmsi}
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              display: 'flex', 
                              gap: '16px', 
                              color: selectedVessel?.id === vessel.id ? 'rgba(255,255,255,0.9)' : '#64748b',
                              fontWeight: '500'
                            }}>
                              <span>{getVesselIcon(vessel.type)} {vessel.type}</span>
                              <span>⚡ {vessel.speed} kn</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribeVessel(vessel.id);
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid ' + (subscribedVessels.has(vessel.id) ? color : '#e2e8f0'),
                                background: subscribedVessels.has(vessel.id) ? color : 'white',
                                color: subscribedVessels.has(vessel.id) ? 'white' : color,
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              {subscribedVessels.has(vessel.id) ? '🔔' : '🔕'}
                            </button>
                            <span style={{ fontSize: '24px' }}>
                              {selectedVessel?.id === vessel.id ? '✓' : '📍'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ports Section */}
              {filters.showPorts && (
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#1f2937', 
                    marginBottom: '16px', 
                    fontWeight: '600',
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #bbf7d0'
                  }}>
                    🏢 Ports ({ports.length})
                  </div>
                  {ports.map(port => (
                    <div
                      key={port.id}
                      onClick={() => handlePortClick(port)}
                      style={{
                        padding: '18px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid ' + (selectedPort?.id === port.id ? '#3b82f6' : '#e2e8f0'),
                        background: selectedPort?.id === port.id 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1dd 100%)' 
                          : 'white',
                        marginBottom: '12px',
                        boxShadow: selectedPort?.id === port.id 
                          ? '0 8px 24px rgba(59, 130, 246, 0.4)' 
                          : '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s',
                        transform: selectedPort?.id === port.id ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: '700', 
                            marginBottom: '6px', 
                            color: selectedPort?.id === port.id ? 'white' : '#0f172a',
                            fontSize: '16px'
                          }}>
                            {port.name}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            marginBottom: '10px', 
                            color: selectedPort?.id === port.id ? 'rgba(255,255,255,0.9)' : '#64748b',
                            fontWeight: '500'
                          }}>
                            {port.country}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            display: 'flex', 
                            gap: '16px', 
                            color: selectedPort?.id === port.id ? 'rgba(255,255,255,0.9)' : '#64748b',
                            fontWeight: '500'
                          }}>
                            <span>🏢 Port</span>
                            <span>• {port.vesselCount || '0'} vessels</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribePort(port.id);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid ' + (subscribedPorts.has(port.id) ? '#3b82f6' : '#e2e8f0'),
                              background: subscribedPorts.has(port.id) ? '#3b82f6' : 'white',
                              color: subscribedPorts.has(port.id) ? 'white' : '#3b82f6',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {subscribedPorts.has(port.id) ? '🔔' : '🔕'}
                          </button>
                          <span style={{ fontSize: '24px' }}>
                            {selectedPort?.id === port.id ? '✓' : '📍'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No items message */}
              {((filters.showVessels && filteredVessels.length === 0) && (!filters.showPorts || ports.length === 0)) && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px', 
                  color: '#64748b', 
                  fontSize: '14px'
                }}>
                  No vessels or ports found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, position: 'relative', background: '#f3f4f6' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          
          {!mapReady && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              zIndex: 50 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  border: '6px solid rgba(255,255,255,0.3)', 
                  borderTopColor: 'white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite', 
                  margin: '0 auto 24px' 
                }} />
                <p style={{ color: 'white', fontWeight: '600', fontSize: '20px', margin: '0' }}>Loading Maritime Map...</p>
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
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              padding: '24px',
              width: '340px',
              zIndex: 1000,
              border: `3px solid ${getVesselColor(selectedVessel.type)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{getVesselIcon(selectedVessel.type)}</div>
                  <h3 style={{ fontWeight: '700', fontSize: '22px', color: '#0f172a', margin: '0' }}>
                    {selectedVessel.name}
                  </h3>
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
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                >
                  ×
                </button>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>MMSI</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{selectedVessel.mmsi}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Type</span>
                  <span style={{ fontWeight: '700', color: getVesselColor(selectedVessel.type), fontSize: '14px' }}>
                    {selectedVessel.type}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Speed</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{selectedVessel.speed} knots</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Position</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                    {selectedVessel.lat.toFixed(3)}°, {selectedVessel.lng.toFixed(3)}°
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Selected Port Info Card */}
          {selectedPort && mapReady && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '340px',
              zIndex: 1000,
              border: '3px solid #3b82f6',
              boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                  <h3 style={{ fontWeight: '700', fontSize: '22px', color: '#0f172a', margin: '0' }}>
                    {selectedPort.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPort(null)}
                  style={{ 
                    background: '#f1f5f9', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '8px', 
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div>
                {/* Basic Port Information */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Country</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{selectedPort.country}</span>
                </div>
                
                {/* Weather Alerts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Weather Alert</span>
                  <span style={{ 
                    fontWeight: '700', 
                    fontSize: '14px',
                    color: selectedPort.weatherAlert === 'High' ? '#ef4444' : 
                           selectedPort.weatherAlert === 'Medium' ? '#f59e0b' : '#10b981'
                  }}>
                    {selectedPort.weatherAlert || 'Low'} ⚠️
                  </span>
                </div>
                
                {/* Wind Speed */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Wind Speed</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                    {selectedPort.windSpeed || '12'} knots 💨
                  </span>
                </div>
                
                {/* Average Wait Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Avg Wait Time</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                    {selectedPort.avgWaitTime || '2.5'} hours ⏱️
                  </span>
                </div>
                
                {/* Congestion Level */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Congestion</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '60px',
                      height: '8px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${selectedPort.congestionLevel || 65}%`,
                        height: '100%',
                        background: selectedPort.congestionLevel > 80 ? '#ef4444' : 
                                   selectedPort.congestionLevel > 50 ? '#f59e0b' : '#10b981',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '14px',
                      color: selectedPort.congestionLevel > 80 ? '#ef4444' : 
                             selectedPort.congestionLevel > 50 ? '#f59e0b' : '#10b981'
                    }}>
                      {selectedPort.congestionLevel || 65}%
                    </span>
                  </div>
                </div>
                
                {/* Port Capacity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Capacity</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                    {selectedPort.capacity ? `${(selectedPort.capacity / 1000000).toFixed(1)}M TEU` : 'N/A'}
                  </span>
                </div>
                
                {/* Current Vessels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Current Vessels</span>
                  <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '14px' }}>
                    {selectedPort.vesselCount || 'N/A'}
                  </span>
                </div>
                
                {/* Position */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Position</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                    {selectedPort.lat.toFixed(3)}°, {selectedPort.lng.toFixed(3)}°
                  </span>
                </div>
                
                {/* Port Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Port Status</span>
                  <span style={{ 
                    fontWeight: '700', 
                    fontSize: '14px',
                    color: selectedPort.status === 'Open' ? '#10b981' : 
                           selectedPort.status === 'Restricted' ? '#f59e0b' : '#ef4444'
                  }}>
                    {selectedPort.status || 'Open'} 🟢
                  </span>
                </div>
                
                {/* Nearby Vessels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Nearby Vessels</span>
                  <span style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>
                    {vessels.filter(vessel => {
                      const distance = Math.sqrt(
                        Math.pow(vessel.lat - selectedPort.lat, 2) + 
                        Math.pow(vessel.lng - selectedPort.lng, 2)
                      );
                      return distance < 0.5; // Within 0.5 degrees
                    }).length} vessels
                  </span>
                </div>
              </div>
              
              {/* Nearby Vessels List */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Nearby Vessels
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {vessels.filter(vessel => {
                    const distance = Math.sqrt(
                      Math.pow(vessel.lat - selectedPort.lat, 2) + 
                      Math.pow(vessel.lng - selectedPort.lng, 2)
                    );
                    return distance < 0.5;
                  }).length > 0 ? (
                    vessels.filter(vessel => {
                      const distance = Math.sqrt(
                        Math.pow(vessel.lat - selectedPort.lat, 2) + 
                        Math.pow(vessel.lng - selectedPort.lng, 2)
                      );
                      return distance < 0.5;
                    }).map(vessel => (
                      <div 
                        key={vessel.id}
                        onClick={() => {
                          setSelectedVessel(vessel);
                          setSelectedPort(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          border: '1px solid #e2e8f0',
                          marginBottom: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontSize: '16px' }}>{getVesselIcon(vessel.type)}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                            {vessel.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {vessel.type} • {vessel.speed} knots
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#64748b', 
                      fontSize: '13px',
                      padding: '20px 0'
                    }}>
                      No vessels nearby
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <NotificationManager />
    </div>
  );
};

export default LiveTracking;