// services/websocket.js

class WebSocketService {
  constructor() {
    this.alertWs = null;
    this.positionWs = null;
    this.alertCallbacks = [];
    this.positionCallbacks = [];
    this.filteredVesselsCallbacks = [];
    this.reconnectInterval = 5000; // 5 seconds
    this.reconnectTimeouts = {
      alerts: null,
      positions: null
    };
    this.subscribedVessels = new Set();
  }

  // Connect to alerts WebSocket
  connectAlerts(token) {
    if (!token) {
      console.warn('No token provided for alerts WebSocket');
      return;
    }

    if (this.alertWs && this.alertWs.readyState === WebSocket.OPEN) {
      console.log('Alert WebSocket already connected');
      return;
    }

    try {
      // WebSocket URL for vessel alerts
      const wsUrl = `ws://localhost:8000/ws/vessels/alerts/?token=${encodeURIComponent(token)}`;
      console.log('Connecting to alerts WebSocket...');
      
      this.alertWs = new WebSocket(wsUrl);

      this.alertWs.onopen = () => {
        console.log('Alert WebSocket connected');
        // Clear any reconnect timeout
        if (this.reconnectTimeouts.alerts) {
          clearTimeout(this.reconnectTimeouts.alerts);
          this.reconnectTimeouts.alerts = null;
        }
      };

      this.alertWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Alert message received:', data);
          
          // Notify all subscribers
          this.alertCallbacks.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error('Error in alert callback:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing alert message:', error);
        }
      };

      this.alertWs.onerror = (error) => {
        console.error('Alert WebSocket error:', error);
      };

      this.alertWs.onclose = () => {
        console.log('Alert WebSocket closed');
        // Attempt to reconnect after delay
        this.reconnectTimeouts.alerts = setTimeout(() => {
          console.log('Attempting to reconnect alerts WebSocket...');
          this.connectAlerts(token);
        }, this.reconnectInterval);
      };
    } catch (error) {
      console.error('Error creating alert WebSocket:', error);
    }
  }

  // Connect to positions WebSocket
  connectPositions(token) {
    if (this.positionWs && this.positionWs.readyState === WebSocket.OPEN) {
      console.log('Position WebSocket already connected');
      return;
    }

    try {
      // WebSocket URL for vessel positions
      const wsUrl = `ws://localhost:8000/ws/vessels/positions/?token=${token}`;
      console.log('Connecting to positions WebSocket:', wsUrl);
      
      this.positionWs = new WebSocket(wsUrl);

      this.positionWs.onopen = () => {
        console.log('Position WebSocket connected');
        // Clear any reconnect timeout
        if (this.reconnectTimeouts.positions) {
          clearTimeout(this.reconnectTimeouts.positions);
          this.reconnectTimeouts.positions = null;
        }
        
        // Resubscribe to vessels if any
        if (this.subscribedVessels.size > 0) {
          this.subscribedVessels.forEach(vesselId => {
            this.sendPositionMessage({
              type: 'subscribe',
              vessel_id: vesselId
            });
          });
        }
      };

      this.positionWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Position message received:', data);
          
          // Handle different message types
          if (data.type === 'position_update') {
            // Notify position update subscribers
            this.positionCallbacks.forEach(callback => {
              try {
                callback(data.vessel, data.position);
              } catch (error) {
                console.error('Error in position callback:', error);
              }
            });
          } else if (data.type === 'filtered_vessels') {
            // Notify filtered vessels subscribers
            this.filteredVesselsCallbacks.forEach(callback => {
              try {
                callback(data.vessels);
              } catch (error) {
                console.error('Error in filtered vessels callback:', error);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing position message:', error);
        }
      };

      this.positionWs.onerror = (error) => {
        console.error('Position WebSocket error:', error);
      };

      this.positionWs.onclose = () => {
        console.log('Position WebSocket closed');
        // Attempt to reconnect after delay
        this.reconnectTimeouts.positions = setTimeout(() => {
          console.log('Attempting to reconnect positions WebSocket...');
          this.connectPositions(token);
        }, this.reconnectInterval);
      };
    } catch (error) {
      console.error('Error creating position WebSocket:', error);
    }
  }

  // Check if connected
  isConnected() {
    const alertConnected = this.alertWs && this.alertWs.readyState === WebSocket.OPEN;
    const positionConnected = this.positionWs && this.positionWs.readyState === WebSocket.OPEN;
    return alertConnected || positionConnected;
  }

  // Get detailed connection status
  getConnectionStatus() {
    return {
      alerts: this.alertWs ? this.alertWs.readyState : WebSocket.CLOSED,
      positions: this.positionWs ? this.positionWs.readyState : WebSocket.CLOSED,
      alertConnected: this.alertWs && this.alertWs.readyState === WebSocket.OPEN,
      positionConnected: this.positionWs && this.positionWs.readyState === WebSocket.OPEN,
    };
  }

  // Disconnect all WebSockets
  disconnect() {
    console.log('Disconnecting all WebSockets');
    
    // Clear reconnect timeouts
    if (this.reconnectTimeouts.alerts) {
      clearTimeout(this.reconnectTimeouts.alerts);
      this.reconnectTimeouts.alerts = null;
    }
    if (this.reconnectTimeouts.positions) {
      clearTimeout(this.reconnectTimeouts.positions);
      this.reconnectTimeouts.positions = null;
    }

    // Close alert WebSocket
    if (this.alertWs) {
      this.alertWs.onclose = null; // Prevent reconnect
      this.alertWs.close();
      this.alertWs = null;
    }

    // Close position WebSocket
    if (this.positionWs) {
      this.positionWs.onclose = null; // Prevent reconnect
      this.positionWs.close();
      this.positionWs = null;
    }

    // Clear subscriptions
    this.subscribedVessels.clear();
  }

  // Subscribe to alerts
  onAlert(callback) {
    if (typeof callback !== 'function') {
      console.error('onAlert: callback must be a function');
      return () => {};
    }
    
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to position updates
  onPositionUpdate(callback) {
    if (typeof callback !== 'function') {
      console.error('onPositionUpdate: callback must be a function');
      return () => {};
    }
    
    this.positionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.positionCallbacks.indexOf(callback);
      if (index > -1) {
        this.positionCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to filtered vessels updates
  onFilteredVesselsUpdate(callback) {
    if (typeof callback !== 'function') {
      console.error('onFilteredVesselsUpdate: callback must be a function');
      return () => {};
    }
    
    this.filteredVesselsCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.filteredVesselsCallbacks.indexOf(callback);
      if (index > -1) {
        this.filteredVesselsCallbacks.splice(index, 1);
      }
    };
  }

  // Send message to alert WebSocket
  sendAlertMessage(message) {
    if (!this.alertWs || this.alertWs.readyState !== WebSocket.OPEN) {
      console.error('Alert WebSocket is not connected');
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.alertWs.send(messageStr);
      console.log('Alert message sent:', messageStr);
      return true;
    } catch (error) {
      console.error('Error sending alert message:', error);
      return false;
    }
  }

  // Send message to position WebSocket
  sendPositionMessage(message) {
    if (!this.positionWs || this.positionWs.readyState !== WebSocket.OPEN) {
      console.error('Position WebSocket is not connected');
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.positionWs.send(messageStr);
      console.log('Position message sent:', messageStr);
      return true;
    } catch (error) {
      console.error('Error sending position message:', error);
      return false;
    }
  }

  // Subscribe to specific vessel
  subscribeToVessel(vesselId) {
    if (!vesselId) {
      console.error('subscribeToVessel: vesselId is required');
      return;
    }

    this.subscribedVessels.add(vesselId);
    
    this.sendPositionMessage({
      type: 'subscribe',
      vessel_id: vesselId
    });
    
    console.log(`Subscribed to vessel: ${vesselId}`);
  }

  // Unsubscribe from specific vessel
  unsubscribeFromVessel(vesselId) {
    if (!vesselId) {
      console.error('unsubscribeFromVessel: vesselId is required');
      return;
    }

    this.subscribedVessels.delete(vesselId);
    
    this.sendPositionMessage({
      type: 'unsubscribe',
      vessel_id: vesselId
    });
    
    console.log(`Unsubscribed from vessel: ${vesselId}`);
  }
}

// Create and export a single instance
export const websocketService = new WebSocketService();