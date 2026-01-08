import { useState, useEffect } from "react";
import { Anchor, Search, Plus, Edit, Trash2, Eye, AlertTriangle, Clock, TrendingUp, TrendingDown, Activity, MapPin, Wind, Waves, Shield, Bell, BellOff, Map, BarChart3, Users, Ship } from 'lucide-react';
import { getPorts, deletePort } from '../api/ports';
import { useAuth } from "../context/AuthContext";
import { websocketService } from '../services/websocket';

const Ports = () => {
  const { user } = useAuth();
  const [ports, setPorts] = useState([]);
  const [filteredPorts, setFilteredPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // UNCTAD Port Trade Stats
  const [portStats, setPortStats] = useState({});
  const [congestionData, setCongestionData] = useState({});
  
  // Port Dashboard Metrics
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalArrivals: 0,
    totalDepartures: 0,
    averageWaitTime: 0,
    congestionLevel: 'Low',
    activeAlerts: 0
  });
  
  // NOAA Safety Data
  const [weatherData, setWeatherData] = useState({});
  const [piracyZones, setPiracyZones] = useState([]);
  const [accidentHistory, setAccidentHistory] = useState([]);
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  
  // UI State
  const [selectedPort, setSelectedPort] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [subscribedPorts, setSubscribedPorts] = useState(new Set());

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Sample ports data with realistic maritime ports
        const samplePorts = [
          { id: 1, name: "Port of Singapore", country: "Singapore", created_at: "2024-01-01" },
          { id: 2, name: "Port of Shanghai", country: "China", created_at: "2024-01-02" },
          { id: 3, name: "Port of Rotterdam", country: "Netherlands", created_at: "2024-01-03" },
          { id: 4, name: "Port of Hamburg", country: "Germany", created_at: "2024-01-04" },
          { id: 5, name: "Port of Los Angeles", country: "USA", created_at: "2024-01-05" },
          { id: 6, name: "Port of Long Beach", country: "USA", created_at: "2024-01-06" },
          { id: 7, name: "Port of Dubai", country: "UAE", created_at: "2024-01-07" },
          { id: 8, name: "Port of Hong Kong", country: "Hong Kong", created_at: "2024-01-08" },
          { id: 9, name: "Port of Antwerp", country: "Belgium", created_at: "2024-01-09" },
          { id: 10, name: "Port of Tianjin", country: "China", created_at: "2024-01-10" },
          { id: 11, name: "Port of Busan", country: "South Korea", created_at: "2024-01-11" },
          { id: 12, name: "Port of Qingdao", country: "China", created_at: "2024-01-12" },
          { id: 13, name: "Port of Guangzhou", country: "China", created_at: "2024-01-13" },
          { id: 14, name: "Port of Ningbo-Zhoushan", country: "China", created_at: "2024-01-14" },
          { id: 15, name: "Port of Mumbai", country: "India", created_at: "2024-01-15" },
          { id: 16, name: "Port of Santos", country: "Brazil", created_at: "2024-01-16" },
          { id: 17, name: "Port of Valencia", country: "Spain", created_at: "2024-01-17" },
          { id: 18, name: "Port of Kaohsiung", country: "Taiwan", created_at: "2024-01-18" }
        ];
        
        setPorts(samplePorts);
        setFilteredPorts(samplePorts);
        
        // Fetch UNCTAD port trade stats for each port
        await fetchUNCTADStats(samplePorts);
        
        // Fetch NOAA safety data
        await fetchNOAAData();
        
        // Calculate dashboard metrics
        calculateDashboardMetrics(samplePorts);
        
      } catch (err) {
        setError('Failed to fetch ports');
        console.error("Failed to fetch ports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPorts();
  }, []);

  // Fetch UNCTAD Port Trade Statistics
  const fetchUNCTADStats = async (portsData) => {
    try {
      const stats = {};
      const congestion = {};
      
      // Realistic UNCTAD data for major ports
      const portDataMap = {
        1: { tradeVolume: 37200000, containerTraffic: 36600000, averageWaitTime: 18, congestionIndex: 85, monthlyGrowth: 2.5 }, // Singapore
        2: { tradeVolume: 43500000, containerTraffic: 43200000, averageWaitTime: 24, congestionIndex: 92, monthlyGrowth: 3.2 }, // Shanghai
        3: { tradeVolume: 14500000, containerTraffic: 14400000, averageWaitTime: 12, congestionIndex: 45, monthlyGrowth: 1.8 }, // Rotterdam
        4: { tradeVolume: 8700000, containerTraffic: 8600000, averageWaitTime: 15, congestionIndex: 52, monthlyGrowth: 1.2 }, // Hamburg
        5: { tradeVolume: 9400000, containerTraffic: 9200000, averageWaitTime: 36, congestionIndex: 78, monthlyGrowth: 2.1 }, // Los Angeles
        6: { tradeVolume: 8000000, containerTraffic: 7800000, averageWaitTime: 42, congestionIndex: 82, monthlyGrowth: 2.8 }, // Long Beach
        7: { tradeVolume: 14000000, containerTraffic: 13500000, averageWaitTime: 8, congestionIndex: 35, monthlyGrowth: 4.5 }, // Dubai
        8: { tradeVolume: 19600000, containerTraffic: 19500000, averageWaitTime: 16, congestionIndex: 58, monthlyGrowth: 1.5 }, // Hong Kong
        9: { tradeVolume: 12000000, containerTraffic: 11800000, averageWaitTime: 10, congestionIndex: 38, monthlyGrowth: 2.2 }, // Antwerp
        10: { tradeVolume: 18300000, containerTraffic: 18000000, averageWaitTime: 20, congestionIndex: 65, monthlyGrowth: 3.8 }, // Tianjin
        11: { tradeVolume: 21700000, containerTraffic: 21400000, averageWaitTime: 14, congestionIndex: 48, monthlyGrowth: 2.6 }, // Busan
        12: { tradeVolume: 18000000, containerTraffic: 17800000, averageWaitTime: 22, congestionIndex: 70, monthlyGrowth: 3.1 }, // Qingdao
        13: { tradeVolume: 23000000, containerTraffic: 22500000, averageWaitTime: 25, congestionIndex: 75, monthlyGrowth: 3.5 }, // Guangzhou
        14: { tradeVolume: 27500000, containerTraffic: 27000000, averageWaitTime: 28, congestionIndex: 88, monthlyGrowth: 4.2 }, // Ningbo-Zhoushan
        15: { tradeVolume: 6000000, containerTraffic: 5800000, averageWaitTime: 32, congestionIndex: 72, monthlyGrowth: 5.1 }, // Mumbai
        16: { tradeVolume: 4400000, containerTraffic: 4200000, averageWaitTime: 18, congestionIndex: 42, monthlyGrowth: 2.9 }, // Santos
        17: { tradeVolume: 5600000, containerTraffic: 5400000, averageWaitTime: 11, congestionIndex: 40, monthlyGrowth: 1.7 }, // Valencia
        18: { tradeVolume: 10000000, containerTraffic: 9800000, averageWaitTime: 13, congestionIndex: 46, monthlyGrowth: 2.3 } // Kaohsiung
      };
      
      for (const port of portsData) {
        const data = portDataMap[port.id] || {
          tradeVolume: Math.floor(Math.random() * 10000000) + 1000000,
          containerTraffic: Math.floor(Math.random() * 5000000) + 500000,
          averageWaitTime: Math.floor(Math.random() * 48) + 6,
          congestionIndex: Math.random() * 100,
          monthlyGrowth: (Math.random() - 0.5) * 10
        };
        
        stats[port.id] = data;
        congestion[port.id] = {
          level: data.congestionIndex > 70 ? 'High' : 
                 data.congestionIndex > 40 ? 'Medium' : 'Low',
          waitTime: data.averageWaitTime,
          trend: data.monthlyGrowth > 0 ? 'increasing' : 'decreasing',
          index: data.congestionIndex.toFixed(1)
        };
      }
      
      setPortStats(stats);
      setCongestionData(congestion);
    } catch (err) {
      console.error('Failed to fetch UNCTAD stats:', err);
    }
  };

  // Fetch NOAA Safety Data
  const fetchNOAAData = async () => {
    try {
      // Realistic NOAA weather and safety data
      const mockWeatherData = {
        storms: [
          { id: 1, name: 'Typhoon Koinu', severity: 'high', lat: 22.3, lng: 114.2, radius: 250, windSpeed: 120 },
          { id: 2, name: 'Hurricane Lee', severity: 'high', lat: 30.5, lng: -75.0, radius: 300, windSpeed: 145 },
          { id: 3, name: 'Cyclone Tej', severity: 'medium', lat: 15.0, lng: 52.0, radius: 180, windSpeed: 85 },
          { id: 4, name: 'Storm Mawar', severity: 'medium', lat: 35.0, lng: -120.0, radius: 150, windSpeed: 65 }
        ],
        windSpeed: 25,
        waveHeight: 3.2,
        visibility: 8,
        temperature: 24,
        humidity: 78,
        pressure: 1013
      };
      
      const mockPiracyZones = [
        { id: 1, name: 'Gulf of Aden', riskLevel: 'high', lat: 12.5, lng: 48.0, radius: 300, incidents: 15 },
        { id: 2, name: 'Strait of Malacca', riskLevel: 'medium', lat: 2.5, lng: 100.0, radius: 200, incidents: 8 },
        { id: 3, name: 'Gulf of Guinea', riskLevel: 'high', lat: 4.0, lng: 8.0, radius: 250, incidents: 22 },
        { id: 4, name: 'Straits of Singapore', riskLevel: 'low', lat: 1.2, lng: 103.8, radius: 100, incidents: 3 }
      ];
      
      const mockAccidentHistory = [
        { id: 1, type: 'collision', date: '2024-01-15', lat: 40.7, lng: -74.0, severity: 'minor', vessels: 2, description: 'Container vessel collision near New York' },
        { id: 2, type: 'grounding', date: '2024-01-10', lat: 34.0, lng: -118.0, severity: 'major', vessels: 1, description: 'Bulk carrier grounding near Los Angeles' },
        { id: 3, type: 'fire', date: '2024-01-08', lat: 25.3, lng: 121.5, severity: 'minor', vessels: 1, description: 'Engine room fire near Taiwan' },
        { id: 4, type: 'collision', date: '2024-01-05', lat: 1.3, lng: 103.8, severity: 'major', vessels: 3, description: 'Multi-vessel collision in Singapore Strait' }
      ];
      
      const mockSafetyAlerts = [
        { id: 1, type: 'weather', message: 'Severe typhoon warning in South China Sea - vessels advised to seek shelter', severity: 'high', affectedPorts: [1, 7, 8, 18] },
        { id: 2, type: 'piracy', message: 'Increased piracy activity reported in Gulf of Aden - recommend armed security', severity: 'high', affectedPorts: [1, 15] },
        { id: 3, type: 'congestion', message: 'Port of Shanghai experiencing severe congestion - expect 48+ hour delays', severity: 'medium', affectedPorts: [2] },
        { id: 4, type: 'weather', message: 'Hurricane approaching US East Coast - port operations may be suspended', severity: 'high', affectedPorts: [5, 6] },
        { id: 5, type: 'safety', message: 'Navigation hazard reported near Singapore Strait - temporary lane closure', severity: 'medium', affectedPorts: [1, 8] }
      ];
      
      setWeatherData(mockWeatherData);
      setPiracyZones(mockPiracyZones);
      setAccidentHistory(mockAccidentHistory);
      setSafetyAlerts(mockSafetyAlerts);
    } catch (err) {
      console.error('Failed to fetch NOAA data:', err);
    }
  };

  // Calculate Dashboard Metrics
  const calculateDashboardMetrics = (portsData) => {
    const totalArrivals = portsData.length * Math.floor(Math.random() * 150 + 100);
    const totalDepartures = portsData.length * Math.floor(Math.random() * 140 + 90);
    
    // Calculate average wait time from congestion data
    let totalWaitTime = 0;
    let waitTimeCount = 0;
    Object.values(congestionData).forEach(data => {
      if (data.waitTime) {
        totalWaitTime += data.waitTime;
        waitTimeCount++;
      }
    });
    const averageWaitTime = waitTimeCount > 0 ? Math.floor(totalWaitTime / waitTimeCount) : 24;
    
    // Determine congestion level based on average wait time
    const congestionLevel = averageWaitTime > 36 ? 'High' : averageWaitTime > 24 ? 'Medium' : 'Low';
    
    // Count active alerts
    const activeAlerts = safetyAlerts.length + Object.values(congestionData).filter(c => c.level === 'High').length;
    
    setDashboardMetrics({
      totalArrivals,
      totalDepartures,
      averageWaitTime,
      congestionLevel,
      activeAlerts
    });
  };

  useEffect(() => {
    let filtered = ports;
    if (searchTerm) {
      filtered = filtered.filter(port =>
        port.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredPorts(filtered);
  }, [searchTerm, ports]);

  const handleAdd = () => {
    console.log("Add port");
  };

  const handleView = (port) => {
    setSelectedPort(port);
    console.log("View port", port.id);
  };

  const handleSubscribe = (portId) => {
    console.log('Subscribe button clicked for port:', portId);
    console.log('Current subscribed ports:', Array.from(subscribedPorts));
    console.log('WebSocket service available:', !!websocketService);
    console.log('Alert callbacks length:', websocketService.alertCallbacks?.length || 0);
    
    const newSubscribedPorts = new Set(subscribedPorts);
    const port = ports.find(p => p.id === portId);
    
    if (!port) {
      console.error('Port not found:', portId);
      return;
    }
    
    console.log('Port found:', port.name);
    
    if (subscribedPorts.has(portId)) {
      console.log('Unsubscribing from port:', port.name);
      newSubscribedPorts.delete(portId);
      // Unsubscribe from WebSocket alerts
      websocketService.off(`port_alert_${portId}`, handlePortAlert);
      
      // Send unsubscribe notification
      const notification = {
        type: 'unsubscription',
        message: `Unsubscribed from alerts for ${port.name}`,
        portId: portId,
        portName: port.name,
        timestamp: new Date().toISOString()
      };
      
      // Send to NotificationManager via WebSocket
      console.log('Sending unsubscribe notification:', notification);
      websocketService.emit('new_notification', notification);
      
      // Also send to alert callbacks for immediate display
      websocketService.alertCallbacks.forEach(callback => {
        callback(notification);
      });
    } else {
      console.log('Subscribing to port:', port.name);
      newSubscribedPorts.add(portId);
      // Subscribe to WebSocket alerts for this port
      websocketService.on(`port_alert_${portId}`, handlePortAlert);
      
      // Send subscription notification
      const notification = {
        type: 'subscription',
        message: `Successfully subscribed to alerts for ${port.name}`,
        portId: portId,
        portName: port.name,
        timestamp: new Date().toISOString()
      };
      
      // Send to NotificationManager via WebSocket
      console.log('Sending subscription notification:', notification);
      websocketService.emit('new_notification', notification);
      
      // Also send to alert callbacks for immediate display
      websocketService.alertCallbacks.forEach(callback => {
        callback(notification);
      });
      
      // Trigger port-specific alerts for this port after a short delay
      setTimeout(() => {
        const portAlerts = safetyAlerts.filter(alert => alert.affectedPorts?.includes(portId));
        console.log('Port alerts for', port.name, ':', portAlerts);
        
        if (portAlerts.length > 0) {
          portAlerts.forEach((alert, index) => {
            setTimeout(() => {
              const alertNotification = {
                type: 'port_alert',
                message: `${alert.type} alert for ${port.name}: ${alert.message}`,
                portId: portId,
                portName: port.name,
                alertType: alert.type,
                severity: alert.severity,
                timestamp: new Date().toISOString()
              };
              
              console.log('Sending port alert notification:', alertNotification);
              websocketService.emit('new_notification', alertNotification);
              
              // Also send to alert callbacks for immediate display
              websocketService.alertCallbacks.forEach(callback => {
                callback(alertNotification);
              });
            }, index * 1000); // Stagger alerts by 1 second
          });
        } else {
          console.log('No alerts found for port:', port.name);
          // Send a test notification to verify the system works
          const testNotification = {
            type: 'test',
            message: `Test notification for ${port.name} - subscription system working!`,
            portId: portId,
            portName: port.name,
            timestamp: new Date().toISOString()
          };
          
          console.log('Sending test notification:', testNotification);
          websocketService.emit('new_notification', testNotification);
          
          // Also send to alert callbacks for immediate display
          websocketService.alertCallbacks.forEach(callback => {
            callback(testNotification);
          });
        }
      }, 500);
    }
    
    setSubscribedPorts(newSubscribedPorts);
    console.log('Updated subscribed ports:', Array.from(newSubscribedPorts));
  };

  const handlePortAlert = (alert) => {
    // Handle incoming port alerts and send to NotificationManager
    console.log('Port alert received:', alert);
    
    // Send the alert to NotificationManager via WebSocket
    websocketService.emit('new_notification', alert);
    
    // Also send to alert callbacks for immediate display
    websocketService.alertCallbacks.forEach(callback => {
      callback(alert);
    });
  };

  const handleEdit = (id) => {
    console.log("Edit port", id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this port?")) {
      try {
        await deletePort(id);
        setPorts(ports.filter((port) => port.id !== id));
        setFilteredPorts(filteredPorts.filter((port) => port.id !== id));
      } catch (err) {
        setError('Failed to delete port');
        console.error("Failed to delete port", err);
      }
    }
  };

  const canAdd = user?.role === "Admin";
  const canEdit = user?.role === "Admin" || user?.role === "Analyst";
  const canDelete = user?.role === "Admin";

  return (
    <div style={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', 
              padding: '12px', 
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
            }}>
              <Anchor style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#1f2937',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                Ports Management
              </h1>
              <p style={{ 
                color: '#64748b', 
                fontSize: '16px',
                margin: '4px 0 0 0' 
              }}>
                Monitor maritime ports with real-time congestion analysis and safety alerts
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
            }}
          >
            <Activity style={{ width: '16px', height: '16px' }} />
            {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
          </button>
        </div>
      </div>

      {/* Safety Alerts */}
      {safetyAlerts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Active Safety Alerts
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {safetyAlerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: alert.severity === 'high' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alert.severity === 'high' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                borderRadius: '12px',
                fontSize: '14px',
                color: alert.severity === 'high' ? '#dc2626' : '#f59e0b',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
              }}>
                <AlertTriangle style={{ width: '16px', height: '16px' }} />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Port Dashboard */}
      {showDashboard && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Activity style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Port Dashboard
            </h3>
          </div>
          
          {/* Dashboard Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
                  <TrendingUp style={{ width: '20px', height: '20px', color: '#10b981' }} />
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Total Arrivals</p>
                  <p style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {dashboardMetrics.totalArrivals}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
                  <TrendingDown style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Total Departures</p>
                  <p style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {dashboardMetrics.totalDepartures}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Avg Wait Time</p>
                  <p style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    {dashboardMetrics.averageWaitTime}h
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  background: dashboardMetrics.congestionLevel === 'High' ? 'rgba(220, 38, 38, 0.1)' : 
                                 dashboardMetrics.congestionLevel === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                  padding: '8px', 
                  borderRadius: '8px' 
                }}>
                  <Activity style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: dashboardMetrics.congestionLevel === 'High' ? '#dc2626' : 
                           dashboardMetrics.congestionLevel === 'Medium' ? '#f59e0b' : '#10b981' 
                  }} />
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Congestion Level</p>
                  <p style={{ 
                    color: dashboardMetrics.congestionLevel === 'High' ? '#dc2626' : 
                           dashboardMetrics.congestionLevel === 'Medium' ? '#f59e0b' : '#10b981', 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    margin: 0 
                  }}>
                    {dashboardMetrics.congestionLevel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather and Safety Overview */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '14px' }}>Weather Conditions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wind style={{ width: '16px', height: '16px', color: '#64748b' }} />
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Wind Speed:</span>
                  <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                    {weatherData.windSpeed || 0} knots
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Waves style={{ width: '16px', height: '16px', color: '#64748b' }} />
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Wave Height:</span>
                  <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                    {weatherData.waveHeight || 0}m
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield style={{ width: '16px', height: '16px', color: '#64748b' }} />
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Visibility:</span>
                  <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                    {weatherData.visibility || 0} nm
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '14px' }}>Active Storms</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weatherData.storms?.map(storm => (
                  <div key={storm.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: storm.severity === 'high' ? '#fef2f2' : '#fffbeb',
                    borderRadius: '6px',
                    border: `1px solid ${storm.severity === 'high' ? '#dc2626' : '#f59e0b'}`
                  }}>
                    <AlertTriangle style={{ 
                      width: '16px', 
                      height: '16px', 
                      color: storm.severity === 'high' ? '#dc2626' : '#f59e0b' 
                    }} />
                    <span style={{ color: '#1f2937', fontSize: '14px' }}>{storm.name}</span>
                    <span style={{ 
                      color: storm.severity === 'high' ? '#dc2626' : '#f59e0b', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {storm.severity.toUpperCase()}
                    </span>
                  </div>
                )) || <span style={{ color: '#64748b', fontSize: '14px' }}>No active storms</span>}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '14px' }}>Piracy Zones</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {piracyZones.map(zone => (
                  <div key={zone.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: zone.riskLevel === 'high' ? '#fef2f2' : '#fffbeb',
                    borderRadius: '6px',
                    border: `1px solid ${zone.riskLevel === 'high' ? '#dc2626' : '#f59e0b'}`
                  }}>
                    <MapPin style={{ 
                      width: '16px', 
                      height: '16px', 
                      color: zone.riskLevel === 'high' ? '#dc2626' : '#f59e0b' 
                    }} />
                    <span style={{ color: '#1f2937', fontSize: '14px' }}>{zone.name}</span>
                    <span style={{ 
                      color: zone.riskLevel === 'high' ? '#dc2626' : '#f59e0b', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {zone.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            width: '20px',
            height: '20px'
          }} />
          <input
            type="text"
            placeholder="Search ports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              backgroundColor: '#f8fafc',
              color: '#1f2937',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
        Showing {filteredPorts.length} of {ports.length} ports
      </div>

      {/* Simple Port List */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: 'center', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Loading ports...</span>
            </div>
          </div>
        ) : (
          <div>
            {filteredPorts.length > 0 ? (
              filteredPorts.map((port) => (
                <div
                  key={port.id}
                  onClick={() => handleView(port)}
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      padding: '12px', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)'
                    }}>
                      <Anchor style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                    </div>
                    <div>
                      <h3 style={{ 
                        color: '#1f2937', 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        margin: '0 0 6px 0' 
                      }}>
                        {port.name}
                      </h3>
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '14px', 
                        margin: 0 
                      }}>
                        {port.country}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Congestion Indicator */}
                    {congestionData[port.id] && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${congestionData[port.id].level === 'High' ? 'rgba(220, 38, 38, 0.3)' : 
                                         congestionData[port.id].level === 'Medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: congestionData[port.id].level === 'High' ? '#dc2626' : 
                                         congestionData[port.id].level === 'Medium' ? '#f59e0b' : '#10b981',
                          boxShadow: `0 0 8px ${congestionData[port.id].level === 'High' ? 'rgba(220, 38, 38, 0.4)' : 
                                           congestionData[port.id].level === 'Medium' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                        }} />
                        <span style={{ 
                          color: '#1f2937',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          {congestionData[port.id].level}
                        </span>
                      </div>
                    )}
                    
                    {/* Safety Alert Indicator */}
                    {safetyAlerts.filter(alert => alert.affectedPorts?.includes(port.id)).length > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: 'rgba(220, 38, 38, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(220, 38, 38, 0.3)'
                      }}>
                        <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                        <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
                          Alert
                        </span>
                      </div>
                    )}
                    
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '8px',
                      borderRadius: '8px'
                    }}>
                      <Eye style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#64748b",
                fontSize: '16px'
              }}>
                {searchTerm ? 'No ports found matching your search' : 'No ports available'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Port Detail Modal */}
      {selectedPort && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '32px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '24px 24px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  padding: '14px', 
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  <Anchor style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ 
                    color: '#1f2937', 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    margin: 0 
                  }}>
                    {selectedPort.name}
                  </h2>
                  <p style={{ 
                    color: '#64748b', 
                    fontSize: '16px', 
                    margin: '4px 0 0 0' 
                  }}>
                    {selectedPort.country}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleSubscribe(selectedPort.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: subscribedPorts.has(selectedPort.id) 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: subscribedPorts.has(selectedPort.id) 
                      ? '0 8px 32px rgba(16, 185, 129, 0.3)' 
                      : '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = subscribedPorts.has(selectedPort.id) 
                      ? '0 12px 40px rgba(16, 185, 129, 0.4)' 
                      : '0 12px 40px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = subscribedPorts.has(selectedPort.id) 
                      ? '0 8px 32px rgba(16, 185, 129, 0.3)' 
                      : '0 8px 32px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {subscribedPorts.has(selectedPort.id) ? (
                    <Bell style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <BellOff style={{ width: '16px', height: '16px' }} />
                  )}
                  {subscribedPorts.has(selectedPort.id) ? 'Subscribed' : 'Subscribe'}
                </button>
                
                <button
                  onClick={() => setSelectedPort(null)}
                  style={{
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.1)',
                    color: '#64748b',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.color = '#1f2937';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Port Statistics */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>Port Statistics</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px' 
                }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <BarChart3 style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>Trade Volume</span>
                    </div>
                    <p style={{ color: '#1f2937', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                      {portStats[selectedPort.id]?.tradeVolume ? 
                        `${(portStats[selectedPort.id].tradeVolume / 1000000).toFixed(1)}M tons` : 
                        "N/A"
                      }
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Ship style={{ width: '16px', height: '16px', color: '#10b981' }} />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>Container Traffic</span>
                    </div>
                    <p style={{ color: '#1f2937', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                      {portStats[selectedPort.id]?.containerTraffic ? 
                        `${(portStats[selectedPort.id].containerTraffic / 1000000).toFixed(1)}M TEU` : 
                        "N/A"
                      }
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                      <span style={{ color: '#64748b', fontSize: '12px' }}>Monthly Growth</span>
                    </div>
                    <p style={{ color: '#1f2937', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                      {portStats[selectedPort.id]?.monthlyGrowth ? 
                        `${portStats[selectedPort.id].monthlyGrowth.toFixed(1)}%` : 
                        "N/A"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Congestion Analysis */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>Congestion Analysis</h3>
                {congestionData[selectedPort.id] && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: congestionData[selectedPort.id].level === 'High' ? '#fef2f2' : 
                                         congestionData[selectedPort.id].level === 'Medium' ? '#fffbeb' : '#f0fdf4',
                        border: `2px solid ${congestionData[selectedPort.id].level === 'High' ? '#dc2626' : 
                                         congestionData[selectedPort.id].level === 'Medium' ? '#f59e0b' : '#10b981'}`
                      }}>
                        <Activity style={{ 
                          width: '20px', 
                          height: '20px', 
                          color: congestionData[selectedPort.id].level === 'High' ? '#dc2626' : 
                                 congestionData[selectedPort.id].level === 'Medium' ? '#f59e0b' : '#10b981' 
                        }} />
                        <span style={{ 
                          color: congestionData[selectedPort.id].level === 'High' ? '#dc2626' : 
                                 congestionData[selectedPort.id].level === 'Medium' ? '#f59e0b' : '#10b981',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {congestionData[selectedPort.id].level} Congestion
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {congestionData[selectedPort.id].trend === 'increasing' ? (
                          <TrendingUp style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                        ) : (
                          <TrendingDown style={{ width: '20px', height: '20px', color: '#10b981' }} />
                        )}
                        <span style={{ color: '#64748b', fontSize: '14px' }}>
                          {congestionData[selectedPort.id].trend === 'increasing' ? 'Worsening' : 'Improving'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div>
                        <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Average Wait Time</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock style={{ width: '16px', height: '16px', color: '#64748b' }} />
                          <span style={{ 
                            color: congestionData[selectedPort.id].waitTime > 36 ? '#dc2626' : 
                                   congestionData[selectedPort.id].waitTime > 24 ? '#f59e0b' : '#10b981',
                            fontSize: '20px',
                            fontWeight: 'bold'
                          }}>
                            {congestionData[selectedPort.id].waitTime}h
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Congestion Index</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BarChart3 style={{ width: '16px', height: '16px', color: '#64748b' }} />
                          <span style={{ color: '#1f2937', fontSize: '20px', fontWeight: 'bold' }}>
                            {congestionData[selectedPort.id].index}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Weather & Safety Alerts */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '16px' }}>Weather & Safety Alerts</h3>
                
                {/* Weather Conditions */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '14px' }}>Current Weather</h4>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wind style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Wind:</span>
                      <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                        {weatherData.windSpeed || 0} knots
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Waves style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Waves:</span>
                      <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                        {weatherData.waveHeight || 0}m
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Visibility:</span>
                      <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                        {weatherData.visibility || 0} nm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Port-specific Alerts */}
                <div>
                  {safetyAlerts.filter(alert => alert.affectedPorts?.includes(selectedPort.id)).map(alert => (
                    <div key={alert.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: alert.severity === 'high' ? '#fef2f2' : '#fffbeb',
                      borderRadius: '8px',
                      border: `1px solid ${alert.severity === 'high' ? '#dc2626' : '#f59e0b'}`,
                      marginBottom: '8px'
                    }}>
                      <AlertTriangle style={{ 
                        width: '20px', 
                        height: '20px', 
                        color: alert.severity === 'high' ? '#dc2626' : '#f59e0b' 
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ 
                            color: alert.severity === 'high' ? '#dc2626' : '#f59e0b', 
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {alert.type} Alert
                          </span>
                          <span style={{ 
                            color: alert.severity === 'high' ? '#dc2626' : '#f59e0b', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {alert.severity}
                          </span>
                        </div>
                        <p style={{ color: '#1f2937', fontSize: '14px', margin: 0 }}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {safetyAlerts.filter(alert => alert.affectedPorts?.includes(selectedPort.id)).length === 0 && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #10b981',
                      textAlign: 'center'
                    }}>
                      <Shield style={{ width: '24px', height: '24px', color: '#10b981', margin: '0 auto 8px' }} />
                      <p style={{ color: '#10b981', fontSize: '14px', margin: 0 }}>
                        No active alerts for this port
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ports;