class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.subscribers = new Map();
  }

  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/vessels/';
    
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifySubscribers('connection', { status: 'connected' });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.notifySubscribers('connection', { status: 'disconnected' });
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connect(token);
          }, this.reconnectInterval);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifySubscribers('error', { error });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.subscribers.clear();
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  notifySubscribers(eventType, data) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket subscriber callback:', error);
        }
      });
    }
  }

  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'vessel_update':
        this.notifySubscribers('vessel_update', payload);
        break;
      case 'vessel_destination_reached':
        this.notifySubscribers('destination_reached', payload);
        break;
      case 'vessel_route_update':
        this.notifySubscribers('route_update', payload);
        break;
      case 'notification':
        this.notifySubscribers('notification', payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Subscribe to specific vessel updates
  subscribeToVessel(mmsi) {
    this.send({
      type: 'subscribe_vessel',
      mmsi: mmsi
    });
  }

  // Unsubscribe from specific vessel updates
  unsubscribeFromVessel(mmsi) {
    this.send({
      type: 'unsubscribe_vessel',
      mmsi: mmsi
    });
  }
}

export default new WebSocketService();