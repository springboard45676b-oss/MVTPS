/**
 * Mock WebSocket Service for Testing Notifications
 * 
 * Use this temporarily while fixing your real WebSocket backend
 * 
 * To use: Import this instead of your real websocket service:
 * import { websocketService } from '../services/mockWebSocket';
 */

class MockWebSocketService {
  constructor() {
    this.alertCallbacks = [];
    this.positionCallbacks = [];
    this.connected = true;
    
    console.log('🧪 Mock WebSocket Service initialized');
    console.log('📡 Simulating real-time alerts every 15 seconds...');
    
    // Simulate alerts every 15 seconds
    this.alertInterval = setInterval(() => this.simulateAlert(), 15000);
    
    // Simulate first alert after 3 seconds
    setTimeout(() => this.simulateAlert(), 3000);
  }
  
  simulateAlert() {
    const alertTypes = ['speed', 'port', 'status'];
    const vessels = [
      { name: 'MV Ocean Navigator', mmsi: '123456789' },
      { name: 'MV Pacific Explorer', mmsi: '987654321' },
      { name: 'SS Maritime Star', mmsi: '555666777' }
    ];
    
    const messages = {
      speed: [
        'Speed exceeded maximum threshold of 15 knots',
        'Unusual speed pattern detected',
        'Speed dropped below minimum threshold'
      ],
      port: [
        'Vessel has entered port zone',
        'Approaching designated berth',
        'Departure from port initiated'
      ],
      status: [
        'Navigation status changed',
        'AIS signal strength degraded',
        'Course deviation detected'
      ]
    };
    
    const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const randomVessel = vessels[Math.floor(Math.random() * vessels.length)];
    const randomMessage = messages[randomType][Math.floor(Math.random() * messages[randomType].length)];
    
    const mockAlert = {
      id: Date.now(),
      vessel: randomVessel,
      vessel_name: randomVessel.name,
      vessel_mmsi: randomVessel.mmsi,
      alert_type: randomType,
      message: randomMessage,
      created_at: new Date().toISOString()
    };
    
    console.log('🔔 Mock Alert Simulated:', mockAlert);
    
    // Trigger all subscribed callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(mockAlert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }
  
  simulatePositionUpdate() {
    const vessels = [
      { id: 1, name: 'MV Ocean Navigator', mmsi: '123456789' },
      { id: 2, name: 'MV Pacific Explorer', mmsi: '987654321' }
    ];
    
    const randomVessel = vessels[Math.floor(Math.random() * vessels.length)];
    const position = {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      speed: Math.random() * 20,
      course: Math.random() * 360,
      timestamp: new Date().toISOString()
    };
    
    console.log('📍 Mock Position Update:', randomVessel.name, position);
    
    this.positionCallbacks.forEach(callback => {
      try {
        callback(randomVessel, position);
      } catch (error) {
        console.error('Error in position callback:', error);
      }
    });
  }
  
  /**
   * Subscribe to alert notifications
   * @param {Function} callback - Function to call when alert is received
   * @returns {Function} Unsubscribe function
   */
  onAlert(callback) {
    console.log('📡 New alert subscription added');
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      console.log('📡 Alert subscription removed');
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to position updates
   * @param {Function} callback - Function to call when position is updated
   * @returns {Function} Unsubscribe function
   */
  onPositionUpdate(callback) {
    console.log('📍 New position subscription added');
    this.positionCallbacks.push(callback);
    
    return () => {
      console.log('📍 Position subscription removed');
      this.positionCallbacks = this.positionCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Check if WebSocket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected;
  }
  
  /**
   * Manually trigger an alert (for testing)
   */
  triggerTestAlert() {
    this.simulateAlert();
  }
  
  /**
   * Clean up intervals when service is destroyed
   */
  destroy() {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }
    console.log('🧪 Mock WebSocket Service destroyed');
  }
}

// Create singleton instance
export const websocketService = new MockWebSocketService();

// For debugging in browser console
if (typeof window !== 'undefined') {
  window.mockWebSocketService = websocketService;
  console.log('💡 Tip: Use window.mockWebSocketService.triggerTestAlert() to manually trigger an alert');
}

export default websocketService;