// Maritime Vessel Tracking Platform - Main Application

// Application State
let currentUser = null;
let isPlaying = false;
let voyagePlayInterval = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    updateTime();
    setInterval(updateTime, 1000);
});

// Initialize Login Form
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const role = document.getElementById('loginRole').value;

    currentUser = {
        email: email,
        role: role,
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User'
    };

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    // Show/hide admin menu based on role
    const adminSection = document.getElementById('adminMenuSection');
    if (adminSection) {
        adminSection.style.display = role !== 'admin' ? 'none' : 'block';
    }

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    initializeApp();
}

// Logout
function logout() {
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    
    const adminSection = document.getElementById('adminMenuSection');
    if (adminSection) {
        adminSection.style.display = 'block';
    }
}

// Initialize Application
function initializeApp() {
    initializeDashboard();
    populateTables();
}

// Update Time Display
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
}

// Show Section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));

    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    if (event && event.target) {
        const sidebarItem = event.target.closest('.sidebar-item');
        if (sidebarItem) {
            sidebarItem.classList.add('active');
        }
    }

    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }

    // Update header
    const titles = {
        dashboard: ['Dashboard', 'Real-time maritime operations overview'],
        liveTracking: ['Live Tracking', 'Real-time vessel positions and safety overlays'],
        vessels: ['Vessel Management', 'Monitor and manage all tracked vessels'],
        ports: ['Port Analytics', 'Congestion analysis and port performance'],
        safety: ['Safety & Risks', 'Weather, piracy, and incident monitoring'],
        voyages: ['Voyage History', 'Historical voyage replay and audit trail'],
        analytics: ['Analytics', 'Fleet performance and trade insights'],
        notifications: ['Notifications', 'Alerts and system notifications'],
        admin: ['Admin Panel', 'System administration and user management']
    };

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    if (pageTitle) pageTitle.textContent = titles[section]?.[0] || 'Dashboard';
    if (pageSubtitle) pageSubtitle.textContent = titles[section]?.[1] || '';

    // Initialize section-specific content
    setTimeout(() => {
        switch (section) {
            case 'liveTracking':
                initializeLiveTrackingSection();
                break;
            case 'ports':
                initializePortsSection();
                break;
            case 'safety':
                initializeSafetySection();
                break;
            case 'voyages':
                initializeVoyagesSection();
                break;
            case 'analytics':
                initializeAnalyticsSection();
                break;
        }
    }, 100);
}

// Initialize Dashboard
function initializeDashboard() {
    // Initialize dashboard map
    initializeDashboardMap(vessels);

    // Create traffic chart
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx) {
        createTrafficChart(trafficCtx.getContext('2d'));
    }

    // Create vessel types chart
    const typesCtx = document.getElementById('vesselTypesChart');
    if (typesCtx) {
        createVesselTypesChart(typesCtx.getContext('2d'));
    }
}

// Initialize Live Tracking Section
function initializeLiveTrackingSection() {
    initializeLiveMap(vessels, safetyZones, showVesselInfo);
}

// Show Vessel Info Panel
function showVesselInfo(vessel) {
    const panel = document.getElementById('vesselInfoPanel');
    if (!panel) return;

    panel.classList.remove('hidden');
    
    document.getElementById('selectedVesselName').textContent = vessel.name;
    document.getElementById('vesselIMO').textContent = vessel.imo;
    document.getElementById('vesselMMSI').textContent = vessel.mmsi;
    document.getElementById('vesselType').textContent = vessel.type.charAt(0).toUpperCase() + vessel.type.slice(1);
    document.getElementById('vesselFlag').textContent = vessel.flag;
    document.getElementById('vesselSpeed').textContent = vessel.speed + ' knots';
    document.getElementById('vesselHeading').textContent = vessel.heading + '°';
    document.getElementById('vesselDest').textContent = vessel.dest;
}

// Close Vessel Panel
function closeVesselPanel() {
    const panel = document.getElementById('vesselInfoPanel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

// Toggle Map Overlay
function toggleMapOverlay(type) {
    const checkbox = document.getElementById('show' + type.charAt(0).toUpperCase() + type.slice(1));
    if (checkbox) {
        toggleOverlay(type, checkbox.checked);
    }
}

// Initialize Ports Section
function initializePortsSection() {
    const congestionCtx = document.getElementById('portCongestionChart');
    if (congestionCtx) {
        createPortCongestionChart(congestionCtx.getContext('2d'), ports);
    }

    const waitCtx = document.getElementById('waitTimeChart');
    if (waitCtx) {
        createWaitTimeChart(waitCtx.getContext('2d'), ports);
    }
}

// Initialize Safety Section
function initializeSafetySection() {
    initializeSafetyMap(safetyZones);

    const incidentCtx = document.getElementById('incidentChart');
    if (incidentCtx) {
        createIncidentChart(incidentCtx.getContext('2d'));
    }
}

// Initialize Voyages Section
function initializeVoyagesSection() {
    initializeVoyageMap();
}

// Load Voyage
function loadVoyage() {
    const voyageSelect = document.getElementById('voyageSelect');
    if (voyageSelect) {
        loadVoyageRoute(voyageSelect.value, voyageRoutes);
    }
}

// Play Voyage
function playVoyage() {
    loadVoyage();
}

// Toggle Playback
function togglePlayback() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
}

// Seek Voyage
function seekVoyage(value) {
    // Implement voyage seeking logic
    console.log('Seeking to:', value);
}

// Initialize Analytics Section
function initializeAnalyticsSection() {
    const fleetCtx = document.getElementById('fleetPerformanceChart');
    if (fleetCtx) {
        createFleetPerformanceChart(fleetCtx.getContext('2d'));
    }

    const fuelCtx = document.getElementById('fuelEfficiencyChart');
    if (fuelCtx) {
        createFuelEfficiencyChart(fuelCtx.getContext('2d'));
    }

    const cargoCtx = document.getElementById('cargoDistChart');
    if (cargoCtx) {
        createCargoDistributionChart(cargoCtx.getContext('2d'));
    }

    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        createRevenueChart(revenueCtx.getContext('2d'));
    }

    const tradeCtx = document.getElementById('tradeFlowChart');
    if (tradeCtx) {
        createTradeFlowChart(tradeCtx.getContext('2d'));
    }
}

// Populate Tables
function populateTables() {
    populateVesselsTable();
    populatePortsTable();
    populateVoyagesTable();
    populateUsersTable();
    populateNotificationsList();
}

// Populate Vessels Table
function populateVesselsTable() {
    const tbody = document.getElementById('vesselsTableBody');
    if (!tbody) return;

    tbody.innerHTML = vessels.map(v => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4"><span class="font-medium text-gray-800">${v.name}</span></td>
            <td class="px-6 py-4 text-gray-600">${v.imo}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs ${
                    v.type === 'cargo' ? 'bg-green-100 text-green-700' : 
                    v.type === 'tanker' ? 'bg-red-100 text-red-700' : 
                    'bg-purple-100 text-purple-700'
                }">${v.type}</span>
            </td>
            <td class="px-6 py-4">${v.flag}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs ${
                    v.status === 'sailing' ? 'bg-blue-100 text-blue-700' : 
                    v.status === 'docked' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'
                }">${v.status}</span>
            </td>
            <td class="px-6 py-4 text-gray-600">${v.lat.toFixed(2)}°, ${v.lon.toFixed(2)}°</td>
            <td class="px-6 py-4 text-gray-600">${v.speed} kn</td>
            <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-eye"></i></button>
                <button class="text-gray-400 hover:text-gray-600"><i class="fas fa-ellipsis-v"></i></button>
            </td>
        </tr>
    `).join('');
}

// Populate Ports Table
function populatePortsTable() {
    const tbody = document.getElementById('portsTableBody');
    if (!tbody) return;

    tbody.innerHTML = ports.map(p => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-800">${p.name}</td>
            <td class="px-6 py-4">${p.country}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full ${
                            p.congestion > 80 ? 'bg-red-500' : 
                            p.congestion > 60 ? 'bg-yellow-500' : 
                            'bg-green-500'
                        }" style="width: ${p.congestion}%"></div>
                    </div>
                    <span class="text-sm">${p.congestion}%</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600">${p.waitTime}h</td>
            <td class="px-6 py-4 text-gray-600">${p.arrivals}</td>
            <td class="px-6 py-4 text-gray-600">${p.departures}</td>
        </tr>
    `).join('');
}

// Populate Voyages Table
function populateVoyagesTable() {
    const tbody = document.getElementById('voyagesTableBody');
    if (!tbody) return;

    tbody.innerHTML = voyages.map(v => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-blue-600">${v.id}</td>
            <td class="px-6 py-4 text-gray-800">${v.vessel}</td>
            <td class="px-6 py-4 text-gray-600">${v.origin}</td>
            <td class="px-6 py-4 text-gray-600">${v.dest}</td>
            <td class="px-6 py-4 text-gray-600">${v.departure}</td>
            <td class="px-6 py-4 text-gray-600">${v.arrival}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs ${
                    v.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }">${v.status}</span>
            </td>
            <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-play"></i></button>
                <button class="text-gray-400 hover:text-gray-600"><i class="fas fa-file-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

// Populate Users Table
function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <span class="font-medium text-gray-800">${u.name}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600">${u.email}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">${u.role}</span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 ${
                    u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                } rounded-full text-xs">${u.status}</span>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">${u.lastLogin}</td>
            <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                <button class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Populate Notifications List
function populateNotificationsList() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    list.innerHTML = notifications.map(n => `
        <div class="flex items-start gap-4 p-6 hover:bg-gray-50 ${n.unread ? 'bg-blue-50/50' : ''}">
            <div class="w-12 h-12 bg-${n.color}-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-${n.icon} text-${n.color}-600"></i>
            </div>
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h4 class="font-semibold text-gray-800">${n.title}</h4>
                    <span class="text-sm text-gray-500">${n.time}</span>
                </div>
                <p class="text-gray-600 mt-1">${n.message}</p>
            </div>
            ${n.unread ? '<div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>' : ''}
        </div>
    `).join('');
}

// Show Add User Modal
function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Close Add User Modal
function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Filter Vessels
function filterVessels() {
    console.log('Filtering vessels...');
    // Implement vessel filtering logic
}

// Simulate Real-time Updates
setInterval(() => {
    vessels.forEach(v => {
        v.lat += (Math.random() - 0.5) * 0.1;
        v.lon += (Math.random() - 0.5) * 0.1;
    });
}, 5000);