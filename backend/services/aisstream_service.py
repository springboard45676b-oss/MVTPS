import os
import requests

AIS_API_KEY = os.getenv("AISSTREAM_API_KEY")

# Updated API endpoint - AIS Stream uses WebSocket, not REST API
# Using alternative approach with mock data for testing
def fetch_live_vessels(bbox=None):
    """Async wrapper - triggers Celery task and returns cached data"""
    from django.core.cache import cache
    from tasks.external_api_tasks import fetch_live_vessels_mock_task
    
    # Check cache first
    cache_key = f"mock_vessels_{hash(str(bbox))}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return cached_data
    
    # Trigger async task
    fetch_live_vessels_mock_task.delay(bbox)
    
    # Return fallback data immediately
    return _sync_fallback(bbox)

def _sync_fallback(bbox=None):
    """Generate mock vessel data - SYNC FALLBACK"""
    # AIS Stream API requires WebSocket connection, not HTTP POST
    # For now, return mock data that matches expected format
    
    if not AIS_API_KEY:
        print("AIS API key not found")
    
    # Mock data in expected format with MMSI, lat, lon, timestamp
    mock_data = {
        "vessels": [
            {
                "mmsi": "367001234",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "timestamp": "2024-01-19T16:30:00Z",
                "speed": 12.5,
                "course": 90,
                "vessel_name": "MV Atlantic Explorer"
            },
            {
                "mmsi": "367005678", 
                "latitude": 51.5074,
                "longitude": -0.1278,
                "timestamp": "2024-01-19T16:30:00Z",
                "speed": 8.2,
                "course": 180,
                "vessel_name": "Pacific Dawn"
            }
        ]
    }
    
    return mock_data