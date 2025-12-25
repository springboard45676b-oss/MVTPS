// src/pages/LiveTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import separated components
import LoadingAnimation from '../components/LoadingAnimation';
import SubscriptionModal from '../components/SubscriptionModal';
import SidebarPanel from '../components/SidebarPanel';
import VesselDetailsPanel from '../components/VesselDetailsPanel';

// Geographic data - Country locations and major ports
const COUNTRY_LOCATIONS = {
  // Asia
  'China': { lat: 31.2304, lng: 121.4737, continent: 'Asia' },
  'Japan': { lat: 35.6762, lng: 139.6503, continent: 'Asia' },
  'Singapore': { lat: 1.3521, lng: 103.8198, continent: 'Asia' },
  'South Korea': { lat: 35.1796, lng: 129.0756, continent: 'Asia' },
  'India': { lat: 18.9400, lng: 72.8350, continent: 'Asia' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, continent: 'Asia' },
  
  // Europe
  'Germany': { lat: 53.5511, lng: 9.9937, continent: 'Europe' },
  'Greece': { lat: 37.9838, lng: 23.7275, continent: 'Europe' },
  'Netherlands': { lat: 51.9225, lng: 4.4792, continent: 'Europe' },
  'UK': { lat: 51.5074, lng: -0.1278, continent: 'Europe' },
  'Norway': { lat: 59.9139, lng: 10.7522, continent: 'Europe' },
  'Italy': { lat: 40.8518, lng: 14.2681, continent: 'Europe' },
  'France': { lat: 43.2965, lng: 5.3698, continent: 'Europe' },
  'Malta': { lat: 35.8989, lng: 14.5146, continent: 'Europe' },
  'Cyprus': { lat: 34.9171, lng: 33.6240, continent: 'Europe' },
  
  // Americas
  'USA': { lat: 40.7128, lng: -74.0060, continent: 'Americas' },
  'Canada': { lat: 49.2827, lng: -123.1207, continent: 'Americas' },
  'Panama': { lat: 8.9824, lng: -79.5199, continent: 'Americas' },
  'Liberia': { lat: 6.3156, lng: -10.8074, continent: 'Africa' },
  'Marshall Islands': { lat: 7.1315, lng: 171.1845, continent: 'Oceania' },
  'Bahamas': { lat: 25.0343, lng: -77.3963, continent: 'Americas' },
  'Mexico': { lat: 19.4326, lng: -99.1332, continent: 'Americas' },
  'Brazil': { lat: -22.9068, lng: -43.1729, continent: 'Americas' },
  
  // Africa
  'South Africa': { lat: -33.9249, lng: 18.4241, continent: 'Africa' },
  'Egypt': { lat: 30.0444, lng: 31.2357, continent: 'Africa' },
  
  // Oceania
  'Australia': { lat: -33.8688, lng: 151.2093, continent: 'Oceania' },
  'New Zealand': { lat: -36.8485, lng: 174.7633, continent: 'Oceania' },
};

// Major ports by city name
const PORT_LOCATIONS = {
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Shanghai': { lat: 31.2304, lng: 121.4737 },
  'Rotterdam': { lat: 51.9225, lng: 4.4792 },
  'Hamburg': { lat: 53.5511, lng: 9.9937 },
  'Los Angeles': { lat: 33.7373, lng: -118.2700 },
  'New York': { lat: 40.6895, lng: -74.0447 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Busan': { lat: 35.1796, lng: 129.0756 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
};

// Calculate distance between two coordinates (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Map Animation Component - Fully Reliable
const MapAnimator = ({ vessels, triggerAnimation }) => {
  const map = useMap();
  const lastTrigger = useRef(null);

  useEffect(() => {
    // Don't animate if no trigger change or no vessels
    if (triggerAnimation === lastTrigger.current || !triggerAnimation || vessels.length === 0) {
      return;
    }

    lastTrigger.current = triggerAnimation;

    // Pick random vessel
    const randomIndex = Math.floor(Math.random() * vessels.length);
    const randomVessel = vessels[randomIndex];
    
    if (!randomVessel || !randomVessel.last_position_lat || !randomVessel.last_position_lon) {
      return;
    }

    const targetLat = randomVessel.last_position_lat;
    const targetLng = randomVessel.last_position_lon;

    // Immediate reset to world view
    map.setView([20, 0], 2, { animate: false });

    // Small delay then animate to vessel
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

const LiveTracking = () => {
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
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

  useEffect(() => {
    loadVessels();
  }, []);

  // Handle navigation from notifications
  useEffect(() => {
    if (location.state?.selectedVesselId && vessels.length > 0) {
      const vessel = vessels.find(v => v.id === location.state.selectedVesselId);
      if (vessel) {
        setSelectedVessel(vessel);
        
        // Show toast
        toast.success(`Viewing ${location.state.vesselName || vessel.name}`, {
          position: 'top-center',
          duration: 3000,
        });

        // Clear navigation state
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, vessels]);

  useEffect(() => {
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
    }
  }, [selectedVessel]);

  // Apply filters
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
        const countryData = COUNTRY_LOCATIONS[v.flag];
        if (!countryData) return false;
        return filters.continents.includes(countryData.continent);
      });
    }

    filtered = filtered.filter(v => {
      if (!v.speed && v.speed !== 0) return true;
      return v.speed >= filters.speedRange[0] && v.speed <= filters.speedRange[1];
    });

    setFilteredVessels(filtered);
  }, [searchQuery, filters, vessels]);

  // Determine vessel state based on location and speed
  const determineVesselState = (vessel) => {
    const PROXIMITY_THRESHOLD = 200; // km - within 200km considered "near"
    
    // Check if near flag country (departure)
    if (vessel.flag && COUNTRY_LOCATIONS[vessel.flag]) {
      const flagLocation = COUNTRY_LOCATIONS[vessel.flag];
      const distanceToFlag = calculateDistance(
        vessel.last_position_lat,
        vessel.last_position_lon,
        flagLocation.lat,
        flagLocation.lng
      );
      
      if (distanceToFlag < PROXIMITY_THRESHOLD && vessel.speed < 5) {
        return 'departure';
      }
    }

    // Check if near destination (arrival)
    if (vessel.destination) {
      // Try to match destination with known ports
      const destLower = vessel.destination.toLowerCase();
      let destinationLocation = null;
      
      for (const [portName, location] of Object.entries(PORT_LOCATIONS)) {
        if (destLower.includes(portName.toLowerCase())) {
          destinationLocation = location;
          break;
        }
      }

      if (destinationLocation) {
        const distanceToDest = calculateDistance(
          vessel.last_position_lat,
          vessel.last_position_lon,
          destinationLocation.lat,
          destinationLocation.lng
        );
        
        if (distanceToDest < PROXIMITY_THRESHOLD && vessel.speed < 10) {
          return 'arrival';
        }
      }
    }

    // Default to ocean if not near any port
    return 'ocean';
  };

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
      
      const vesselWithPositions = vesselList
        .filter(v => v.last_position_lat && v.last_position_lon)
        .map(v => ({
          ...v,
          state: determineVesselState(v),
          continent: v.flag && COUNTRY_LOCATIONS[v.flag] 
            ? COUNTRY_LOCATIONS[v.flag].continent 
            : null
        }));
      
      setVessels(vesselWithPositions);
      setLoading(false);
      
      // Trigger animation with timestamp
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

  const triggerStateBasedAlerts = async (updatedVessels) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const subResponse = await fetch(`${API_URL}/users/subscriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!subResponse.ok) return;

      const subData = await subResponse.json();
      const subscriptions = Array.isArray(subData) ? subData : (subData.results || []);
      
      updatedVessels.forEach(vessel => {
        const subscription = subscriptions.find(sub => 
          sub.vessel === vessel.id && sub.is_active
        );

        if (!subscription) return;

        const { alert_type } = subscription;

        const shouldAlert = 
          alert_type === 'all' ||
          (alert_type === 'position_update' && vessel.state === 'ocean') ||
          (alert_type === 'departure' && vessel.state === 'departure') ||
          (alert_type === 'arrival' && vessel.state === 'arrival');

        if (shouldAlert) {
          console.log(`Alert triggered for ${vessel.name} - State: ${vessel.state}`);
        }
      });
    } catch (error) {
      console.error('Error triggering alerts:', error);
    }
  };

  const handleUpdatePositions = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const updatedVessels = [];
      
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

        const updatedVessel = {
          ...vessel,
          last_position_lat: latitude,
          last_position_lon: longitude,
          speed,
          course
        };
        
        updatedVessel.state = determineVesselState(updatedVessel);
        updatedVessels.push(updatedVessel);
      }
      
      await triggerStateBasedAlerts(updatedVessels);
      
      toast.success('Fleet data refreshed successfully', {
        position: 'top-center',
        duration: 3000,
      });
      
      // Reload vessels and trigger animation to random vessel
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
    // Trigger sidebar to refresh subscriptions
    setSubscriptionUpdateKey(prev => prev + 1);
    
    // Reload vessels data
    loadVessels();
    
    // Reload track if vessel selected
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
    }
  };

  const VesselMarkerIcon = (state, course = 0, isSelected = false) => {
    const size = isSelected ? 50 : 40;
    const courseAngle = course || 0;
    
    const stateColors = {
      ocean: '#3b82f6',
      departure: '#f59e0b',
      arrival: '#10b981'
    };
    
    const bgColor = isSelected ? '#dc2626' : (stateColors[state] || stateColors.ocean);
    
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
          font-size: 24px;
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

  const mapCenter = filteredVessels.length > 0
    ? {
        lat: filteredVessels.reduce((sum, v) => sum + v.last_position_lat, 0) / filteredVessels.length,
        lng: filteredVessels.reduce((sum, v) => sum + v.last_position_lon, 0) / filteredVessels.length
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

            {filteredVessels.map(vessel => (
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
                          <span className="font-semibold">Flag:</span>
                          <span>{vessel.flag || 'N/A'}</span>
                        </div>
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

            {routeCoordinates.length > 1 && (
              <Polyline positions={routeCoordinates} color="#3b82f6" weight={2} opacity={0.6} />
            )}
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