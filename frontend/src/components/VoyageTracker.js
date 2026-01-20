import React, { useState, useEffect, useRef } from 'react';
import { Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';

// Custom vessel icon for tracking
const createVesselIcon = (course = 0, isSubscribed = false) => {
  const color = isSubscribed ? '#ff4444' : '#0066cc';
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${course} 12 12)">
        <path d="M12 2 L16 20 L12 16 L8 20 Z" fill="${color}" stroke="white" stroke-width="1"/>
      </g>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'vessel-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom destination icon
const destinationIcon = L.divIcon({
  html: `
    <div style="
      width: 20px; 
      height: 20px; 
      background: #28a745; 
      border: 2px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  className: 'destination-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const VoyageTracker = ({ vessel, isSubscribed, onSubscribe, onUnsubscribe }) => {
  const [voyageTrack, setVoyageTrack] = useState([]);
  const [destination, setDestination] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const map = useMap();
  const trackRef = useRef([]);

  useEffect(() => {
    if (vessel && isSubscribed) {
      // Initialize tracking with current position
      const currentPosition = [vessel.latitude, vessel.longitude];
      setVoyageTrack([currentPosition]);
      trackRef.current = [currentPosition];
      setIsTracking(true);

      // Estimate destination based on course and speed
      if (vessel.course && vessel.speed > 1) {
        const estimatedDestination = calculateDestination(
          vessel.latitude, 
          vessel.longitude, 
          vessel.course, 
          vessel.speed
        );
        setDestination(estimatedDestination);
      }
    } else {
      setVoyageTrack([]);
      setDestination(null);
      setIsTracking(false);
      trackRef.current = [];
    }
  }, [vessel, isSubscribed]);

  // Calculate estimated destination based on current course and speed
  const calculateDestination = (lat, lng, course, speed) => {
    // Estimate destination 24 hours ahead based on current course and speed
    const distanceKm = (speed * 1.852) * 24; // Convert knots to km for 24 hours
    const bearing = course * (Math.PI / 180); // Convert to radians
    
    const R = 6371; // Earth's radius in km
    const lat1 = lat * (Math.PI / 180);
    const lng1 = lng * (Math.PI / 180);
    
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearing)
    );
    
    const lng2 = lng1 + Math.atan2(
      Math.sin(bearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );
    
    return [lat2 * (180 / Math.PI), lng2 * (180 / Math.PI)];
  };

  // Update vessel position and track
  const updateVesselPosition = (newPosition) => {
    const [lat, lng] = newPosition;
    
    // Add to track if position has changed significantly (> 100m)
    const lastPosition = trackRef.current[trackRef.current.length - 1];
    if (lastPosition) {
      const distance = calculateDistance(lastPosition[0], lastPosition[1], lat, lng);
      if (distance > 0.1) { // 100 meters
        const newTrack = [...trackRef.current, [lat, lng]];
        trackRef.current = newTrack;
        setVoyageTrack(newTrack);
        
        // Keep only last 100 positions to prevent memory issues
        if (newTrack.length > 100) {
          const trimmedTrack = newTrack.slice(-100);
          trackRef.current = trimmedTrack;
          setVoyageTrack(trimmedTrack);
        }
      }
    }
  };

  // Calculate distance between two points in km
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if vessel has reached destination
  const checkDestinationReached = (currentPos) => {
    if (!destination) return false;
    
    const distance = calculateDistance(
      currentPos[0], currentPos[1],
      destination[0], destination[1]
    );
    
    // Consider destination reached if within 5km
    return distance < 5;
  };

  // Expose update function for parent component
  React.useImperativeHandle(vessel.ref, () => ({
    updatePosition: (lat, lng) => {
      const newPosition = [lat, lng];
      updateVesselPosition(newPosition);
      
      // Check if destination reached
      if (checkDestinationReached(newPosition)) {
        toast.success(`🎯 ${vessel.name} has reached its destination!`, {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Trigger notification callback if provided
        if (vessel.onDestinationReached) {
          vessel.onDestinationReached(vessel);
        }
      }
    }
  }), [vessel, destination]);

  if (!vessel) return null;

  const currentPosition = [vessel.latitude, vessel.longitude];
  const vesselIcon = createVesselIcon(vessel.course, isSubscribed);

  return (
    <>
      {/* Vessel Marker */}
      <Marker position={currentPosition} icon={vesselIcon}>
        <Popup>
          <div className="vessel-popup">
            <h4>{vessel.name}</h4>
            <p><strong>MMSI:</strong> {vessel.mmsi}</p>
            <p><strong>Type:</strong> {vessel.vessel_type || vessel.type}</p>
            <p><strong>Flag:</strong> {vessel.flag}</p>
            <p><strong>Speed:</strong> {vessel.speed?.toFixed(1) || 'N/A'} knots</p>
            <p><strong>Course:</strong> {vessel.course?.toFixed(0) || 'N/A'}°</p>
            <p><strong>Status:</strong> {vessel.status}</p>
            <p><strong>Last Update:</strong> {new Date(vessel.timestamp).toLocaleString()}</p>
            
            {isTracking && (
              <p><strong>🛤️ Tracking:</strong> {voyageTrack.length} positions recorded</p>
            )}
            
            <div className="popup-actions">
              {isSubscribed ? (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onUnsubscribe(null, vessel.mmsi)}
                >
                  Stop Tracking
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onSubscribe(null, vessel.mmsi)}
                >
                  Start Tracking
                </button>
              )}
            </div>
          </div>
        </Popup>
      </Marker>

      {/* Voyage Track */}
      {isSubscribed && voyageTrack.length > 1 && (
        <Polyline
          positions={voyageTrack}
          pathOptions={{
            color: '#ff4444',
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 10'
          }}
        />
      )}

      {/* Estimated Destination */}
      {isSubscribed && destination && (
        <Marker position={destination} icon={destinationIcon}>
          <Popup>
            <div>
              <h4>🎯 Estimated Destination</h4>
              <p><strong>Vessel:</strong> {vessel.name}</p>
              <p><strong>ETA:</strong> ~24 hours</p>
              <p><small>Based on current course and speed</small></p>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default VoyageTracker;