// src/mockData.js

// 1. Extended Vessel Database (Real-world positions simulated)
export const initialVessels = [
  { id: 1, name: "MSC Gulsun", mmsi: "9839430", imo: "9839430", type: "Container Ship", lat: 35.6892, lng: 139.6917, speed: "14.5", course: 295, destination: "Rotterdam, NL", eta: "2025-12-20", flag: "Panama", operator: "MSC", cargo: "Refrigerated Goods", lastUpdate: "14:30 UTC" },
  { id: 2, name: "Maersk Seatrade", mmsi: "9945678", imo: "9945678", type: "Refrigerated Cargo", lat: 25.0, lng: 55.0, speed: "30.0", course: 295, destination: "Dubai", eta: "2025-12-18", flag: "Denmark", operator: "Maersk", cargo: "Refrigerated Goods", lastUpdate: "14:32 UTC" },
  { id: 3, name: "Frontline Energy", mmsi: "9939137", imo: "9939137", type: "Oil Tanker", lat: 1.3521, lng: 103.8198, speed: "12.0", course: 45, destination: "Singapore", eta: "-", flag: "Marshall Islands", operator: "Frontline", cargo: "Crude Oil", lastUpdate: "12:00 UTC" },
  { id: 4, name: "Ever Given", mmsi: "9811000", imo: "9811000", type: "Container Ship", lat: 30.0444, lng: 31.2357, speed: "18.0", course: 12, destination: "Felixstowe, UK", eta: "2025-12-25", flag: "Panama", operator: "Evergreen", cargo: "Mixed Container", lastUpdate: "14:35 UTC" },
  { id: 5, name: "Diamond Gas", mmsi: "9863297", imo: "9863297", type: "LNG Carrier", lat: 51.9225, lng: 4.4791, speed: "16.4", course: 90, destination: "Qatar", eta: "2025-12-30", flag: "Bahamas", operator: "NYK", cargo: "LNG", lastUpdate: "14:10 UTC" },
  { id: 6, name: "CMA CGM Marco Polo", mmsi: "9454436", imo: "9454436", type: "Container Ship", lat: 34.0522, lng: -118.2437, speed: "15.2", course: 180, destination: "Los Angeles, USA", eta: "2025-12-22", flag: "Bahamas", operator: "CMA CGM", cargo: "Electronics", lastUpdate: "10:15 UTC" },
  { id: 7, name: "HMM Algeciras", mmsi: "440350000", imo: "9863297", type: "Container Ship", lat: 31.2304, lng: 121.4737, speed: "13.8", course: 110, destination: "Shanghai, CN", eta: "2025-12-28", flag: "Panama", operator: "HMM", cargo: "General Cargo", lastUpdate: "08:45 UTC" },
  { id: 8, name: "Arctic Discoverer", mmsi: "257688000", imo: "9276365", type: "LNG Carrier", lat: 70.6693, lng: 23.6767, speed: "18.5", course: 220, destination: "Hammerfest, NO", eta: "2025-12-19", flag: "Bahamas", operator: "K Line", cargo: "LNG", lastUpdate: "09:30 UTC" },
  { id: 9, name: "Global Mercy", mmsi: "249852000", imo: "9506253", type: "Hospital Ship", lat: 6.5244, lng: 3.3792, speed: "0.0", course: 0, destination: "Lagos, NG", eta: "Moored", flag: "Malta", operator: "Mercy Ships", cargo: "Medical Aid", lastUpdate: "11:00 UTC" },
  { id: 10, name: "OOCL Hong Kong", mmsi: "477333500", imo: "9776171", type: "Container Ship", lat: 22.3193, lng: 114.1694, speed: "11.2", course: 85, destination: "Hong Kong", eta: "2025-12-21", flag: "Hong Kong", operator: "OOCL", cargo: "Textiles", lastUpdate: "13:20 UTC" }
];

// 2. Port Analytics (UNCTAD Metrics)
export const initialPortData = [
  { name: 'Singapore', wait: 24, arrivals: 120, departures: 115, congestion: "High" },
  { name: 'Rotterdam', wait: 18, arrivals: 95, departures: 98, congestion: "Normal" },
  { name: 'Shanghai', wait: 36, arrivals: 150, departures: 140, congestion: "Severe" },
  { name: 'LA', wait: 12, arrivals: 60, departures: 55, congestion: "Low" },
  { name: 'Jebel Ali', wait: 8, arrivals: 45, departures: 48, congestion: "Low" },
  { name: 'Busan', wait: 15, arrivals: 80, departures: 82, congestion: "Normal" },
  { name: 'Antwerp', wait: 20, arrivals: 90, departures: 88, congestion: "High" },
];

// 3. Trade Volume (Import/Export Trends)
export const initialTradeData = [
  { month: 'Jan', import: 4000, export: 2400 },
  { month: 'Feb', import: 3000, export: 1398 },
  { month: 'Mar', import: 2000, export: 9800 },
  { month: 'Apr', import: 2780, export: 3908 },
  { month: 'May', import: 1890, export: 4800 },
  { month: 'Jun', import: 2390, export: 3800 },
  { month: 'Jul', import: 3490, export: 4300 },
  { month: 'Aug', import: 4200, export: 3100 },
  { month: 'Sep', import: 5100, export: 4600 },
  { month: 'Oct', import: 3800, export: 3900 },
];

// 4. Safety Overlays (NOAA & Piracy)
export const safetyZones = [
  { id: 1, type: "PIRACY ZONE", lat: 12.0, lng: 48.0, radius: 300000, color: "#ef4444", info: "Gulf of Aden: High Hijacking Risk" }, 
  { id: 2, type: "STORM WARNING", lat: 22.0, lng: 125.0, radius: 500000, color: "#f97316", info: "Typhoon Category 4: Avoid Area" }, 
  { id: 3, type: "ACCIDENT ZONE", lat: 30.0444, lng: 32.5, radius: 20000, color: "black", info: "Suez Canal: Previous Grounding Spot" },
  { id: 4, type: "ROUGH SEAS", lat: -35.0, lng: 20.0, radius: 400000, color: "#f59e0b", info: "Cape of Good Hope: 10m Waves" }
];