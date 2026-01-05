// src/pages/LiveTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import separated components
import LoadingAnimation from '../components/LoadingAnimation';
import SubscriptionModal from '../components/SubscriptionModal';
import SidebarPanel from '../components/SidebarPanel';
import VesselDetailsPanel from '../components/VesselDetailsPanel';
import NOAASafetyOverlay from '../components/NOAASafetyOverlay';

// ===== UTILITY FUNCTIONS =====

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getPortCongestionColor = (congestionScore) => {
  if (congestionScore < 3) return '#10b981';
  if (congestionScore < 6) return '#f59e0b';
  if (congestionScore < 8) return '#f97316';
  return '#ef4444';
};

const PortMarkerIcon = (port) => {
  const color = getPortCongestionColor(port.congestion_score || 0);
  const size = 40; // Same size as vessel icons
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 22px;
      ">⚓</div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const VesselMarkerIcon = (vesselState, course = 0, isSelected = false) => {
  const size = isSelected ? 50 : 40; // 40px normal, 50px selected
  const courseAngle = course || 0;
  
  const stateColors = {
    ocean: '#3b82f6',
    in_transit: '#3b82f6',
    departure: '#f59e0b',
    arrival: '#10b981',
    at_port: '#8b5cf6'
  };
  
  const bgColor = isSelected ? '#dc2626' : (stateColors[vesselState] || stateColors.ocean);
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: ${size === 50 ? '26px' : '22px'};
        transform: rotate(${courseAngle}deg);
        transition: all 0.2s;
      ">⛴️</div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// ===== MAP ANIMATOR COMPONENT =====

const MapAnimator = ({ vessels, triggerAnimation }) => {
  const map = useMap();
  const lastTrigger = useRef(null);

  useEffect(() => {
    if (triggerAnimation === lastTrigger.current || !triggerAnimation || vessels.length === 0) {
      return;
    }

    lastTrigger.current = triggerAnimation;

    const randomIndex = Math.floor(Math.random() * vessels.length);
    const randomVessel = vessels[randomIndex];
    
    if (!randomVessel || !randomVessel.last_position_lat || !randomVessel.last_position_lon) {
      return;
    }

    const targetLat = randomVessel.last_position_lat;
    const targetLng = randomVessel.last_position_lon;

    map.setView([20, 0], 2, { animate: false });

    const timer = setTimeout(() => {
      map.flyTo([targetLat, targetLng], 6, {
        duration: 0.8,
        easeLinearity: 0.7
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [triggerAnimation, vessels, map]);

  return null;
};

// ===== MAIN LIVETRACKING COMPONENT =====

const LiveTracking = () => {
  // ===== STATE MANAGEMENT =====
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
  const [ports, setPorts] = useState([]);
  const [voyages, setVoyages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapAnimationTrigger, setMapAnimationTrigger] = useState(null);
  const [subscriptionUpdateKey, setSubscriptionUpdateKey] = useState(0);
  const [filters, setFilters] = useState({
    types: [],
    continents: [],
    speedRange: [0, 30]
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const location = useLocation();

  // ===== INITIAL LOAD =====
  useEffect(() => {
    loadVessels();
    loadPorts();
    loadVoyages();
    loadCountries();
  }, []);

  // ===== NOTIFICATION NAVIGATION =====
  useEffect(() => {
    if (location.state?.selectedVesselId && vessels.length > 0) {
      const vessel = vessels.find(v => v.id === location.state.selectedVesselId);
      if (vessel) {
        setSelectedVessel(vessel);
        toast.success(`Viewing ${location.state.vesselName || vessel.name}`, {
          position: 'top-center',
          duration: 3000,
        });
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, vessels]);

  // ===== LOAD VESSEL TRACK =====
  useEffect(() => {
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
    }
  }, [selectedVessel]);

  // ===== APPLY FILTERS =====
  useEffect(() => {
    let filtered = vessels;

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.imo_number && v.imo_number.includes(searchQuery))
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(v => {
        if (!v.type) return false;
        const vesselType = v.type.toLowerCase();
        return filters.types.some(filterType => 
          vesselType.includes(filterType.toLowerCase())
        );
      });
    }

    if (filters.continents && filters.continents.length > 0) {
      filtered = filtered.filter(v => {
        if (!v.flag) return false;
        // Find the country from the database by matching the flag/name
        const country = countries.find(c => c.name === v.flag);
        if (!country) return false;
        return filters.continents.includes(country.continent);
      });
    }

    filtered = filtered.filter(v => {
      if (!v.speed && v.speed !== 0) return true;
      return v.speed >= filters.speedRange[0] && v.speed <= filters.speedRange[1];
    });

    setFilteredVessels(filtered);
  }, [searchQuery, filters, vessels]);

  // ===== DETERMINE VESSEL STATE =====
  const determineVesselState = (vessel, allVoyages, allPorts) => {
    const PROXIMITY_THRESHOLD = 50;
    
    const activeVoyage = allVoyages.find(v => 
      v.vessel === vessel.id && v.status === 'in_progress'
    );

    if (activeVoyage) {
      const departurePort = allPorts.find(p => p.id === activeVoyage.port_from);
      if (departurePort && departurePort.latitude && departurePort.longitude) {
        const distanceToDeparture = calculateDistance(
          vessel.last_position_lat,
          vessel.last_position_lon,
          departurePort.latitude,
          departurePort.longitude
        );
        
        if (distanceToDeparture < PROXIMITY_THRESHOLD && vessel.speed < 5) {
          return { state: 'departure', port: departurePort, voyage: activeVoyage };
        }
      }

      const arrivalPort = allPorts.find(p => p.id === activeVoyage.port_to);
      if (arrivalPort && arrivalPort.latitude && arrivalPort.longitude) {
        const distanceToArrival = calculateDistance(
          vessel.last_position_lat,
          vessel.last_position_lon,
          arrivalPort.latitude,
          arrivalPort.longitude
        );
        
        if (distanceToArrival < PROXIMITY_THRESHOLD && vessel.speed < 10) {
          return { state: 'arrival', port: arrivalPort, voyage: activeVoyage };
        }
      }

      return { state: 'in_transit', voyage: activeVoyage };
    }

    for (const port of allPorts) {
      if (port.latitude && port.longitude) {
        const distanceToPort = calculateDistance(
          vessel.last_position_lat,
          vessel.last_position_lon,
          port.latitude,
          port.longitude
        );
        
        if (distanceToPort < PROXIMITY_THRESHOLD) {
          return { state: 'at_port', port };
        }
      }
    }

    return { state: 'ocean' };
  };

  // ===== API CALLS =====

  const loadVessels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in', {
          position: 'top-center',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/vessels/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load vessels');
      
      const data = await response.json();
      const vesselList = Array.isArray(data) ? data : (data.results || []);
      const vesselWithPositions = vesselList.filter(v => v.last_position_lat && v.last_position_lon);
      
      setVessels(vesselWithPositions);
      setLoading(false);
      
      setTimeout(() => {
        setMapAnimationTrigger(Date.now());
      }, 200);
    } catch (error) {
      console.error('Error loading vessels:', error);
      toast.error('Failed to load vessels', {
        position: 'top-center',
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const loadPorts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/ports/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load ports');
      
      const data = await response.json();
      const portsList = Array.isArray(data) ? data : (data.results || []);
      setPorts(portsList);
    } catch (error) {
      console.error('Error loading ports:', error);
    }
  };

  const loadVoyages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/voyages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load voyages');
      
      const data = await response.json();
      const voyagesList = Array.isArray(data) ? data : (data.results || []);
      setVoyages(voyagesList);
    } catch (error) {
      console.error('Error loading voyages:', error);
    }
  };

  const loadCountries = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/countries/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load countries');
      
      const data = await response.json();
      const countriesList = Array.isArray(data) ? data : (data.results || []);
      setCountries(countriesList);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadVesselTrack = async (vesselId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/vessels/${vesselId}/positions/?hours=24`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to load track');
      
      const data = await response.json();
      const positions = data.positions || data.results || data;
      const sortedPositions = Array.isArray(positions)
        ? positions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : [];
      
      setTrack(sortedPositions);
    } catch (error) {
      console.error('Error loading vessel track:', error);
      toast.error('Failed to load position history', {
        position: 'top-center',
        duration: 3000,
      });
    }
  };

  const handleUpdatePositions = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      
      for (const vessel of vessels) {
        const latitude = 20 + Math.random() * 40;
        const longitude = -180 + Math.random() * 360;
        const speed = Math.random() * 20;
        const course = Math.random() * 360;

        await fetch(`${API_URL}/vessels/${vessel.id}/update-position/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude,
            longitude,
            speed,
            course,
            source: 'api'
          })
        });
      }
      
      toast.success('Fleet data refreshed successfully', {
        position: 'top-center',
        duration: 3000,
      });
      
      await loadVessels();
      
    } catch (error) {
      console.error('Error updating positions:', error);
      toast.error('Failed to update positions', {
        position: 'top-center',
        duration: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSubscriptionChange = () => {
    setSubscriptionUpdateKey(prev => prev + 1);
    loadVessels();
    
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
    }
  };

  // ===== COMPUTED DATA =====

  const enhancedVessels = filteredVessels.map(vessel => ({
    ...vessel,
    ...determineVesselState(vessel, voyages, ports)
  }));

  const activeVoyageRoutes = voyages
    .filter(v => v.status === 'in_progress')
    .map(voyage => {
      const fromPort = ports.find(p => p.id === voyage.port_from);
      const toPort = ports.find(p => p.id === voyage.port_to);
      
      if (fromPort?.latitude && fromPort?.longitude && toPort?.latitude && toPort?.longitude) {
        return {
          id: voyage.id,
          positions: [
            [fromPort.latitude, fromPort.longitude],
            [toPort.latitude, toPort.longitude]
          ],
          vessel: vessels.find(v => v.id === voyage.vessel)
        };
      }
      return null;
    })
    .filter(Boolean);

  const mapCenter = enhancedVessels.length > 0
    ? {
        lat: enhancedVessels.reduce((sum, v) => sum + v.last_position_lat, 0) / enhancedVessels.length,
        lng: enhancedVessels.reduce((sum, v) => sum + v.last_position_lon, 0) / enhancedVessels.length
      }
    : { lat: 20, lng: 0 };

  const routeCoordinates = track.length > 0
    ? track.map(pos => [pos.latitude, pos.longitude])
    : [];

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="fixed inset-0 top-[73px] flex bg-slate-100">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      
      <style>{`
        .leaflet-container { z-index: 0 !important; }
        .leaflet-popup { z-index: 10 !important; }
        .leaflet-control { z-index: 5 !important; }
      `}</style>

      <SidebarPanel
        vessels={vessels}
        filteredVessels={filteredVessels}
        selectedVessel={selectedVessel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        onUpdatePositions={handleUpdatePositions}
        updating={updating}
        onSelectVessel={setSelectedVessel}
        message={message}
        onSubscriptionUpdate={subscriptionUpdateKey}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 relative bg-white">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={4}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="leaflet-container"
          >
            <MapAnimator 
              vessels={vessels}
              triggerAnimation={mapAnimationTrigger}
            />
            
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Port Markers */}
            {ports.map(port => {
              if (!port.latitude || !port.longitude) return null;
              
              return (
                <React.Fragment key={`port-${port.id}`}>
                  <Marker
                    position={[port.latitude, port.longitude]}
                    icon={PortMarkerIcon(port)}
                  >
                    <Popup>
                      <div className="w-64 text-sm">
                        <div className="font-bold text-lg mb-3 text-blue-600">{port.name}</div>
                        <div className="space-y-2 text-slate-700">
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold">Location:</span>
                            <span>{port.location}, {port.country}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold">Congestion:</span>
                            <span className="font-semibold" style={{ color: getPortCongestionColor(port.congestion_score || 0) }}>
                              {(port.congestion_score || 0).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold">Wait Time:</span>
                            <span>{(port.avg_wait_time || 0).toFixed(1)}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Arrivals/Departures:</span>
                            <span>{port.arrivals || 0} / {port.departures || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[port.latitude, port.longitude]}
                    radius={50000}
                    pathOptions={{ 
                      color: getPortCongestionColor(port.congestion_score || 0), 
                      fillColor: getPortCongestionColor(port.congestion_score || 0),
                      fillOpacity: 0.1,
                      weight: 1
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Voyage Route Lines */}
            {activeVoyageRoutes.map((route, index) => {
              const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
              const color = colors[index % colors.length];
              
              return (
                <Polyline
                  key={`voyage-${route.id}`}
                  positions={route.positions}
                  color={color}
                  weight={3}
                  opacity={0.6}
                  dashArray="10, 10"
                />
              );
            })}

            {/* Vessel Markers */}
            {enhancedVessels.map(vessel => (
              <React.Fragment key={vessel.id}>
                <Marker
                  position={[vessel.last_position_lat, vessel.last_position_lon]}
                  icon={VesselMarkerIcon(vessel.state, vessel.course, selectedVessel?.id === vessel.id)}
                  eventHandlers={{ click: () => setSelectedVessel(vessel) }}
                >
                  <Popup>
                    <div className="w-64 text-sm">
                      <div className="font-bold text-lg mb-3 text-blue-600">{vessel.name}</div>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">IMO:</span>
                          <span className="font-mono">{vessel.imo_number}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Type:</span>
                          <span>{vessel.type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Status:</span>
                          <span className="capitalize font-semibold">{vessel.state?.replace('_', ' ')}</span>
                        </div>
                        {vessel.port && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-semibold">Port:</span>
                            <span>{vessel.port.name}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Speed:</span>
                          <span className="font-semibold text-blue-600">{vessel.speed?.toFixed(1) || 'N/A'} kts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Destination:</span>
                          <span>{vessel.destination || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Selected vessel track */}
            {routeCoordinates.length > 1 && (
              <Polyline positions={routeCoordinates} color="#dc2626" weight={3} opacity={0.7} />
            )}

            {/* NOAA Safety Overlay - Always visible */}
            <NOAASafetyOverlay 
              selectedVessel={selectedVessel}
              ports={ports}
            />

          </MapContainer>
        </div>

        {selectedVessel ? (
          <VesselDetailsPanel
            vessel={selectedVessel}
            track={track}
            onEnableAlerts={() => setShowSubscriptionModal(true)}
            onClose={() => setSelectedVessel(null)}
          />
        ) : (
          <div className="bg-white border-t border-slate-200 p-8 text-center text-slate-600 flex items-center justify-center">
            Select a vessel from the fleet to view details and position history
          </div>
        )}
      </div>

      {showSubscriptionModal && selectedVessel && (
        <SubscriptionModal
          vessel={selectedVessel}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionChange={handleSubscriptionChange}
        />
      )}
    </div>
  );
};

export default LiveTracking;