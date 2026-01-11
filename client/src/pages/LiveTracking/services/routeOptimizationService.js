// src/pages/LiveTracking/services/routeOptimizationService.js

/**
 * Route Optimization Service
 * Suggests optimal routes avoiding piracy zones and bad weather
 */

/**
 * Calculate distance between two points using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if point is inside a danger zone
 */
const isPointInDangerZone = (lat, lon, zones) => {
  return zones.some(zone => {
    const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);
    return distance < (zone.radius || 100); // Default 100km radius
  });
};

/**
 * Check if route segment intersects with danger zones
 */
const routeIntersectsDangerZones = (startLat, startLon, endLat, endLon, zones) => {
  // Check multiple points along the route
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = startLat + (endLat - startLat) * ratio;
    const lon = startLon + (endLon - startLon) * ratio;
    
    if (isPointInDangerZone(lat, lon, zones)) {
      return true;
    }
  }
  return false;
};

/**
 * Generate waypoints around danger zones
 */
const generateSafeWaypoints = (startLat, startLon, endLat, endLon, zones) => {
  const waypoints = [];
  
  // Check if direct route is safe
  if (!routeIntersectsDangerZones(startLat, startLon, endLat, endLon, zones)) {
    return [
      { latitude: startLat, longitude: startLon },
      { latitude: endLat, longitude: endLon }
    ];
  }

  // Find zones along the route
  const dangerZonesOnRoute = zones.filter(zone => {
    const distance = calculateDistance(
      (startLat + endLat) / 2, 
      (startLon + endLon) / 2,
      zone.latitude,
      zone.longitude
    );
    return distance < 500; // Within 500km of route midpoint
  });

  if (dangerZonesOnRoute.length === 0) {
    return [
      { latitude: startLat, longitude: startLon },
      { latitude: endLat, longitude: endLon }
    ];
  }

  // Create waypoints to avoid zones
  waypoints.push({ latitude: startLat, longitude: startLon });

  dangerZonesOnRoute.forEach(zone => {
    // Calculate perpendicular offset to avoid zone
    const bearing = Math.atan2(endLon - startLon, endLat - startLat);
    const offsetBearing = bearing + Math.PI / 2; // 90 degrees perpendicular
    const offsetDistance = (zone.radius || 100) + 50; // Zone radius + 50km safety margin
    
    // Convert distance to degrees (approximate)
    const offsetLat = zone.latitude + (offsetDistance / 111) * Math.cos(offsetBearing);
    const offsetLon = zone.longitude + (offsetDistance / (111 * Math.cos(zone.latitude * Math.PI / 180))) * Math.sin(offsetBearing);
    
    waypoints.push({ latitude: offsetLat, longitude: offsetLon });
  });

  waypoints.push({ latitude: endLat, longitude: endLon });

  return waypoints;
};

/**
 * Calculate route safety score (0-100)
 */
const calculateRouteSafety = (route, piracyZones, weatherZones) => {
  let safetyScore = 100;
  
  // Check each segment for dangers
  for (let i = 0; i < route.length - 1; i++) {
    const segment = {
      start: route[i],
      end: route[i + 1]
    };

    // Check piracy zones
    if (routeIntersectsDangerZones(
      segment.start.latitude,
      segment.start.longitude,
      segment.end.latitude,
      segment.end.longitude,
      piracyZones
    )) {
      safetyScore -= 30;
    }

    // Check weather zones
    if (routeIntersectsDangerZones(
      segment.start.latitude,
      segment.start.longitude,
      segment.end.latitude,
      segment.end.longitude,
      weatherZones
    )) {
      safetyScore -= 20;
    }
  }

  return Math.max(0, safetyScore);
};

/**
 * Calculate total route distance
 */
const calculateRouteDistance = (route) => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(
      route[i].latitude,
      route[i].longitude,
      route[i + 1].latitude,
      route[i + 1].longitude
    );
  }
  return totalDistance;
};

/**
 * Estimate voyage duration
 */
const estimateVoyageDuration = (distanceKm, averageSpeedKnots = 12) => {
  const distanceNauticalMiles = distanceKm * 0.539957; // Convert km to nautical miles
  const hours = distanceNauticalMiles / averageSpeedKnots;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return { days, hours: remainingHours, totalHours: hours };
};

/**
 * Generate optimal route
 */
export const generateOptimalRoute = (vessel, destination, piracyZones, weatherZones) => {
  const startLat = vessel.last_position_lat;
  const startLon = vessel.last_position_lon;
  const endLat = destination.latitude;
  const endLon = destination.longitude;

  // Combine all danger zones
  const allDangerZones = [...piracyZones, ...weatherZones];

  // Generate safe waypoints
  const waypoints = generateSafeWaypoints(startLat, startLon, endLat, endLon, allDangerZones);

  // Calculate route metrics
  const safetyScore = calculateRouteSafety(waypoints, piracyZones, weatherZones);
  const distance = calculateRouteDistance(waypoints);
  const duration = estimateVoyageDuration(distance, vessel.speed || 12);

  // Generate route alternatives
  const alternatives = generateRouteAlternatives(startLat, startLon, endLat, endLon, allDangerZones);

  return {
    recommended: {
      waypoints,
      distance: distance.toFixed(2),
      safetyScore,
      duration,
      avoidsPiracy: !routeIntersectsDangerZones(startLat, startLon, endLat, endLon, piracyZones),
      avoidsWeather: !routeIntersectsDangerZones(startLat, startLon, endLat, endLon, weatherZones)
    },
    alternatives,
    dangerZones: {
      piracy: piracyZones.length,
      weather: weatherZones.length
    }
  };
};

/**
 * Generate alternative routes
 */
const generateRouteAlternatives = (startLat, startLon, endLat, endLon, dangerZones) => {
  const alternatives = [];

  // Direct route (may be unsafe)
  const directRoute = [
    { latitude: startLat, longitude: startLon },
    { latitude: endLat, longitude: endLon }
  ];
  
  alternatives.push({
    name: 'Direct Route',
    waypoints: directRoute,
    distance: calculateDistance(startLat, startLon, endLat, endLon).toFixed(2),
    safetyScore: calculateRouteSafety(directRoute, dangerZones, []),
    description: 'Shortest distance but may cross danger zones'
  });

  // Northern route (arc above danger zones)
  const northernMidLat = Math.max(startLat, endLat) + 5;
  const northernMidLon = (startLon + endLon) / 2;
  const northernRoute = [
    { latitude: startLat, longitude: startLon },
    { latitude: northernMidLat, longitude: northernMidLon },
    { latitude: endLat, longitude: endLon }
  ];

  alternatives.push({
    name: 'Northern Route',
    waypoints: northernRoute,
    distance: calculateRouteDistance(northernRoute).toFixed(2),
    safetyScore: calculateRouteSafety(northernRoute, dangerZones, []),
    description: 'Route via northern waters'
  });

  // Southern route (arc below danger zones)
  const southernMidLat = Math.min(startLat, endLat) - 5;
  const southernMidLon = (startLon + endLon) / 2;
  const southernRoute = [
    { latitude: startLat, longitude: startLon },
    { latitude: southernMidLat, longitude: southernMidLon },
    { latitude: endLat, longitude: endLon }
  ];

  alternatives.push({
    name: 'Southern Route',
    waypoints: southernRoute,
    distance: calculateRouteDistance(southernRoute).toFixed(2),
    safetyScore: calculateRouteSafety(southernRoute, dangerZones, []),
    description: 'Route via southern waters'
  });

  return alternatives.sort((a, b) => b.safetyScore - a.safetyScore);
};

/**
 * Check if vessel needs route adjustment
 */
export const needsRouteAdjustment = (vessel, destination, piracyZones, weatherZones) => {
  const allDangerZones = [...piracyZones, ...weatherZones];
  
  return routeIntersectsDangerZones(
    vessel.last_position_lat,
    vessel.last_position_lon,
    destination.latitude,
    destination.longitude,
    allDangerZones
  );
};

/**
 * Get nearest safe waypoint
 */
export const getNearestSafeWaypoint = (vessel, piracyZones, weatherZones) => {
  const allDangerZones = [...piracyZones, ...weatherZones];
  
  // Check if current position is in danger
  if (!isPointInDangerZone(vessel.last_position_lat, vessel.last_position_lon, allDangerZones)) {
    return null; // Already safe
  }

  // Find nearest safe point
  let minDistance = Infinity;
  let nearestSafe = null;

  // Search in a grid around current position
  const searchRadius = 2; // degrees
  const steps = 10;
  
  for (let latOffset = -searchRadius; latOffset <= searchRadius; latOffset += searchRadius / steps) {
    for (let lonOffset = -searchRadius; lonOffset <= searchRadius; lonOffset += searchRadius / steps) {
      const testLat = vessel.last_position_lat + latOffset;
      const testLon = vessel.last_position_lon + lonOffset;
      
      if (!isPointInDangerZone(testLat, testLon, allDangerZones)) {
        const distance = calculateDistance(
          vessel.last_position_lat,
          vessel.last_position_lon,
          testLat,
          testLon
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestSafe = { latitude: testLat, longitude: testLon };
        }
      }
    }
  }

  return nearestSafe;
};

export default {
  generateOptimalRoute,
  needsRouteAdjustment,
  getNearestSafeWaypoint,
  calculateDistance
};