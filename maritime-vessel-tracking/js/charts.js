// Maritime Vessel Tracking Platform - Chart Configurations

// Chart color palette
const chartColors = {
    primary: '#3b82f6',
    secondary: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    purple: '#a855f7',
    cyan: '#06b6d4',
    pink: '#ec4899'
};

// Traffic Chart Configuration
function createTrafficChart(ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Arrivals',
                data: [245, 312, 287, 356, 298, 275, 320],
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Departures',
                data: [232, 298, 275, 342, 285, 268, 310],
                borderColor: chartColors.secondary,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Vessel Types Chart Configuration
function createVesselTypesChart(ctx) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cargo Ships', 'Tankers', 'Passenger Ships', 'Fishing Vessels', 'Others'],
            datasets: [{
                data: [1245, 687, 312, 423, 180],
                backgroundColor: [
                    chartColors.secondary,
                    chartColors.danger,
                    chartColors.purple,
                    chartColors.primary,
                    chartColors.warning
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

// Port Congestion Chart Configuration
function createPortCongestionChart(ctx, ports) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ports.map(p => p.name.replace('Port of ', '')),
            datasets: [{
                label: 'Congestion Score',
                data: ports.map(p => p.congestion),
                backgroundColor: ports.map(p => 
                    p.congestion > 80 ? chartColors.danger : 
                    p.congestion > 60 ? chartColors.warning : 
                    chartColors.secondary
                )
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

// Wait Time Chart Configuration
function createWaitTimeChart(ctx, ports) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ports.map(p => p.name.replace('Port of ', '')),
            datasets: [{
                label: 'Avg Wait Time (hrs)',
                data: ports.map(p => p.waitTime),
                backgroundColor: chartColors.primary
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Incident Chart Configuration
function createIncidentChart(ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Weather Incidents',
                data: [12, 15, 8, 6, 4, 3, 5, 7, 9, 11, 14, 10],
                borderColor: chartColors.primary,
                tension: 0.4
            }, {
                label: 'Piracy Attempts',
                data: [3, 2, 4, 5, 6, 4, 3, 2, 4, 5, 3, 2],
                borderColor: chartColors.danger,
                tension: 0.4
            }, {
                label: 'Collisions',
                data: [1, 2, 1, 0, 1, 2, 1, 1, 0, 2, 1, 1],
                borderColor: chartColors.warning,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Fleet Performance Chart Configuration
function createFleetPerformanceChart(ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'On-Time Arrivals (%)',
                data: [92, 88, 94, 91, 95, 93],
                borderColor: chartColors.secondary,
                tension: 0.4
            }, {
                label: 'Utilization Rate (%)',
                data: [78, 82, 79, 85, 83, 87],
                borderColor: chartColors.primary,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Fuel Efficiency Chart Configuration
function createFuelEfficiencyChart(ctx) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Fuel Consumption (MT)',
                data: [45000, 42000, 48000, 44000, 41000, 39000],
                backgroundColor: chartColors.primary
            }]
        },
        options: { responsive: true }
    });
}

// Cargo Distribution Chart Configuration
function createCargoDistributionChart(ctx) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Containers', 'Bulk', 'Oil/Gas', 'Vehicles', 'Other'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.danger,
                    chartColors.warning,
                    chartColors.purple
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Revenue Chart Configuration
function createRevenueChart(ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue ($M)',
                data: [12.5, 14.2, 13.8, 15.6, 16.2, 17.8],
                borderColor: chartColors.secondary,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });
}

// Trade Flow Chart Configuration
function createTradeFlowChart(ctx) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Asia-Europe', 'Asia-Americas', 'Europe-Americas', 'Middle East-Asia', 'Africa-Europe', 'Intra-Asia'],
            datasets: [{
                label: 'Trade Volume (Million TEU)',
                data: [24.5, 18.2, 12.8, 15.4, 8.6, 32.1],
                backgroundColor: chartColors.primary
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y'
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        chartColors,
        createTrafficChart,
        createVesselTypesChart,
        createPortCongestionChart,
        createWaitTimeChart,
        createIncidentChart,
        createFleetPerformanceChart,
        createFuelEfficiencyChart,
        createCargoDistributionChart,
        createRevenueChart,
        createTradeFlowChart
    };
}