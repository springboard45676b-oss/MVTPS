// src/pages/liveTracking/LiveTracking.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Local hooks
import { useVesselData } from './hooks/useVesselData';
import { useVesselAlerts } from './hooks/useVesselAlerts';
import { useVesselFiltering } from './hooks/useVesselFiltering';

// Local components
import MapAnimator from './components/MapAnimator';
import { MapLayers } from './components/MapLayers';
import LoadingAnimation from '../../components/LoadingAnimation';
import SubscriptionModal from './components/SubscriptionModal';
import SidebarPanel from './components/SidebarPanel';
import VesselDetailsPanel from './components/VesselDetailsPanel';
import SafetyOverlay from './components/SafetyOverlay';
import RouteOptimizationPanel from './components/RouteOptimizationPanel';

// Services
import notificationService from './services/notificationService';
import routeOptimizationService from './services/routeOptimizationService';

// Utils
import {
  determineVesselState,
  computeMapCenter,
  computeActiveRoutes,
  generateIntelligentPosition
} from './utils/vesselUtils';

const LiveTracking = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const location = useLocation();

  const [subscriptionRefreshTrigger, setSubscriptionRefreshTrigger] = useState(0);

  // ===== HOOKS =====
  const data = useVesselData(API_URL);
  const alerts = useVesselAlerts(API_URL, data.weatherAlerts, data.piracyZones);

  // ===== STATE =====
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapAnimationTrigger, setMapAnimationTrigger] = useState(null);
  const [subscriptionUpdateKey, setSubscriptionUpdateKey] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    continents: [],
    speedRange: [0, 30]
  });

  // ===== FILTERING =====
  const filteredVessels = useVesselFiltering(
    data.vessels,
    searchQuery,
    filters,
    data.countries
  );

  // ===== EFFECTS =====

  // Handle notification navigation
  useEffect(() => {
    if (location.state?.selectedVesselId && data.vessels.length > 0) {
      const vessel = data.vessels.find(v => v.id === location.state.selectedVesselId);
      if (vessel) {
        setSelectedVessel(vessel);
        toast.success(`Viewing ${location.state.vesselName || vessel.name}`, {
          position: 'top-center',
          duration: 3000,
          icon: '✓',
          style: {
            background: '#ffffff',
            color: '#059669',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
            border: '1px solid #d1fae5',
            fontSize: '13px',
            fontWeight: '500',
          }
        });
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, data.vessels]);

  // Load vessel track when vessel is selected
  useEffect(() => {
    if (selectedVessel) {
      data.loadVesselTrack(selectedVessel.id).then(positions => {
        setTrack(positions || []);
      });
    }
  }, [selectedVessel]);

  // Trigger map animation on initial load
  useEffect(() => {
    if (!data.loading && data.vessels.length > 0) {
      setTimeout(() => {
        setMapAnimationTrigger(Date.now());
      }, 200);
    }
  }, [data.loading, data.vessels]);

  // ===== HANDLERS =====

  const handleUpdatePositions = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('access_token');

      const updatePromises = data.vessels.map(async (vessel, i) => {
        const oldPosition = {
          latitude: vessel.last_position_lat,
          longitude: vessel.last_position_lon
        };

        const position = generateIntelligentPosition(
          vessel,
          i,
          data.vessels.length,
          data.weatherAlerts,
          data.piracyZones
        );

        // Update position in backend
        const updateResponse = fetch(`${API_URL}/vessels/${vessel.id}/update-position/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: position.latitude,
            longitude: position.longitude,
            speed: position.speed,
            course: position.course,
            source: 'api'
          })
        });

        // Run notifications in parallel (don't wait)
        Promise.all([
          notificationService.sendPositionUpdateNotification(vessel, position),
          checkPortProximity(vessel, position, oldPosition),
          position.nearDanger ? checkDangerZones(vessel, position) : Promise.resolve(),
          checkRouteWeather(vessel, position)
        ]);

        return updateResponse;
      });

      await Promise.all(updatePromises);

      toast.success('Fleet data refreshed successfully', {
        position: 'top-center',
        duration: 3000,
      });

      await data.loadVessels();
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

  const checkPortProximity = async (vessel, newPosition, oldPosition) => {
    const PROXIMITY_THRESHOLD = 20; // km

    for (const port of data.ports) {
      const newDistance = routeOptimizationService.calculateDistance(
        newPosition.latitude,
        newPosition.longitude,
        port.latitude,
        port.longitude
      );

      const oldDistance = routeOptimizationService.calculateDistance(
        oldPosition.latitude,
        oldPosition.longitude,
        port.latitude,
        port.longitude
      );

      // Arrival detection
      if (oldDistance > PROXIMITY_THRESHOLD && newDistance <= PROXIMITY_THRESHOLD) {
        await notificationService.sendArrivalNotification(vessel, port);
      }

      // Departure detection
      if (oldDistance <= PROXIMITY_THRESHOLD && newDistance > PROXIMITY_THRESHOLD) {
        await notificationService.sendDepartureNotification(vessel, port);
      }
    }
  };

  const checkDangerZones = async (vessel, position) => {
    // Check piracy zones
    for (const zone of data.piracyZones) {
      const distance = routeOptimizationService.calculateDistance(
        position.latitude,
        position.longitude,
        zone.latitude,
        zone.longitude
      );

      if (distance < (zone.radius || 100)) {
        await notificationService.sendPiracyAlert(vessel, zone);
        break;
      }
    }

    // Check weather zones
    for (const zone of data.weatherAlerts) {
      const distance = routeOptimizationService.calculateDistance(
        position.latitude,
        position.longitude,
        zone.latitude,
        zone.longitude
      );

      if (distance < (zone.radius || 100)) {
        const weatherData = {
          condition: zone.type || 'Severe Weather',
          severity: zone.severity || 'moderate',
          wind_speed: zone.wind_speed,
          wave_height: zone.wave_height
        };
        await notificationService.sendWeatherAlert(vessel, weatherData);
        break;
      }
    }
  };

  const checkRouteWeather = async (vessel, position) => {
    if (!vessel.destination) return;

    const destPort = data.ports.find(p =>
      p.name.toLowerCase().includes(vessel.destination.toLowerCase()) ||
      vessel.destination.toLowerCase().includes(p.name.toLowerCase())
    );

    if (!destPort) return;

    for (const weatherZone of data.weatherAlerts) {
      const distanceToRoute = calculateDistanceToRoute(
        position.latitude,
        position.longitude,
        destPort.latitude,
        destPort.longitude,
        weatherZone.latitude,
        weatherZone.longitude
      );

      if (distanceToRoute < 200) {
        const weatherInfo = {
          condition: weatherZone.type || 'Bad Weather',
          severity: weatherZone.severity || 'moderate',
          location: weatherZone.name || `${weatherZone.latitude.toFixed(2)}°, ${weatherZone.longitude.toFixed(2)}°`,
          distance: distanceToRoute.toFixed(0),
          estimated_encounter: estimateEncounterTime(
            position,
            weatherZone,
            vessel.speed || 12
          )
        };

        await notificationService.sendRouteWeatherWarning(vessel, weatherInfo);
        break;
      }
    }
  };

  const calculateDistanceToRoute = (startLat, startLon, endLat, endLon, pointLat, pointLon) => {
    const A = pointLat - startLat;
    const B = pointLon - startLon;
    const C = endLat - startLat;
    const D = endLon - startLon;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = startLat;
      yy = startLon;
    } else if (param > 1) {
      xx = endLat;
      yy = endLon;
    } else {
      xx = startLat + param * C;
      yy = startLon + param * D;
    }

    return routeOptimizationService.calculateDistance(pointLat, pointLon, xx, yy);
  };

  const estimateEncounterTime = (position, weatherZone, speedKnots) => {
    const distance = routeOptimizationService.calculateDistance(
      position.latitude,
      position.longitude,
      weatherZone.latitude,
      weatherZone.longitude
    );

    const distanceNM = distance * 0.539957;
    const hours = distanceNM / speedKnots;

    if (hours < 1) return 'within 1 hour';
    if (hours < 24) return `in ${Math.round(hours)} hours`;
    return `in ${Math.round(hours / 24)} days`;
  };

  const handleOptimizeRoute = () => {
    if (!selectedVessel || !selectedVessel.destination) {
      toast.error('No destination set for this vessel', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    const destPort = data.ports.find(p =>
      p.name.toLowerCase().includes(selectedVessel.destination.toLowerCase()) ||
      selectedVessel.destination.toLowerCase().includes(p.name.toLowerCase())
    );

    if (!destPort) {
      toast.error('Destination port not found', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    const route = routeOptimizationService.generateOptimalRoute(
      selectedVessel,
      destPort,
      data.piracyZones,
      data.weatherAlerts
    );

    setOptimizedRoute(route);
    setShowRouteOptimization(true);
  };

  const handleSubscriptionChange = () => {
    setShowSubscriptionModal(false);
    setSubscriptionUpdateKey(prev => prev + 1);

    setTimeout(() => {
      if (selectedVessel) {
        setSelectedVessel(prev => ({ ...prev }));
      }
    }, 100);
  };

  // ===== COMPUTED DATA =====

  const enhancedVessels = filteredVessels.map(vessel => ({
    ...vessel,
    ...determineVesselState(vessel, data.voyages, data.ports)
  }));

  const activeVoyageRoutes = computeActiveRoutes(data.voyages, data.ports);
  const mapCenter = computeMapCenter(enhancedVessels);
  const routeCoordinates = track.map(pos => [pos.latitude, pos.longitude]);

  // ===== RENDER =====

  if (data.loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="fixed inset-0 top-[73px] flex bg-slate-100">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        containerStyle={{
          top: '80px',
          zIndex: 999999,
        }}
      />

      <style>{`
        .leaflet-container { z-index: 0 !important; }
        .leaflet-popup { z-index: 10 !important; }
        .leaflet-control { z-index: 5 !important; }

        /* Toaster positioning */
        [data-hot-toaster] {
          z-index: 999999 !important;
        }

        /* Top-center positioning */
        [data-hot-toaster][data-position="top-center"] {
          top: 80px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          width: auto !important;
        }

        /* Top-right positioning for progress bar toasts */
        [data-hot-toaster][data-position="top-right"] {
          top: 80px !important;
          right: 20px !important;
          left: auto !important;
        }

        [data-hot-toast] {
          z-index: 999999 !important;
          background: white !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12) !important;
          padding: 8px 14px !important;
          border-radius: 8px !important;
          font-size: 13px !important;
          max-width: 320px !important;
          min-height: auto !important;
        }

        [data-hot-toast] > div {
          gap: 8px !important;
        }
      `}</style>

      {/* Sidebar */}
      <SidebarPanel
        vessels={data.vessels}
        filteredVessels={filteredVessels}
        selectedVessel={selectedVessel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        onUpdatePositions={handleUpdatePositions}
        updating={updating}
        onSelectVessel={setSelectedVessel}
        onSubscriptionUpdate={subscriptionUpdateKey}
        onAlertsRemoved={() => setSubscriptionRefreshTrigger(prev => prev + 1)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative bg-white">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={4}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="leaflet-container"
          >
            <MapAnimator
              vessels={data.vessels}
              triggerAnimation={mapAnimationTrigger}
            />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            <MapLayers
              ports={data.ports}
              vessels={enhancedVessels}
              activeVoyageRoutes={activeVoyageRoutes}
              selectedVessel={selectedVessel}
              routeCoordinates={routeCoordinates}
              optimizedRoute={optimizedRoute}
              onSelectVessel={setSelectedVessel}
            />

            <SafetyOverlay
              selectedVessel={selectedVessel}
              ports={data.ports}
            />
          </MapContainer>
        </div>

        {/* Details Panel or Empty State */}
        {selectedVessel ? (
          <VesselDetailsPanel
            key={`vessel-${selectedVessel.id}-${subscriptionUpdateKey}-${subscriptionRefreshTrigger}`}
            vessel={selectedVessel}
            track={track}
            onEnableAlerts={() => setShowSubscriptionModal(true)}
            onOptimizeRoute={handleOptimizeRoute}
            onClose={() => setSelectedVessel(null)}
            onSubscriptionUpdate={() => setSubscriptionUpdateKey(prev => prev + 1)}
            refreshTrigger={subscriptionRefreshTrigger}
          />
        ) : (
          <div className="bg-white border-t border-slate-200 p-8 text-center text-slate-600 flex items-center justify-center">
            Select a vessel from the fleet to view details and position history
          </div>
        )}
      </div>

      {/* Modals */}
      {showSubscriptionModal && selectedVessel && (
        <SubscriptionModal
          key={`subscription-${selectedVessel.id}`}
          vessel={selectedVessel}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionChange={handleSubscriptionChange}
        />
      )}

      {showRouteOptimization && optimizedRoute && (
        <RouteOptimizationPanel
          vessel={selectedVessel}
          route={optimizedRoute}
          onClose={() => {
            setShowRouteOptimization(false);
            setOptimizedRoute(null);
          }}
        />
      )}
    </div>
  );
};

export default LiveTracking;