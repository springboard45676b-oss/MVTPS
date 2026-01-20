# Real Ship Data Integration Guide

This guide explains how to use real ship data from aisstream.io in your maritime platform.

## Overview

The platform now integrates with aisstream.io to provide real-time AIS (Automatic Identification System) data from ships worldwide. Your API key `2a5ac681425e75cc5c836947b8132212171ba4bfit` has been configured and is ready to use.

## Features

- **Real-time streaming**: Live AIS data via WebSocket connection
- **Global coverage**: Ships worldwide (can be filtered by geographic bounds)
- **Automatic database updates**: Ship positions and static data are automatically saved
- **Fallback system**: Falls back to demo data if streaming is unavailable
- **API endpoints**: Control streaming via REST API

## Quick Start

### 1. Start AIS Streaming

**Option A: Using Management Command**
```bash
cd backend
python manage.py start_ais_stream
```

**Option B: Using API Endpoint**
```bash
curl -X POST http://localhost:8000/api/vessels/ais-start/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Option C: Geographic Bounds (e.g., around New York)**
```bash
curl -X POST http://localhost:8000/api/vessels/ais-start/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minlat": 40.0,
    "minlon": -75.0,
    "maxlat": 41.0,
    "maxlon": -73.0
  }'
```

### 2. Check Streaming Status

```bash
curl -X GET http://localhost:8000/api/vessels/ais-status/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Live Vessel Data

```bash
curl -X GET http://localhost:8000/api/vessels/live/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Stop Streaming

```bash
curl -X POST http://localhost:8000/api/vessels/ais-stop/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vessels/ais-status/` | GET | Get streaming status |
| `/api/vessels/ais-start/` | POST | Start AIS streaming |
| `/api/vessels/ais-stop/` | POST | Stop AIS streaming |
| `/api/vessels/live/` | GET | Get current live vessel data |
| `/api/vessels/update-live/` | POST | Update vessel positions in database |

## Data Types

The system processes two main types of AIS messages:

### Position Reports
- Ship location (latitude/longitude)
- Speed over ground (SOG)
- Course over ground (COG)
- Heading
- Navigation status

### Ship Static Data
- Vessel name
- Call sign
- IMO number
- Vessel type
- Dimensions
- Destination

## Configuration

The AIS Stream API key is configured in your `.env` file:

```env
AISSTREAM_API_KEY=2a5ac681425e75cc5c836947b8132212171ba4bfit
```

## Geographic Filtering

You can filter data by geographic bounds:

```json
{
  "minlat": 25.0,  // Minimum latitude
  "minlon": -80.0, // Minimum longitude  
  "maxlat": 45.0,  // Maximum latitude
  "maxlon": -60.0  // Maximum longitude
}
```

## Common Use Cases

### 1. Port Monitoring
Monitor ships around a specific port:

```python
# Around Port of Los Angeles
bounds = {
    'minlat': 33.6,
    'minlon': -118.4,
    'maxlat': 33.8,
    'maxlon': -118.1
}
```

### 2. Global Shipping Lanes
Monitor major shipping routes:

```python
# Suez Canal area
bounds = {
    'minlat': 29.5,
    'minlon': 32.0,
    'maxlat': 31.0,
    'maxlon': 33.0
}
```

### 3. Real-time Dashboard
Display live ship movements on your dashboard by calling the live vessels endpoint regularly.

## Performance Notes

- **Batch Processing**: The system processes vessels in batches of 100 or every 30 seconds
- **Database Optimization**: Only the latest position for each vessel is kept for real-time display
- **Memory Management**: Vessel data is cached temporarily before database insertion
- **Connection Management**: WebSocket connection is automatically managed with reconnection logic

## Troubleshooting

### Connection Issues
1. Check your API key is valid
2. Ensure internet connection is stable
3. Check firewall settings for WebSocket connections

### No Data Received
1. Verify geographic bounds are correct
2. Check if there are ships in your selected area
3. Try global coverage first (no bounds)

### High Memory Usage
1. Use geographic bounds to limit data volume
2. Monitor the number of cached vessels
3. Consider restarting the streaming service periodically

## Integration with Frontend

The frontend can use these endpoints to:

1. **Display streaming status** in the UI
2. **Show live vessel positions** on maps
3. **Control streaming** with start/stop buttons
4. **Filter by geographic areas** with map selection

Example JavaScript:

```javascript
// Start streaming
const startStreaming = async () => {
  const response = await fetch('/api/vessels/ais-start/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get live vessels
const getLiveVessels = async () => {
  const response = await fetch('/api/vessels/live/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Next Steps

1. **Test the integration** with the provided test script
2. **Start streaming** to see real ship data
3. **Monitor performance** and adjust geographic bounds as needed
4. **Integrate with your frontend** for real-time displays
5. **Set up monitoring** for the streaming service

Your maritime platform is now ready to display real ship movements from around the world!