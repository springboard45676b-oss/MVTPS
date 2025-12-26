import requests
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AISHubAPI:
    def __init__(self):
        self.base_url = "http://data.aishub.net/ws.php"
        self.username = getattr(settings, 'AISHUB_USERNAME', '')
        
    def get_vessels_in_area(self, lat_min, lat_max, lng_min, lng_max):
        """Fetch vessels in specified area from AIS Hub"""
        params = {
            'username': self.username,
            'format': 1,  # JSON format
            'output': 'json',
            'compress': 0,
            'latmin': lat_min,
            'latmax': lat_max,
            'lonmin': lng_min,
            'lonmax': lng_max
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return self._parse_ais_data(data)
            return []
        except Exception as e:
            logger.error(f"AIS Hub API error: {e}")
            return []
    
    def _parse_ais_data(self, data):
        """Parse AIS Hub response data"""
        vessels = []
        if isinstance(data, list):
            for vessel_data in data:
                try:
                    vessel = {
                        'mmsi': vessel_data.get('MMSI'),
                        'name': vessel_data.get('NAME', '').strip(),
                        'latitude': float(vessel_data.get('LATITUDE', 0)),
                        'longitude': float(vessel_data.get('LONGITUDE', 0)),
                        'speed': float(vessel_data.get('SOG', 0)),
                        'course': float(vessel_data.get('COG', 0)),
                        'vessel_type': vessel_data.get('SHIPTYPE', 'Unknown'),
                        'timestamp': datetime.now(),
                        'imo': vessel_data.get('IMO', ''),
                        'callsign': vessel_data.get('CALLSIGN', ''),
                        'destination': vessel_data.get('DESTINATION', ''),
                        'eta': vessel_data.get('ETA', ''),
                        'draught': vessel_data.get('DRAUGHT', 0),
                        'length': vessel_data.get('LENGTH', 0),
                        'width': vessel_data.get('WIDTH', 0)
                    }
                    vessels.append(vessel)
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error parsing vessel data: {e}")
                    continue
        return vessels

class OpenWeatherAPI:
    def __init__(self):
        self.api_key = getattr(settings, 'OPENWEATHER_API_KEY', '')
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_weather_by_coordinates(self, lat, lng):
        """Get current weather for coordinates"""
        url = f"{self.base_url}/weather"
        params = {
            'lat': lat,
            'lon': lng,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return self._parse_weather_data(response.json())
            return None
        except Exception as e:
            logger.error(f"OpenWeather API error: {e}")
            return None
    
    def get_marine_weather(self, lat, lng):
        """Get marine weather conditions"""
        weather_data = self.get_weather_by_coordinates(lat, lng)
        if weather_data:
            # Add marine-specific calculations
            weather_data['sea_state'] = self._calculate_sea_state(weather_data['wind_speed'])
            weather_data['visibility_km'] = weather_data.get('visibility', 10000) / 1000
        return weather_data
    
    def _parse_weather_data(self, data):
        """Parse OpenWeather response"""
        return {
            'temperature': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'],
            'wind_direction': data['wind'].get('deg', 0),
            'weather_condition': data['weather'][0]['main'],
            'description': data['weather'][0]['description'],
            'visibility': data.get('visibility', 10000),
            'clouds': data['clouds']['all'],
            'timestamp': datetime.now()
        }
    
    def _calculate_sea_state(self, wind_speed):
        """Calculate sea state based on wind speed (Beaufort scale)"""
        if wind_speed < 1:
            return "Calm"
        elif wind_speed < 4:
            return "Light"
        elif wind_speed < 7:
            return "Moderate"
        elif wind_speed < 11:
            return "Fresh"
        elif wind_speed < 17:
            return "Strong"
        else:
            return "Rough"