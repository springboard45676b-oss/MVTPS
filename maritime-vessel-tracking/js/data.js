// Maritime Vessel Tracking Platform - Mock Data

// Vessels Data
const vessels = [
    { id: 1, name: 'MV Pacific Star', imo: '9876543', mmsi: '123456789', type: 'cargo', flag: '🇵🇦 Panama', lat: 51.9, lon: 4.5, speed: 14.5, heading: 245, dest: 'Rotterdam', status: 'sailing' },
    { id: 2, name: 'SS Atlantic Glory', imo: '9876544', mmsi: '123456790', type: 'tanker', flag: '🇱🇷 Liberia', lat: 40.7, lon: -74.0, speed: 12.3, heading: 90, dest: 'New York', status: 'anchored' },
    { id: 3, name: 'MV Ocean Dream', imo: '9876545', mmsi: '123456791', type: 'passenger', flag: '🇸🇬 Singapore', lat: 1.3, lon: 103.8, speed: 18.2, heading: 180, dest: 'Singapore', status: 'sailing' },
    { id: 4, name: 'SS Northern Light', imo: '9876546', mmsi: '123456792', type: 'cargo', flag: '🇲🇭 Marshall Is.', lat: 35.6, lon: 139.7, speed: 15.8, heading: 270, dest: 'Tokyo', status: 'sailing' },
    { id: 5, name: 'MV Trade Wind', imo: '9876547', mmsi: '123456793', type: 'cargo', flag: '🇵🇦 Panama', lat: 22.3, lon: 114.2, speed: 11.4, heading: 45, dest: 'Hong Kong', status: 'docked' },
    { id: 6, name: 'SS Blue Horizon', imo: '9876548', mmsi: '123456794', type: 'tanker', flag: '🇬🇷 Greece', lat: 37.9, lon: 23.7, speed: 13.7, heading: 135, dest: 'Athens', status: 'sailing' },
    { id: 7, name: 'MV Coral Sea', imo: '9876549', mmsi: '123456795', type: 'cargo', flag: '🇯🇵 Japan', lat: -33.9, lon: 151.2, speed: 16.1, heading: 320, dest: 'Sydney', status: 'sailing' },
    { id: 8, name: 'SS Gulf Star', imo: '9876550', mmsi: '123456796', type: 'tanker', flag: '🇦🇪 UAE', lat: 25.2, lon: 55.3, speed: 0, heading: 0, dest: 'Dubai', status: 'docked' },
    { id: 9, name: 'MV Arctic Explorer', imo: '9876551', mmsi: '123456797', type: 'cargo', flag: '🇳🇴 Norway', lat: 59.9, lon: 10.7, speed: 10.5, heading: 200, dest: 'Oslo', status: 'sailing' },
    { id: 10, name: 'SS Mediterranean', imo: '9876552', mmsi: '123456798', type: 'passenger', flag: '🇮🇹 Italy', lat: 41.9, lon: 12.5, speed: 20.3, heading: 95, dest: 'Rome', status: 'sailing' }
];

// Ports Data
const ports = [
    { name: 'Port of Rotterdam', country: '🇳🇱 Netherlands', congestion: 85, waitTime: 18, arrivals: 45, departures: 42 },
    { name: 'Port of Singapore', country: '🇸🇬 Singapore', congestion: 72, waitTime: 12, arrivals: 68, departures: 71 },
    { name: 'Port of Shanghai', country: '🇨🇳 China', congestion: 91, waitTime: 24, arrivals: 89, departures: 85 },
    { name: 'Port of Los Angeles', country: '🇺🇸 USA', congestion: 65, waitTime: 8, arrivals: 34, departures: 38 },
    { name: 'Port of Hamburg', country: '🇩🇪 Germany', congestion: 45, waitTime: 6, arrivals: 28, departures: 25 },
    { name: 'Port of Antwerp', country: '🇧🇪 Belgium', congestion: 58, waitTime: 10, arrivals: 31, departures: 29 },
    { name: 'Port of Dubai', country: '🇦🇪 UAE', congestion: 42, waitTime: 5, arrivals: 22, departures: 24 },
    { name: 'Port of Hong Kong', country: '🇭🇰 Hong Kong', congestion: 78, waitTime: 14, arrivals: 52, departures: 48 }
];

// Voyages Data
const voyages = [
    { id: 'VYG-001', vessel: 'MV Pacific Star', origin: 'Rotterdam', dest: 'Singapore', departure: '2024-12-01', arrival: '2024-12-25', status: 'In Transit' },
    { id: 'VYG-002', vessel: 'SS Atlantic Glory', origin: 'New York', dest: 'Hamburg', departure: '2024-12-05', arrival: '2024-12-18', status: 'Completed' },
    { id: 'VYG-003', vessel: 'MV Ocean Dream', origin: 'Dubai', dest: 'Mumbai', departure: '2024-12-10', arrival: '2024-12-15', status: 'Completed' },
    { id: 'VYG-004', vessel: 'SS Northern Light', origin: 'Tokyo', dest: 'Los Angeles', departure: '2024-12-12', arrival: '2024-12-28', status: 'In Transit' },
    { id: 'VYG-005', vessel: 'MV Trade Wind', origin: 'Shanghai', dest: 'Sydney', departure: '2024-12-15', arrival: '2025-01-05', status: 'In Transit' }
];

// Users Data
const users = [
    { name: 'John Admin', email: 'admin@maritime.com', role: 'Administrator', status: 'Active', lastLogin: '2024-12-27 14:32' },
    { name: 'Sarah Analyst', email: 'sarah@maritime.com', role: 'Analyst', status: 'Active', lastLogin: '2024-12-27 10:15' },
    { name: 'Mike Operator', email: 'mike@maritime.com', role: 'Operator', status: 'Active', lastLogin: '2024-12-26 18:45' },
    { name: 'Emily Insurer', email: 'emily@insurance.com', role: 'Insurer', status: 'Inactive', lastLogin: '2024-12-20 09:30' }
];

// Notifications Data
const notifications = [
    { type: 'alert', icon: 'exclamation-triangle', color: 'red', title: 'Piracy Alert - Gulf of Aden', message: 'High-risk zone detected. 3 vessels in affected area.', time: '5 min ago', unread: true },
    { type: 'weather', icon: 'cloud-rain', color: 'yellow', title: 'Storm Warning - North Atlantic', message: 'Severe weather expected. Vessel route adjustments recommended.', time: '15 min ago', unread: true },
    { type: 'arrival', icon: 'anchor', color: 'green', title: 'MV Pacific Star Arrived', message: 'Successfully docked at Port of Rotterdam, Berth 12.', time: '32 min ago', unread: true },
    { type: 'congestion', icon: 'clock', color: 'orange', title: 'Port Congestion Alert', message: 'Shanghai port congestion score increased to 91%.', time: '1 hour ago', unread: true },
    { type: 'system', icon: 'cog', color: 'blue', title: 'System Update Complete', message: 'Platform updated to version 2.4.1 successfully.', time: '2 hours ago', unread: true }
];

// Voyage Routes for Replay
const voyageRoutes = {
    '1': [[51.9, 4.5], [36, -6], [14, 42], [8, 77], [1.3, 103.8]],
    '2': [[40.7, -74], [45, -40], [50, -10], [53.5, 10]],
    '3': [[25.2, 55.3], [22, 60], [19, 72.8]]
};

// Safety Zones Data
const safetyZones = {
    piracy: [
        { lat: 12.5, lon: 47, radius: 500000, name: 'Gulf of Aden' },
        { lat: 5, lon: 3, radius: 400000, name: 'Gulf of Guinea' }
    ],
    weather: [
        { lat: 45, lon: -30, radius: 800000, name: 'North Atlantic Storm' },
        { lat: 25, lon: -80, radius: 600000, name: 'Caribbean Weather System' }
    ]
};

// API Sources Data
const apiSources = [
    { name: 'MarineTraffic API', description: 'Vessel tracking & AIS data', status: 'Connected', icon: 'check', color: 'green' },
    { name: 'NOAA Weather API', description: 'Weather & ocean conditions', status: 'Connected', icon: 'check', color: 'green' },
    { name: 'UNCTAD Maritime Data', description: 'Port & trade analytics', status: 'Rate Limited', icon: 'exclamation', color: 'yellow' }
];

// System Logs
const systemLogs = [
    '[2024-12-27 14:32:15] INFO: Vessel position update received - 2,847 vessels',
    '[2024-12-27 14:32:10] INFO: Weather data sync completed',
    '[2024-12-27 14:31:45] INFO: User login: admin@maritime.com',
    '[2024-12-27 14:30:22] WARN: API rate limit approaching for MarineTraffic',
    '[2024-12-27 14:28:15] INFO: Port congestion scores recalculated',
    '[2024-12-27 14:25:00] INFO: Scheduled backup completed successfully',
    '[2024-12-27 14:20:33] INFO: New piracy alert generated - Gulf of Aden',
    '[2024-12-27 14:15:00] INFO: System health check: All services operational'
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        vessels,
        ports,
        voyages,
        users,
        notifications,
        voyageRoutes,
        safetyZones,
        apiSources,
        systemLogs
    };
}