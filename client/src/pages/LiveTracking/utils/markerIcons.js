// src/pages/liveTracking/utils/markerIcons.js
import { divIcon } from 'leaflet';
import { getPortCongestionColor } from './vesselUtils';

export const PortMarkerIcon = (port) => {
  const color = getPortCongestionColor(port.congestion_score || 0);
  const size = 40;
  
  return divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 22px;
      ">⚓</div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export const VesselMarkerIcon = (vesselState, course = 0, isSelected = false) => {
  const size = isSelected ? 50 : 40;
  const courseAngle = course || 0;
  
  const stateColors = {
    ocean: '#3b82f6',
    in_transit: '#3b82f6',
    departure: '#f59e0b',
    arrival: '#10b981',
    at_port: '#8b5cf6'
  };
  
  const bgColor = isSelected ? '#dc2626' : (stateColors[vesselState] || stateColors.ocean);
  
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
        font-size: ${size === 50 ? '26px' : '22px'};
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