# WebSocket Real-Time Alerts Setup Guide

This guide explains how to set up and use the WebSocket-based real-time alerts for vessel tracking.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Redis Server

WebSocket functionality requires Redis for channel layer communication:

**Windows:**
```bash
# Download and install Redis from https://redis.io/download
# Or use WSL:
sudo apt-get install redis-server
redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Start the Django Server with ASGI

```bash
# Instead of runserver, use daphne for WebSocket support
pip install daphne
daphne backend.asgi:application -b 0.0.0.0 -p 8000
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

## How It Works

### WebSocket Connections

The system creates two WebSocket connections:

1. **Alerts WebSocket** (`ws://localhost:8000/ws/vessels/alerts/`)
   - Receives real-time alerts (speed, port, status)
   - Shows toast notifications

2. **Positions WebSocket** (`ws://localhost:8000/ws/vessels/positions/`)
   - Receives vessel position updates
   - Updates map markers in real-time

### Alert Types

1. **Speed Alerts**: Triggered when vessel exceeds configured speed threshold
2. **Port Alerts**: Triggered when vessel moves significantly (entering/exiting port areas)
3. **Status Alerts**: Triggered on vessel status changes

### API Endpoints

#### Vessel Subscriptions
- `GET /api/vessels/subscriptions/` - List user's vessel subscriptions
- `POST /api/vessels/subscriptions/` - Create new vessel subscription
- `PUT /api/vessels/subscriptions/{id}/` - Update subscription
- `DELETE /api/vessels/subscriptions/{id}/` - Delete subscription

#### Vessel Alerts
- `GET /api/vessels/alerts/` - List user's triggered alerts

#### Vessels
- `GET /api/vessels/` - List all vessels with filtering
- `GET /api/vessels/{mmsi}/` - Get vessel details
- `GET /api/vessels/{mmsi}/route/` - Get vessel route history

## Usage Examples

### Create Vessel Subscription

```javascript
// Subscribe to speed and port alerts for a vessel
const subscription = await fetch('/api/vessels/subscriptions/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    vessel_id: 1,
    alert_types: ['speed', 'port'],
    speed_threshold: 15.0,
    is_active: true
  })
});
```

### WebSocket Message Format

#### Alert Message
```json
{
  "type": "vessel_alert",
  "alert": {
    "id": 1,
    "vessel": {
      "id": 1,
      "name": "Ocean Navigator",
      "mmsi": "123456789"
    },
    "alert_type": "speed",
    "message": "Speed alert: Ocean Navigator is traveling at 18.5 knots (threshold: 15.0 knots)",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Position Update Message
```json
{
  "type": "vessel_position_update",
  "vessel": {
    "id": 1,
    "name": "Ocean Navigator",
    "mmsi": "123456789"
  },
  "position": {
    "latitude": 17.385,
    "longitude": 78.486,
    "speed": 18.5,
    "course": 45.0,
    "heading": 50.0,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test vessels.tests
```

### Manual Testing

1. Create a vessel subscription via the API
2. Update vessel position (via API or admin)
3. Check for WebSocket alerts and toast notifications
4. Verify map updates in real-time

## Troubleshooting

### WebSocket Connection Issues

1. **Check Redis is running**: `redis-cli ping`
2. **Verify ASGI server**: Use `daphne` instead of `runserver`
3. **Check authentication**: Ensure JWT token is valid
4. **CORS issues**: Verify CORS settings in Django

### Performance Considerations

- Redis handles WebSocket channel communication efficiently
- Database queries are optimized with proper indexing
- Position updates are throttled to prevent spam
- Alert subscriptions are filtered per user

## Production Deployment

For production deployment:

1. Use Redis Cluster for high availability
2. Configure Daphne with multiple workers
3. Set up proper SSL/TLS certificates
4. Use environment variables for configuration
5. Implement proper monitoring and logging

## Security Notes

- WebSocket connections require JWT authentication
- User-specific channels prevent cross-user data leakage
- All API endpoints require authentication
- Input validation prevents injection attacks
