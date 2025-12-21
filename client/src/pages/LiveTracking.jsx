// src/pages/LiveTracking.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import toast, { Toaster } from 'react-hot-toast';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import separated components
import LoadingAnimation from '../components/LoadingAnimation';
import SubscriptionModal from '../components/SubscriptionModal';
import SidebarPanel from '../components/SidebarPanel';
import VesselDetailsPanel from '../components/VesselDetailsPanel';

const LiveTracking = () => {
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    types: [],
    flags: [],
    speedRange: [0, 30]
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Fetch all vessels on mount and setup auto-refresh
  useEffect(() => {
    loadVessels();
    const interval = setInterval(loadVessels, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Fetch vessel track when selected
  useEffect(() => {
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
    }
  }, [selectedVessel]);

  // Apply filters and search
  useEffect(() => {
    let filtered = vessels;

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.imo_number && v.imo_number.includes(searchQuery))
      );
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(v => filters.types.includes(v.type));
    }

    if (filters.flags.length > 0) {
      filtered = filtered.filter(v => filters.flags.includes(v.flag));
    }

    filtered = filtered.filter(v =>
      (!v.speed || (v.speed >= filters.speedRange[0] && v.speed <= filters.speedRange[1]))
    );

    setFilteredVessels(filtered);
  }, [searchQuery, filters, vessels]);

  const loadVessels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in');
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
      
      const vesselWithPositions = vesselList.filter(
        v => v.last_position_lat && v.last_position_lon
      );
      
      setVessels(vesselWithPositions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vessels:', error);
      toast.error('Failed to load vessels from database', {
        duration: 4000,
        position: 'bottom-right',
        icon: '❌',
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
        duration: 4000,
        position: 'bottom-right',
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
      
      toast.success('Positions updated! Alerts sent to subscribed users 🚢', {
        duration: 4000,
        position: 'bottom-right',
        icon: '✅',
        style: {
          borderRadius: '8px',
          background: '#10b981',
          color: '#fff',
        },
      });
      
      loadVessels();
    } catch (error) {
      console.error('Error updating positions:', error);
      toast.error('Failed to update positions', {
        duration: 4000,
        position: 'bottom-right',
        icon: '❌',
      });
    } finally {
      setUpdating(false);
    }
  };

  const VesselMarkerIcon = (course = 0, isSelected = false) => {
    const size = isSelected ? 50 : 40;
    const courseAngle = course || 0;
    return divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${isSelected ? '#dc2626' : '#3b82f6'};
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
    <div className="flex h-screen bg-slate-100">
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            duration: 4000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      
      <style>{`
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-popup {
          z-index: 10 !important;
        }
        .leaflet-control {
          z-index: 5 !important;
        }
      `}</style>

      {/* Left Sidebar */}
      <SidebarPanel
        vessels={vessels}
        filteredVessels={filteredVessels}
        selectedVessel={selectedVessel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onUpdatePositions={handleUpdatePositions}
        updating={updating}
        onSelectVessel={setSelectedVessel}
        message={message}
      />

      {/* Right Side - Map and Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative bg-white">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={4}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="leaflet-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {filteredVessels.map(vessel => (
              <React.Fragment key={vessel.id}>
                <Marker
                  position={[vessel.last_position_lat, vessel.last_position_lon]}
                  icon={VesselMarkerIcon(vessel.course, selectedVessel?.id === vessel.id)}
                  eventHandlers={{
                    click: () => setSelectedVessel(vessel)
                  }}
                >
                  <Popup>
                    <div className="w-64 text-sm">
                      <div className="font-bold text-lg mb-3 text-blue-600">{vessel.name}</div>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">MMSI:</span>
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
                          <span className="font-semibold text-blue-600">{vessel.speed?.toFixed(1) || 'N/A'} km</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Course:</span>
                          <span>{vessel.course?.toFixed(0) || 'N/A'}°</span>
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
              <Polyline
                positions={routeCoordinates}
                color="#3b82f6"
                weight={2}
                opacity={0.6}
              />
            )}
          </MapContainer>
        </div>

        {/* Details Panel */}
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

      {/* Modal */}
      {showSubscriptionModal && selectedVessel && (
        <SubscriptionModal
          vessel={selectedVessel}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionChange={loadVessels}
        />
      )}
    </div>
  );
};

export default LiveTracking;