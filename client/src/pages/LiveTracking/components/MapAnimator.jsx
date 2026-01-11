// src/pages/liveTracking/components/MapAnimator.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

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

    // Reset to world view first
    map.setView([20, 0], 2, { animate: false });

    // Then fly to random vessel
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

export default MapAnimator;