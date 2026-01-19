// Maritime Vessel Tracking Platform - Map Functions

// Map instances storage
const maps = {};

// Get marker color based on vessel type
function getMarkerColor(type) {
    switch (type) {
        case 'tanker': return '#ef4444';
        case 'passenger': return '#a855f7';
        case 'cargo': return '#22c55e';
        default: return '#3b82f6';
    }
}

// Initialize Dashboard Map
function initializeDashboardMap(vessels) {
    if (maps.dashboard) {
        maps.dashboard.remove();
    }

    maps.dashboard = L.map('dashboardMap').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(maps.dashboard);

    vessels.forEach(vessel => {
        const markerColor = getMarkerColor(vessel.type);
        L.circleMarker([vessel.lat, vessel.lon], {
            radius: 6,
            fillColor: markerColor,
            color: '#fff',
            weight: 2,
            fillOpacity: 1
        }).addTo(maps.dashboard)
          .bindPopup(`<b>${vessel.name}</b><br>Type: ${vessel.type}<br>Speed: ${vessel.speed} knots`);
    });

    return maps.dashboard;
}

// Initialize Live Tracking Map
function initializeLiveMap(vessels, safetyZones, onVesselClick) {
    if (maps.live) {
        maps.live.remove();
    }

    maps.live = L.map('liveMap').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(maps.live);

    // Add piracy zones
    if (safetyZones.piracy) {
        maps.piracyLayer = L.layerGroup();
        safetyZones.piracy.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                radius: zone.radius,
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.2
            }).bindPopup(`<b>Piracy Risk Zone</b><br>${zone.name} - High Risk`)
              .addTo(maps.piracyLayer);
        });
        maps.piracyLayer.addTo(maps.live);
    }

    // Add weather zones
    if (safetyZones.weather) {
        maps.weatherLayer = L.layerGroup();
        safetyZones.weather.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                radius: zone.radius,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2
            }).bindPopup(`<b>Storm Warning</b><br>${zone.name}`)
              .addTo(maps.weatherLayer);
        });
        maps.weatherLayer.addTo(maps.live);
    }

    // Add vessel markers
    vessels.forEach(vessel => {
        const markerColor = getMarkerColor(vessel.type);
        const marker = L.circleMarker([vessel.lat, vessel.lon], {
            radius: 8,
            fillColor: markerColor,
            color: '#fff',
            weight: 2,
            fillOpacity: 1
        }).addTo(maps.live);

        if (onVesselClick) {
            marker.on('click', () => onVesselClick(vessel));
        }
    });

    setTimeout(() => maps.live.invalidateSize(), 100);
    return maps.live;
}

// Toggle overlay visibility
function toggleOverlay(type, visible) {
    if (type === 'weather' && maps.weatherLayer) {
        if (visible) {
            maps.live.addLayer(maps.weatherLayer);
        } else {
            maps.live.removeLayer(maps.weatherLayer);
        }
    }
    if (type === 'piracy' && maps.piracyLayer) {
        if (visible) {
            maps.live.addLayer(maps.piracyLayer);
        } else {
            maps.live.removeLayer(maps.piracyLayer);
        }
    }
}

// Initialize Safety Map
function initializeSafetyMap(safetyZones) {
    if (maps.safety) {
        maps.safety.remove();
    }

    maps.safety = L.map('safetyMap').setView([15, 50], 3);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(maps.safety);

    // Add piracy zones
    if (safetyZones.piracy) {
        safetyZones.piracy.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                radius: zone.radius,
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.3
            }).bindPopup(`<b>Piracy Zone</b><br>${zone.name}`)
              .addTo(maps.safety);
        });
    }

    // Add weather zones
    if (safetyZones.weather) {
        safetyZones.weather.forEach(zone => {
            L.circle([zone.lat, zone.lon], {
                radius: zone.radius,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.3
            }).bindPopup(`<b>Storm Zone</b><br>${zone.name}`)
              .addTo(maps.safety);
        });
    }

    setTimeout(() => maps.safety.invalidateSize(), 100);
    return maps.safety;
}

// Initialize Voyage Replay Map
function initializeVoyageMap() {
    if (maps.voyage) {
        maps.voyage.remove();
    }

    maps.voyage = L.map('voyageMap').setView([20, 60], 3);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(maps.voyage);

    setTimeout(() => maps.voyage.invalidateSize(), 100);
    return maps.voyage;
}

// Load voyage route on map
function loadVoyageRoute(voyageId, voyageRoutes) {
    if (!voyageId || !maps.voyage) return null;

    const route = voyageRoutes[voyageId];
    if (!route) return null;

    // Remove existing route
    if (maps.voyageRoute) {
        maps.voyage.removeLayer(maps.voyageRoute);
    }

    // Add new route
    maps.voyageRoute = L.polyline(route, { 
        color: '#3b82f6', 
        weight: 3 
    }).addTo(maps.voyage);
    
    maps.voyage.fitBounds(maps.voyageRoute.getBounds(), { padding: [50, 50] });

    // Add markers for start and end points
    L.marker(route[0]).addTo(maps.voyage).bindPopup('Origin');
    L.marker(route[route.length - 1]).addTo(maps.voyage).bindPopup('Destination');

    return maps.voyageRoute;
}

// Invalidate map sizes (call when tab becomes visible)
function invalidateMapSizes() {
    Object.values(maps).forEach(map => {
        if (map && typeof map.invalidateSize === 'function') {
            map.invalidateSize();
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        maps,
        getMarkerColor,
        initializeDashboardMap,
        initializeLiveMap,
        toggleOverlay,
        initializeSafetyMap,
        initializeVoyageMap,
        loadVoyageRoute,
        invalidateMapSizes
    };
}