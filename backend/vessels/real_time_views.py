from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from services.external_apis import AISHubAPI, OpenWeatherAPI
import json

class LiveVesselPositionsView(APIView):
    """Get live vessel positions from AIS Hub API"""
    
    def get(self, request):
        # Get bounds from query parameters
        lat_min = float(request.GET.get('lat_min', 40.0))
        lat_max = float(request.GET.get('lat_max', 60.0))
        lng_min = float(request.GET.get('lng_min', -10.0))
        lng_max = float(request.GET.get('lng_max', 10.0))
        
        # Check cache first
        cache_key = f"vessels_{lat_min}_{lat_max}_{lng_min}_{lng_max}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Fetch from AIS Hub API
        ais_api = AISHubAPI()
        vessels = ais_api.get_vessels_in_area(lat_min, lat_max, lng_min, lng_max)
        
        # Cache for 2 minutes
        cache.set(cache_key, vessels, 120)
        
        return Response(vessels)

class MarineWeatherView(APIView):
    """Get marine weather data from OpenWeatherMap API"""
    
    def get(self, request):
        lat = float(request.GET.get('lat', 51.5074))
        lng = float(request.GET.get('lng', -0.1278))
        
        # Check cache first
        cache_key = f"weather_{lat}_{lng}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Fetch from OpenWeather API
        weather_api = OpenWeatherAPI()
        weather_data = weather_api.get_marine_weather(lat, lng)
        
        if weather_data:
            # Cache for 10 minutes
            cache.set(cache_key, weather_data, 600)
            return Response(weather_data)
        
        return Response(
            {'error': 'Weather data not available'}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

class VesselDetailsView(APIView):
    """Get detailed vessel information by MMSI"""
    
    def get(self, request, mmsi):
        # This would typically query your database for stored vessel details
        # and combine with live AIS data
        
        cache_key = f"vessel_details_{mmsi}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Mock response - replace with actual database query
        vessel_details = {
            'mmsi': mmsi,
            'name': 'Sample Vessel',
            'imo': '1234567',
            'vessel_type': 'Cargo',
            'flag': 'Unknown',
            'length': 200,
            'width': 30,
            'draught': 12.5,
            'destination': 'Unknown',
            'eta': 'Unknown'
        }
        
        cache.set(cache_key, vessel_details, 300)
        return Response(vessel_details)