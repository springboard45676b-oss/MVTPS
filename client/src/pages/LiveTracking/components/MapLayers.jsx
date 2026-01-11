// src/pages/liveTracking/components/MapLayers.jsx
import React from 'react';
import { Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { PortMarkerIcon, VesselMarkerIcon } from '../utils/markerIcons';
import { getPortCongestionColor } from '../utils/vesselUtils';

const PortPopup = ({ port }) => (
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
);

const VesselPopup = ({ vessel }) => (
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
);

export const MapLayers = ({ 
  ports, 
  vessels, 
  activeVoyageRoutes, 
  selectedVessel, 
  routeCoordinates, 
  onSelectVessel 
}) => {
  return (
    <>
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
                <PortPopup port={port} />
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
      {activeVoyageRoutes.map((route) => (
        <Polyline
          key={`voyage-${route.id}`}
          positions={route.positions}
          color={route.color}
          weight={3}
          opacity={0.6}
          dashArray="10, 10"
        />
      ))}

      {/* Vessel Markers */}
      {vessels.map(vessel => (
        <React.Fragment key={vessel.id}>
          <Marker
            position={[vessel.last_position_lat, vessel.last_position_lon]}
            icon={VesselMarkerIcon(vessel.state, vessel.course, selectedVessel?.id === vessel.id)}
            eventHandlers={{ click: () => onSelectVessel(vessel) }}
          >
            <Popup>
              <VesselPopup vessel={vessel} />
            </Popup>
          </Marker>
        </React.Fragment>
      ))}

      {/* Selected vessel track */}
      {routeCoordinates.length > 1 && (
        <Polyline 
          positions={routeCoordinates} 
          color="#dc2626" 
          weight={3} 
          opacity={0.7} 
        />
      )}
    </>
  );
};