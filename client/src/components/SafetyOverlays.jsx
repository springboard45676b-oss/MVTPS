// src/components/SafetyOverlays.jsx
import React from 'react';
import { Rectangle, Popup, Polygon, Marker, Circle } from 'react-leaflet';
import { divIcon } from 'leaflet';

// ==================== SAFETY DATA ====================

// High-Risk Piracy Zones
const PIRACY_ZONES = [
  {
    id: 'somalia',
    name: 'Gulf of Aden / Somali Basin',
    bounds: [[0, 40], [15, 75]],
    riskLevel: 'critical',
    incidents: 245,
    description: 'High-risk piracy zone with frequent armed attacks'
  },
  {
    id: 'guinea',
    name: 'Gulf of Guinea',
    bounds: [[-5, -5], [10, 15]],
    riskLevel: 'high',
    incidents: 132,
    description: 'Active piracy with kidnapping incidents'
  },
  {
    id: 'malacca',
    name: 'Malacca Strait',
    bounds: [[1, 100], [6, 105]],
    riskLevel: 'moderate',
    incidents: 45,
    description: 'Opportunistic theft and boarding attempts'
  },
  {
    id: 'singapore',
    name: 'Singapore Strait',
    bounds: [[1, 103], [1.5, 104]],
    riskLevel: 'moderate',
    incidents: 38,
    description: 'Petty theft from anchored vessels'
  }
];

// Active Storm Systems
const ACTIVE_STORMS = [
  {
    id: 'hurricane-1',
    name: 'Hurricane Elena',
    type: 'hurricane',
    category: 4,
    lat: 25.5,
    lng: -75.0,
    radius: 300,
    windSpeed: 140,
    movement: 'NW at 12 mph',
    forecast: 'Expected to intensify'
  },
  {
    id: 'typhoon-1',
    name: 'Typhoon Kiko',
    type: 'typhoon',
    category: 3,
    lat: 15.2,
    lng: 125.5,
    radius: 250,
    windSpeed: 120,
    movement: 'W at 15 mph',
    forecast: 'Weakening expected'
  },
  {
    id: 'tropical-storm-1',
    name: 'Tropical Storm Marco',
    type: 'tropical_storm',
    category: null,
    lat: 10.5,
    lng: -60.0,
    radius: 150,
    windSpeed: 65,
    movement: 'NW at 10 mph',
    forecast: 'May strengthen to hurricane'
  }
];

// Maritime Accident Hotspots
const ACCIDENT_HOTSPOTS = [
  {
    id: 'english-channel',
    name: 'English Channel',
    lat: 50.5,
    lng: -1.5,
    accidents: 87,
    types: ['Collision', 'Grounding', 'Fire'],
    severity: 'high'
  },
  {
    id: 'south-china-sea',
    name: 'South China Sea',
    lat: 12.0,
    lng: 115.0,
    accidents: 156,
    types: ['Collision', 'Piracy', 'Storm Damage'],
    severity: 'critical'
  },
  {
    id: 'suez-canal',
    name: 'Suez Canal Approaches',
    lat: 30.0,
    lng: 32.5,
    accidents: 45,
    types: ['Grounding', 'Collision'],
    severity: 'moderate'
  },
  {
    id: 'bering-strait',
    name: 'Bering Strait',
    lat: 65.5,
    lng: -169.0,
    accidents: 32,
    types: ['Ice Damage', 'Engine Failure', 'Grounding'],
    severity: 'high'
  },
  {
    id: 'torres-strait',
    name: 'Torres Strait',
    lat: -10.5,
    lng: 142.0,
    accidents: 28,
    types: ['Grounding', 'Collision'],
    severity: 'moderate'
  }
];

// ==================== HELPER FUNCTIONS ====================

const getPiracyZoneColor = (riskLevel) => {
  switch(riskLevel) {
    case 'critical': return '#dc2626';
    case 'high': return '#f97316';
    case 'moderate': return '#f59e0b';
    default: return '#eab308';
  }
};

const getStormColor = (type, category) => {
  if (type === 'hurricane' && category >= 3) return '#dc2626';
  if (type === 'hurricane' || type === 'typhoon') return '#f97316';
  return '#f59e0b';
};

const getAccidentColor = (severity) => {
  switch(severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#f97316';
    case 'moderate': return '#f59e0b';
    default: return '#eab308';
  }
};

const createStormCloudBoundary = (centerLat, centerLng, radiusKm, complexity = 20) => {
  const coordinates = [];
  const earthRadius = 6371;
  
  for (let i = 0; i < complexity; i++) {
    const angle = (i / complexity) * 2 * Math.PI;
    const bump1 = 0.1 * Math.sin(angle * 3);
    const bump2 = 0.15 * Math.cos(angle * 5);
    const bump3 = 0.08 * Math.sin(angle * 7);
    const variation = 0.85 + bump1 + bump2 + bump3;
    const r = (radiusKm / earthRadius) * variation;
    const lat = centerLat + (r * Math.cos(angle) * 180 / Math.PI);
    const lng = centerLng + (r * Math.sin(angle) * 180 / Math.PI) / Math.cos(centerLat * Math.PI / 180);
    coordinates.push([lat, lng]);
  }
  
  return coordinates;
};

const createDangerZoneBoundary = (centerLat, centerLng, radiusKm) => {
  const points = 12;
  const coordinates = [];
  const earthRadius = 6371;
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const variation = 0.7 + Math.random() * 0.6;
    const r = (radiusKm / earthRadius) * variation;
    const lat = centerLat + (r * Math.cos(angle) * 180 / Math.PI);
    const lng = centerLng + (r * Math.sin(angle) * 180 / Math.PI) / Math.cos(centerLat * Math.PI / 180);
    coordinates.push([lat, lng]);
  }
  
  return coordinates;
};

const createPiracyBorder = (bounds) => {
  const [[south, west], [north, east]] = bounds;
  const segments = 20;
  const border = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lng = west + (east - west) * t;
    const variation = (Math.random() - 0.5) * 2;
    border.push([north + variation, lng]);
  }
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = north - (north - south) * t;
    const variation = (Math.random() - 0.5) * 2;
    border.push([lat, east + variation]);
  }
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lng = east - (east - west) * t;
    const variation = (Math.random() - 0.5) * 2;
    border.push([south + variation, lng]);
  }
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = south + (north - south) * t;
    const variation = (Math.random() - 0.5) * 2;
    border.push([lat, west + variation]);
  }
  
  return border;
};

// ==================== MARKER ICONS ====================

const PiracyMarkerIcon = (zone) => {
  const color = getPiracyZoneColor(zone.riskLevel);
  const size = 48;
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: ${color};
          border-radius: 8px;
          transform: rotate(45deg);
          animation: piracy-pulse 2s ease-in-out infinite;
          opacity: 0.3;
        "></div>
        <div style="
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        "></div>
        <div style="
          position: absolute;
          width: ${size - 6}px;
          height: ${size - 6}px;
          background: white;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        "></div>
        <div style="
          position: absolute;
          width: ${size - 12}px;
          height: ${size - 12}px;
          background: ${color};
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        "></div>
        <span style="
          position: relative;
          font-size: 24px;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          animation: piracy-shake 3s ease-in-out infinite;
        ">☠️</span>
      </div>
      <style>
        @keyframes piracy-pulse {
          0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.3; }
          50% { transform: rotate(45deg) scale(1.4); opacity: 0.1; }
        }
        @keyframes piracy-shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-3deg); }
          20%, 40%, 60%, 80% { transform: rotate(3deg); }
        }
      </style>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const StormMarkerIcon = (storm) => {
  const color = getStormColor(storm.type, storm.category);
  const size = 50;
  const icon = storm.type === 'hurricane' || storm.type === 'typhoon' ? '🌀' : '⛈️';
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, ${color}dd 0%, ${color}88 40%, transparent 70%);
          border-radius: 50%;
          animation: storm-rotate 4s linear infinite;
        "></div>
        <div style="
          position: absolute;
          width: 120%;
          height: 120%;
          border: 3px solid ${color};
          border-radius: 50%;
          animation: storm-pulse 2s ease-in-out infinite;
          opacity: 0.6;
        "></div>
        <span style="
          position: relative;
          font-size: 32px;
          z-index: 1;
          animation: storm-spin 3s linear infinite;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
        ">${icon}</span>
      </div>
      <style>
        @keyframes storm-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes storm-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0.3; }
        }
        @keyframes storm-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const AccidentMarkerIcon = (hotspot) => {
  const color = getAccidentColor(hotspot.severity);
  const size = 45;
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: danger-pulse 2s ease-in-out infinite;
      ">
        <svg width="${size}" height="${size}" style="position: absolute;">
          <polygon 
            points="${size/2},5 ${size-5},${size-5} 5,${size-5}" 
            fill="${color}" 
            stroke="#fff" 
            stroke-width="3"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))"
          />
          <polygon 
            points="${size/2},5 ${size-5},${size-5} 5,${size-5}" 
            fill="none" 
            stroke="${color}" 
            stroke-width="2"
            stroke-dasharray="4,4"
            opacity="0.6"
          />
        </svg>
        <span style="
          position: relative;
          font-size: 22px;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        ">⚠️</span>
      </div>
      <style>
        @keyframes danger-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
      </style>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// ==================== MAIN COMPONENT ====================

const SafetyOverlays = () => {
  return (
    <>
      {/* PIRACY ZONES */}
      {PIRACY_ZONES.map(zone => {
        const [[south, west], [north, east]] = zone.bounds;
        const centerLat = (north + south) / 2;
        const centerLng = (east + west) / 2;
        const jaggedBorder = createPiracyBorder(zone.bounds);
        
        return (
          <React.Fragment key={zone.id}>
            <Rectangle
              bounds={zone.bounds}
              pathOptions={{
                color: getPiracyZoneColor(zone.riskLevel),
                fillColor: getPiracyZoneColor(zone.riskLevel),
                fillOpacity: 0.12,
                weight: 0
              }}
            />
            <Polygon
              positions={jaggedBorder}
              pathOptions={{
                color: getPiracyZoneColor(zone.riskLevel),
                fillColor: 'transparent',
                weight: 4,
                dashArray: '12, 8',
                lineCap: 'square'
              }}
            />
            <Rectangle
              bounds={[
                [south + 0.5, west + 0.5],
                [north - 0.5, east - 0.5]
              ]}
              pathOptions={{
                color: getPiracyZoneColor(zone.riskLevel),
                fillColor: 'transparent',
                weight: 2,
                dashArray: '8, 12',
                opacity: 0.6
              }}
            />
            {[...Array(5)].map((_, i) => {
              const offset = (east - west) / 5 * i;
              return (
                <Polygon
                  key={`stripe-${i}`}
                  positions={[
                    [south, west + offset],
                    [south, west + offset + 1],
                    [north, east - (east - west - offset - 1)],
                    [north, east - (east - west - offset)]
                  ]}
                  pathOptions={{
                    color: getPiracyZoneColor(zone.riskLevel),
                    fillColor: getPiracyZoneColor(zone.riskLevel),
                    fillOpacity: 0.08,
                    weight: 0
                  }}
                />
              );
            })}
            <Marker position={[centerLat, centerLng]} icon={PiracyMarkerIcon(zone)}>
              <Popup>
                <div className="w-80 text-sm">
                  <div className="bg-red-600 text-white p-3 -m-3 mb-3 rounded-t">
                    <div className="font-bold text-xl flex items-center gap-2">☠️ HIGH RISK ZONE</div>
                    <p className="text-red-100 text-xs mt-1">Armed Piracy Activity</p>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-600 p-3 mb-3">
                    <p className="font-bold text-red-900 text-lg">{zone.name}</p>
                  </div>
                  <div className="space-y-3 text-slate-700">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded p-3 border-2 border-red-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-red-900">Risk Level:</span>
                        <span className="text-2xl font-black uppercase px-3 py-1 rounded" 
                          style={{ background: getPiracyZoneColor(zone.riskLevel), color: 'white' }}>
                          {zone.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded p-3 border border-amber-300">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Piracy Incidents:</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-red-600">{zone.incidents}</div>
                          <div className="text-xs text-amber-700">Last 2 years</div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t-2 border-slate-200 pt-3">
                      <p className="font-semibold mb-2">Threat Description:</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{zone.description}</p>
                    </div>
                    <div className="bg-red-600 text-white rounded p-3 space-y-2">
                      <p className="font-bold text-center text-sm">⚠️ SECURITY RECOMMENDATIONS</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Maintain maximum speed through zone</li>
                        <li>Deploy anti-piracy measures</li>
                        <li>Report suspicious activity immediately</li>
                        <li>Consider armed security escorts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}

      {/* ACTIVE STORMS */}
      {ACTIVE_STORMS.map(storm => {
        const stormBoundary = createStormCloudBoundary(storm.lat, storm.lng, storm.radius, 30);
        const innerBoundary = createStormCloudBoundary(storm.lat, storm.lng, storm.radius * 0.6, 25);
        const coreBoundary = createStormCloudBoundary(storm.lat, storm.lng, storm.radius * 0.3, 20);
        
        return (
          <React.Fragment key={storm.id}>
            <Polygon
              positions={createStormCloudBoundary(storm.lat, storm.lng, storm.radius * 1.5, 35)}
              pathOptions={{
                color: getStormColor(storm.type, storm.category),
                fillColor: getStormColor(storm.type, storm.category),
                fillOpacity: 0.08,
                weight: 0
              }}
            />
            <Polygon
              positions={stormBoundary}
              pathOptions={{
                color: getStormColor(storm.type, storm.category),
                fillColor: getStormColor(storm.type, storm.category),
                fillOpacity: 0.15,
                weight: 4,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '8, 12'
              }}
            />
            <Polygon
              positions={innerBoundary}
              pathOptions={{
                color: getStormColor(storm.type, storm.category),
                fillColor: getStormColor(storm.type, storm.category),
                fillOpacity: 0.25,
                weight: 3,
                dashArray: '5, 8'
              }}
            />
            <Polygon
              positions={coreBoundary}
              pathOptions={{
                color: '#dc2626',
                fillColor: '#dc2626',
                fillOpacity: 0.35,
                weight: 3
              }}
            />
            <Circle
              center={[storm.lat, storm.lng]}
              radius={storm.radius * 1000}
              pathOptions={{
                color: getStormColor(storm.type, storm.category),
                fillColor: 'transparent',
                weight: 2,
                dashArray: '15, 10',
                opacity: 0.7
              }}
            />
            <Circle
              center={[storm.lat, storm.lng]}
              radius={storm.radius * 1000 * 0.5}
              pathOptions={{
                color: getStormColor(storm.type, storm.category),
                fillColor: 'transparent',
                weight: 2,
                dashArray: '10, 15',
                opacity: 0.8
              }}
            />
            <Marker position={[storm.lat, storm.lng]} icon={StormMarkerIcon(storm)}>
              <Popup>
                <div className="w-72 text-sm">
                  <div className="font-bold text-xl mb-3 text-orange-600 flex items-center gap-2 border-b-2 border-orange-600 pb-2">
                    🌀 {storm.name}
                  </div>
                  {storm.category && (
                    <div className="bg-red-100 border-l-4 border-red-600 p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-red-900">Category</span>
                        <span className="text-3xl font-bold text-red-600">{storm.category}</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">{storm.type.toUpperCase()}</p>
                    </div>
                  )}
                  <div className="space-y-3 text-slate-700">
                    <div className="bg-orange-50 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Wind Speed:</span>
                        <span className="text-2xl font-bold text-orange-600">{storm.windSpeed} mph</span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(storm.windSpeed / 2, 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Type:</span>
                      <span className="capitalize font-semibold">{storm.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Movement:</span>
                      <span className="font-semibold text-blue-600">→ {storm.movement}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Impact Radius:</span>
                      <span className="font-semibold">{storm.radius} km</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-300 rounded p-3">
                      <p className="font-semibold text-blue-900 mb-1">Forecast:</p>
                      <p className="text-sm text-blue-800">{storm.forecast}</p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-500 rounded p-2">
                      <p className="text-xs text-red-700 font-bold text-center">
                        ⛔ AVOID THIS AREA - SEVERE WEATHER
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}

      {/* ACCIDENT HOTSPOTS */}
      {ACCIDENT_HOTSPOTS.map(hotspot => {
        const dangerZone = createDangerZoneBoundary(hotspot.lat, hotspot.lng, 100);
        
        return (
          <React.Fragment key={hotspot.id}>
            <Circle
              center={[hotspot.lat, hotspot.lng]}
              radius={120000}
              pathOptions={{
                color: getAccidentColor(hotspot.severity),
                fillColor: getAccidentColor(hotspot.severity),
                fillOpacity: 0.05,
                weight: 0
              }}
            />
            <Polygon
              positions={dangerZone}
              pathOptions={{
                color: getAccidentColor(hotspot.severity),
                fillColor: getAccidentColor(hotspot.severity),
                fillOpacity: 0.15,
                weight: 3,
                dashArray: '10, 5',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Circle
              center={[hotspot.lat, hotspot.lng]}
              radius={80000}
              pathOptions={{
                color: getAccidentColor(hotspot.severity),
                fillColor: getAccidentColor(hotspot.severity),
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 10'
              }}
            />
            <Marker position={[hotspot.lat, hotspot.lng]} icon={AccidentMarkerIcon(hotspot)}>
              <Popup>
                <div className="w-72 text-sm">
                  <div className="font-bold text-lg mb-3 text-red-600 flex items-center gap-2 border-b-2 border-red-600 pb-2">
                    ⚠️ DANGER ZONE
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-600 p-3 mb-3">
                    <p className="font-bold text-yellow-800">{hotspot.name}</p>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="bg-red-50 rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Accidents:</span>
                        <span className="text-2xl font-bold text-red-600">{hotspot.accidents}</span>
                      </div>
                      <div className="text-xs text-red-600 mt-1">Last 2 years</div>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Severity Level:</span>
                      <span className="capitalize font-bold text-lg" 
                        style={{ color: getAccidentColor(hotspot.severity) }}>
                        {hotspot.severity.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold block mb-2">Incident Types:</span>
                      <div className="flex flex-wrap gap-2">
                        {hotspot.types.map((type, idx) => (
                          <span key={idx} 
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-300">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-300 rounded p-2 mt-3">
                      <p className="text-xs text-amber-800 font-semibold">
                        ⚠️ Exercise extreme caution in this area
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default SafetyOverlays;