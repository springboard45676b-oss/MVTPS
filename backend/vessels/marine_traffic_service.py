"""
MarineTraffic API Integration Service
Fetches live vessel data from MarineTraffic API and AIS Stream
"""

import requests
import json
from datetime import datetime, timedelta
from django.conf import settings
from .models import Vessel, VesselPosition
from .aisstream_service import aisstream_service

class MarineTrafficService:
    def __init__(self):
        # You need to get API key from https://www.marinetraffic.com/en/ais-api-services
        self.api_key = getattr(settings, 'MARINE_TRAFFIC_API_KEY', None)
        self.base_url = "https://services.marinetraffic.com/api"
        self.use_aisstream = getattr(settings, 'AISSTREAM_API_KEY', None) is not None
        
    def get_live_vessels(self, bounds=None):
        """
        Fetch live vessel data from AIS Stream (preferred) or MarineTraffic API
        bounds: dict with minlat, maxlat, minlon, maxlon
        """
        # Try AIS Stream first if available
        if self.use_aisstream:
            try:
                return self._get_aisstream_data(bounds)
            except Exception as e:
                print(f"AIS Stream error, falling back to database: {e}")
        
        # Fallback to MarineTraffic or database data
        if self.api_key:
            try:
                return self._get_marinetraffic_data(bounds)
            except Exception as e:
                print(f"MarineTraffic error, using database data: {e}")
        
        print("No API keys working. Using database vessels.")
        return self._get_recent_database_vessels(bounds)
    
    def _get_aisstream_data(self, bounds=None):
        """Get data from AIS Stream service"""
        # Start streaming if not already running
        if not aisstream_service.is_streaming():
            aisstream_service.start_streaming(bounds)
        
        # Get cached vessel data
        cached_vessels = aisstream_service.get_cached_vessels()
        
        if cached_vessels:
            return cached_vessels
        
        # If no cached data, get recent data from database
        return self._get_recent_database_vessels(bounds)
    
    def _get_recent_database_vessels(self, bounds=None):
        """Get recent vessel data from database"""
        try:
            # Get vessels updated in the last 24 hours (extended for demo data)
            cutoff_time = datetime.now() - timedelta(hours=24)
            
            # Build query
            positions = VesselPosition.objects.filter(
                timestamp__gte=cutoff_time
            ).select_related('vessel')
            
            # If no recent positions, get all vessels with their latest positions
            if not positions.exists():
                positions = VesselPosition.objects.select_related('vessel')
            
            # Apply bounds filter if specified
            if bounds:
                positions = positions.filter(
                    latitude__gte=bounds.get('minlat', -90),
                    latitude__lte=bounds.get('maxlat', 90),
                    longitude__gte=bounds.get('minlon', -180),
                    longitude__lte=bounds.get('maxlon', 180),
                )
            
            # Get latest position for each vessel
            vessels = []
            seen_vessels = set()
            
            for position in positions.order_by('-timestamp'):
                if position.vessel.mmsi not in seen_vessels:
                    vessels.append({
                        'mmsi': position.vessel.mmsi,
                        'name': position.vessel.name,
                        'latitude': float(position.latitude),
                        'longitude': float(position.longitude),
                        'speed': float(position.speed),
                        'course': float(position.course),
                        'heading': float(position.heading),
                        'status': position.status,
                        'vessel_type': position.vessel.vessel_type,
                        'flag': getattr(position.vessel, 'flag', 'Unknown'),
                        'length': getattr(position.vessel, 'length', 0),
                        'width': getattr(position.vessel, 'width', 0),
                        'timestamp': position.timestamp,
                    })
                    seen_vessels.add(position.vessel.mmsi)
            
            return vessels
            
        except Exception as e:
            print(f"Error getting database vessels: {e}")
            return []
    
    def _get_marinetraffic_data(self, bounds):
        """Get data from MarineTraffic API"""
        # API endpoint for vessel positions
        url = f"{self.base_url}/exportvessels/v:8/{self.api_key}"
        
        params = {
            'protocol': 'jsono',
            'msgtype': 'simple',
            'timespan': 10,  # Last 10 minutes
        }
        
        if bounds:
            params.update({
                'minlat': bounds.get('minlat', -90),
                'maxlat': bounds.get('maxlat', 90),
                'minlon': bounds.get('minlon', -180),
                'maxlon': bounds.get('maxlon', 180),
            })
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        return self._process_marine_traffic_data(data)
    
    def _process_marine_traffic_data(self, data):
        """Process MarineTraffic API response"""
        vessels = []
        
        if isinstance(data, list):
            for vessel_data in data:
                try:
                    vessel_info = {
                        'mmsi': str(vessel_data.get('MMSI', '')),
                        'name': vessel_data.get('SHIPNAME', 'Unknown'),
                        'latitude': float(vessel_data.get('LAT', 0)),
                        'longitude': float(vessel_data.get('LON', 0)),
                        'speed': float(vessel_data.get('SPEED', 0)),
                        'course': float(vessel_data.get('COURSE', 0)),
                        'heading': float(vessel_data.get('HEADING', 0)),
                        'status': vessel_data.get('STATUS', 'Unknown'),
                        'vessel_type': self._get_vessel_type(vessel_data.get('TYPE_NAME', '')),
                        'flag': vessel_data.get('FLAG', 'Unknown'),
                        'length': vessel_data.get('LENGTH', 0),
                        'width': vessel_data.get('WIDTH', 0),
                        'timestamp': datetime.now(),
                    }
                    vessels.append(vessel_info)
                except (ValueError, TypeError) as e:
                    print(f"Error processing vessel data: {e}")
                    continue
        
        return vessels
    
    def _get_vessel_type(self, type_name):
        """Map MarineTraffic vessel types to our types"""
        type_name = type_name.lower()
        if 'container' in type_name:
            return 'container'
        elif 'tanker' in type_name or 'oil' in type_name:
            return 'tanker'
        elif 'cargo' in type_name or 'bulk' in type_name:
            return 'cargo'
        elif 'passenger' in type_name or 'cruise' in type_name:
            return 'passenger'
        elif 'fishing' in type_name:
            return 'fishing'
        else:
            return 'other'
    
    def _get_demo_live_data(self):
        """
        Return demo live data when API is not available
        This simulates live vessel movements
        """
        import random
        
        demo_vessels = [
            {
                'mmsi': '636019825',
                'name': 'MSC Gülsün',
                'latitude': 51.9225 + random.uniform(-0.1, 0.1),
                'longitude': 4.4792 + random.uniform(-0.1, 0.1),
                'speed': random.uniform(0, 22),
                'course': random.uniform(0, 360),
                'heading': random.uniform(0, 360),
                'status': random.choice(['Underway', 'At anchor', 'Moored']),
                'vessel_type': 'container',
                'flag': 'Liberia',
                'length': 399.9,
                'width': 61.0,
                'timestamp': datetime.now(),
            },
            {
                'mmsi': '353136000',
                'name': 'Ever Ace',
                'latitude': 1.2966 + random.uniform(-0.1, 0.1),
                'longitude': 103.8006 + random.uniform(-0.1, 0.1),
                'speed': random.uniform(0, 25),
                'course': random.uniform(0, 360),
                'heading': random.uniform(0, 360),
                'status': random.choice(['Underway', 'Loading', 'Discharging']),
                'vessel_type': 'container',
                'flag': 'Panama',
                'length': 399.9,
                'width': 61.5,
                'timestamp': datetime.now(),
            },
            {
                'mmsi': '477995300',
                'name': 'OOCL Hong Kong',
                'latitude': 22.3193 + random.uniform(-0.1, 0.1),
                'longitude': 114.1694 + random.uniform(-0.1, 0.1),
                'speed': random.uniform(0, 20),
                'course': random.uniform(0, 360),
                'heading': random.uniform(0, 360),
                'status': random.choice(['In port', 'Underway', 'At anchor']),
                'vessel_type': 'container',
                'flag': 'Hong Kong',
                'length': 399.87,
                'width': 58.8,
                'timestamp': datetime.now(),
            },
            {
                'mmsi': '311000274',
                'name': 'Symphony of the Seas',
                'latitude': 25.7617 + random.uniform(-0.1, 0.1),
                'longitude': -80.1918 + random.uniform(-0.1, 0.1),
                'speed': random.uniform(0, 22),
                'course': random.uniform(0, 360),
                'heading': random.uniform(0, 360),
                'status': random.choice(['In port', 'Underway', 'At anchor']),
                'vessel_type': 'passenger',
                'flag': 'Bahamas',
                'length': 362.12,
                'width': 66.0,
                'timestamp': datetime.now(),
            },
            {
                'mmsi': '636017894',
                'name': 'Seaways Laura Lynn',
                'latitude': 29.3759 + random.uniform(-0.1, 0.1),
                'longitude': 47.9774 + random.uniform(-0.1, 0.1),
                'speed': random.uniform(0, 15),
                'course': random.uniform(0, 360),
                'heading': random.uniform(0, 360),
                'status': random.choice(['Loading', 'Underway', 'Discharging']),
                'vessel_type': 'tanker',
                'flag': 'Liberia',
                'length': 274.0,
                'width': 48.0,
                'timestamp': datetime.now(),
            }
        ]
        
        return demo_vessels
    
    def update_vessel_positions(self, bounds=None):
        """
        Fetch live data and update vessel positions in database
        """
        # If using AIS Stream, start the streaming service
        if self.use_aisstream and not aisstream_service.is_streaming():
            aisstream_service.start_streaming(bounds)
            return 0  # AIS Stream updates continuously
        
        # Otherwise use traditional API approach
        live_vessels = self.get_live_vessels(bounds)
        updated_count = 0
        
        for vessel_data in live_vessels:
            try:
                # Get or create vessel
                vessel, created = Vessel.objects.get_or_create(
                    mmsi=vessel_data['mmsi'],
                    defaults={
                        'name': vessel_data['name'],
                        'vessel_type': vessel_data['vessel_type'],
                        'flag': vessel_data.get('flag', 'Unknown'),
                        'length': vessel_data.get('length', 0),
                        'width': vessel_data.get('width', 0),
                    }
                )
                
                # Create new position record
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=vessel_data['latitude'],
                    longitude=vessel_data['longitude'],
                    speed=vessel_data['speed'],
                    course=vessel_data['course'],
                    heading=vessel_data['heading'],
                    status=vessel_data['status'],
                    timestamp=vessel_data['timestamp']
                )
                
                updated_count += 1
                
            except Exception as e:
                print(f"Error updating vessel {vessel_data.get('name', 'Unknown')}: {e}")
                continue
        
        return updated_count
    
    def get_streaming_status(self):
        """Get status of AIS streaming"""
        if self.use_aisstream:
            return {
                'aisstream_enabled': True,
                'is_streaming': aisstream_service.is_streaming(),
                'cached_vessels': len(aisstream_service.get_cached_vessels())
            }
        return {
            'aisstream_enabled': False,
            'is_streaming': False,
            'cached_vessels': 0
        }
    
    def start_ais_streaming(self, bounds=None):
        """Start AIS streaming service"""
        if self.use_aisstream:
            aisstream_service.start_streaming(bounds)
            return True
        return False
    
    def stop_ais_streaming(self):
        """Stop AIS streaming service"""
        if self.use_aisstream:
            aisstream_service.stop_streaming()
            return True
        return False

# Global instance
marine_traffic_service = MarineTrafficService()