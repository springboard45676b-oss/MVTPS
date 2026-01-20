# 🛣️ Voyage Tracking Guide

This guide shows you all the ways to view and track vessel voyages in your maritime platform.

## 📋 Quick Overview

Your platform now has comprehensive voyage tracking that shows:
- **Vessel positions** over time
- **Voyage routes** from port to port  
- **Interactive maps** with vessel tracks
- **Voyage statistics** (distance, duration, speed)
- **Real-time tracking** of active voyages

## 🖥️ Command Line Tools

### 1. List All Vessels
```bash
python view_voyage_track.py --list
```
Shows all vessels with voyage and position counts.

### 2. View Vessel Voyages
```bash
python view_voyage_track.py --vessel "Wonder of the Seas" --voyages
```
Shows complete voyage history for a specific vessel.

### 3. View Position Track
```bash
python view_voyage_track.py --vessel "Wonder of the Seas" --track
```
Shows detailed position history with timestamps and speeds.

### 4. Export Track to CSV
```bash
python view_voyage_track.py --vessel "Wonder of the Seas" --export
```
Exports all position data to a CSV file for analysis.

### 5. Create Interactive Map
```bash
python view_voyage_track.py --vessel "Wonder of the Seas" --map
```
Creates an HTML map file you can open in your browser.

## 🌐 API Endpoints

### Get Vessel List
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/
```

### Get Vessel Track
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/1/track/?limit=100
```

### Get Voyage List
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/voyages/
```

### Get Voyage Track
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/vessels/voyages/1/track/
```

## 🗺️ Web Interface

### Simple Voyage Viewer
Open `voyage_viewer.html` in your browser for an interactive interface that shows:
- List of all vessels
- Click to select a vessel
- Interactive map with voyage tracks
- Vessel information panel

### Integration with Your Frontend
Add these features to your React frontend:

```javascript
// Get vessel track
const getVesselTrack = async (vesselId) => {
  const response = await fetch(`/api/vessels/${vesselId}/track/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Display track on map
const displayTrack = (trackData) => {
  const positions = trackData.track.map(pos => [pos.latitude, pos.longitude]);
  const polyline = L.polyline(positions, {color: 'blue'}).addTo(map);
  map.fitBounds(polyline.getBounds());
};
```

## 📊 Example Usage

### Track the Wonder of the Seas
```bash
# View voyage history
python view_voyage_track.py --vessel "Wonder of the Seas" --voyages

# Output:
# 🚢 Voyage History for: Wonder of the Seas
# 📋 MMSI: 248663000
# ============================================================
# 
# ✅ Voyage #1 (COMPLETED)
#    🏁 Start: Open Sea (2025-12-24 23:35:44+00:00)
#    📍 Start Position: 40.6401, 14.2574
#    🏁 End: Open Sea (2026-01-02 11:52:09+00:00)
#    📍 End Position: 43.7328, 7.4230
#    📏 Distance: 660.5 km
#    ⏱️  Duration: 8d 12h
#    🏃 Average Speed: 1.7 knots
```

### View Position Details
```bash
python view_voyage_track.py --vessel "Wonder of the Seas" --track

# Shows detailed position history with:
# - Exact coordinates
# - Speed and course
# - Navigation status
# - Timestamps
```

### Export for Analysis
```bash
python view_voyage_track.py --vessel "Wonder of the Seas" --export

# Creates: Wonder_of_the_Seas_track.csv
# Contains: timestamp, lat, lon, speed, course, status
```

## 🎯 Real-World Examples

### Container Ship Route
```bash
python view_voyage_track.py --vessel "CMA CGM" --voyages
```
Shows typical container ship routes between major ports.

### Cruise Ship Movement
```bash
python view_voyage_track.py --vessel "Wonder" --track
```
Shows cruise ship movements between Mediterranean ports.

### Tanker Operations
```bash
python view_voyage_track.py --vessel "Front Altair" --voyages
```
Shows tanker loading/unloading operations.

## 📈 Voyage Analytics

### Get Statistics
```bash
python manage_real_data.py --voyage-stats

# Shows:
# 🛣️  Total voyages: 10
# 🟢 Active voyages: 0
# ✅ Completed voyages: 10
# 📏 Total distance: 53,826.5 km
# ⏱️  Total duration: 2,042.7 hours
```

### Process New Voyages
```bash
python manage_real_data.py --process-voyages
```
Analyzes position data to create new voyage records.

## 🔧 Advanced Features

### Filter by Vessel Type
```python
# In your API calls
GET /api/vessels/?vessel_type=container
GET /api/vessels/voyages/?vessel__vessel_type=tanker
```

### Time Range Filtering
```python
# Get positions from last 24 hours
GET /api/vessels/1/positions/?timestamp__gte=2026-01-01T00:00:00Z
```

### Geographic Bounds
```python
# Get vessels in specific area
GET /api/vessels/live/?minlat=40&maxlat=50&minlon=0&maxlon=10
```

## 🗺️ Map Integration

### Leaflet.js Example
```javascript
// Initialize map
const map = L.map('map').setView([40.0, 0.0], 2);

// Add vessel track
const track = L.polyline(positions, {color: 'blue'}).addTo(map);

// Add vessel marker
L.marker([lat, lon])
  .addTo(map)
  .bindPopup(`<b>${vesselName}</b><br>Speed: ${speed} knots`);
```

### Google Maps Integration
```javascript
// Create polyline
const track = new google.maps.Polyline({
  path: positions,
  geodesic: true,
  strokeColor: '#0000FF',
  strokeWeight: 3
});

track.setMap(map);
```

## 📱 Mobile-Friendly Features

### Responsive Design
The voyage viewer is mobile-responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

### Touch-Friendly Controls
- Tap to select vessels
- Pinch to zoom maps
- Swipe to navigate

## 🔄 Real-Time Updates

### WebSocket Integration (Future)
```javascript
// Connect to real-time updates
const ws = new WebSocket('ws://localhost:8000/ws/vessels/');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  updateVesselPosition(data.vessel_id, data.position);
};
```

### Auto-Refresh
```javascript
// Update tracks every 30 seconds
setInterval(async () => {
  if (selectedVessel) {
    const track = await getVesselTrack(selectedVessel.id);
    updateTrackDisplay(track);
  }
}, 30000);
```

## 🎉 Summary

You now have multiple ways to view vessel voyage tracks:

1. **Command Line**: `view_voyage_track.py` for detailed analysis
2. **API Endpoints**: RESTful API for integration
3. **Web Interface**: `voyage_viewer.html` for interactive viewing
4. **CSV Export**: For data analysis in Excel/Python
5. **Interactive Maps**: HTML maps with Leaflet.js

Your maritime platform can now show **real vessel movements** with **complete voyage tracking**! 🚢⚓