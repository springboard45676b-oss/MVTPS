// src/pages/liveTracking/utils/vesselUtils.js

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

export const getPortCongestionColor = (congestionScore) => {
  if (congestionScore < 3) return '#10b981';
  if (congestionScore < 6) return '#f59e0b';
  if (congestionScore < 8) return '#f97316';
  return '#ef4444';
};

export const determineVesselState = (vessel, allVoyages, allPorts) => {
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

export const computeMapCenter = (vessels) => {
  if (vessels.length === 0) {
    return { lat: 20, lng: 0 };
  }

  return {
    lat: vessels.reduce((sum, v) => sum + v.last_position_lat, 0) / vessels.length,
    lng: vessels.reduce((sum, v) => sum + v.last_position_lon, 0) / vessels.length
  };
};

export const computeActiveRoutes = (voyages, ports) => {
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return voyages
    .filter(v => v.status === 'in_progress')
    .map((voyage, index) => {
      const fromPort = ports.find(p => p.id === voyage.port_from);
      const toPort = ports.find(p => p.id === voyage.port_to);
      
      if (fromPort?.latitude && fromPort?.longitude && toPort?.latitude && toPort?.longitude) {
        return {
          id: voyage.id,
          positions: [
            [fromPort.latitude, fromPort.longitude],
            [toPort.latitude, toPort.longitude]
          ],
          color: colors[index % colors.length]
        };
      }
      return null;
    })
    .filter(Boolean);
};

export const generateIntelligentPosition = (vessel, index, totalVessels, weatherAlerts, piracyZones) => {
  const percentage = (index / totalVessels) * 100;
  
  // 30% of vessels near danger zones
  if (percentage < 30) {
    const allDangerZones = [
      ...weatherAlerts.map(w => ({ 
        lat: w.latitude, 
        lon: w.longitude, 
        radius: w.radius_km, 
        type: 'weather',
        severity: w.severity 
      })),
      ...piracyZones.map(p => ({ 
        lat: p.latitude, 
        lon: p.longitude, 
        radius: p.radius_km || 200, 
        type: 'piracy',
        risk: p.risk_level 
      }))
    ];

    if (allDangerZones.length > 0) {
      const randomZone = allDangerZones[Math.floor(Math.random() * allDangerZones.length)];
      const distance = (Math.random() * randomZone.radius * 1.5) / 111;
      const angle = Math.random() * 2 * Math.PI;
      
      const latitude = randomZone.lat + (distance * Math.cos(angle));
      const longitude = randomZone.lon + (distance * Math.sin(angle));
      
      return {
        latitude: Math.max(-85, Math.min(85, latitude)),
        longitude: ((longitude + 180) % 360) - 180,
        speed: Math.random() * 15 + 5,
        course: Math.random() * 360,
        nearDanger: true,
        dangerType: randomZone.type,
        dangerSeverity: randomZone.severity || randomZone.risk
      };
    }
  }
  
  // 70% normal random positions
  return {
    latitude: 20 + Math.random() * 40,
    longitude: -180 + Math.random() * 360,
    speed: Math.random() * 20,
    course: Math.random() * 360,
    nearDanger: false
  };
};