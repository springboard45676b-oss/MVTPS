# server/backend/core/services.py
import random
import threading
import time
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
from .models import Vessel, VesselPosition, APIKey
import logging

logger = logging.getLogger(__name__)

class VesselPositionService:
    """
    Service to manage real-time vessel position updates and mock data generation
    """
    
    # Major shipping routes with realistic coordinates
    MAJOR_PORTS = {
        'Singapore': (1.3521, 103.8198),
        'Rotterdam': (51.9225, 4.2797),
        'Shanghai': (31.2304, 121.4737),
        'Hong Kong': (22.3193, 114.1694),
        'Dubai': (25.2048, 55.2708),
        'Los Angeles': (33.7425, -118.2673),
        'Hamburg': (53.5511, 9.9769),
        'Port Said': (31.2571, 32.2960),
        'Busan': (35.0979, 129.0245),
        'Antwerp': (51.3397, 4.2804),
        'Mumbai': (19.0176, 72.8479),
        'Tokyo': (35.4437, 139.6380),
        'New York': (40.7128, -74.0060),
    }

    @staticmethod
    def generate_realistic_route(start_port, end_port, num_points=24):
        """
        Generate realistic route points between two ports with some randomness
        """
        start_lat, start_lon = VesselPositionService.MAJOR_PORTS[start_port]
        end_lat, end_lon = VesselPositionService.MAJOR_PORTS[end_port]
        
        points = []
        for i in range(num_points):
            progress = i / (num_points - 1) if num_points > 1 else 0
            # Add some randomness to make the route less linear
            variation = random.uniform(-0.1, 0.1)
            
            lat = start_lat + (end_lat - start_lat) * progress + variation
            lon = start_lon + (end_lon - start_lon) * progress + variation
            
            points.append((lat, lon))
        
        return points
    
    @staticmethod
    @transaction.atomic
    def generate_mock_vessel_data(num_vessels=5):
        """
        Generate comprehensive mock vessel data with realistic routes
        """
        vessels_data = [
            # Container Ships
            {
                'imo_number': '9625698',
                'name': 'Ever Given',
                'type': 'Container Ship',
                'flag': 'Panama',
                'cargo_type': 'Containers',
                'operator': 'Evergreen Marine Corp',
                'destination': 'Rotterdam',
                'route': ('Singapore', 'Rotterdam'),
                'speed_range': (18, 22),
            },
            {
                'imo_number': '9632730',
                'name': 'MSC Gulseum',
                'type': 'Container Ship',
                'flag': 'Liberia',
                'cargo_type': 'Containers',
                'operator': 'Mediterranean Shipping Company',
                'destination': 'Los Angeles',
                'route': ('Shanghai', 'Los Angeles'),
                'speed_range': (19, 23),
            },
            {
                'imo_number': '9360467',
                'name': 'COSCO Shipping Universe',
                'type': 'Container Ship',
                'flag': 'Hong Kong',
                'cargo_type': 'Containers',
                'operator': 'China Ocean Shipping Company',
                'destination': 'Hamburg',
                'route': ('Hong Kong', 'Hamburg'),
                'speed_range': (17, 21),
            },
            # Tankers
            {
                'imo_number': '9641625',
                'name': 'Nordic Tanker',
                'type': 'Oil Tanker',
                'flag': 'Panama',
                'cargo_type': 'Crude Oil',
                'operator': 'Torm A/S',
                'destination': 'Rotterdam',
                'route': ('Dubai', 'Rotterdam'),
                'speed_range': (13, 17),
            },
            {
                'imo_number': '9494098',
                'name': 'LNG Carrier One',
                'type': 'LNG Tanker',
                'flag': 'Denmark',
                'cargo_type': 'Liquefied Natural Gas',
                'operator': 'Maersk Line',
                'destination': 'Tokyo',
                'route': ('Port Said', 'Tokyo'),
                'speed_range': (16, 20),
            },
            {
                'imo_number': '9512345',
                'name': 'Chemical Carrier',
                'type': 'Chemical Tanker',
                'flag': 'Singapore',
                'cargo_type': 'Chemicals',
                'operator': 'Stena Line',
                'destination': 'Hamburg',
                'route': ('Singapore', 'Hamburg'),
                'speed_range': (14, 18),
            },
            # Cargo Ships
            {
                'imo_number': '9654321',
                'name': 'Pacific Fortune',
                'type': 'General Cargo Ship',
                'flag': 'Panama',
                'cargo_type': 'General Cargo',
                'operator': 'CMA CGM',
                'destination': 'Shanghai',
                'route': ('Los Angeles', 'Shanghai'),
                'speed_range': (17, 21),
            },
            {
                'imo_number': '9723456',
                'name': 'Bulk Carrier Star',
                'type': 'Bulk Carrier',
                'flag': 'Malta',
                'cargo_type': 'Bulk Commodities',
                'operator': 'Diana Containerships',
                'destination': 'Busan',
                'route': ('Dubai', 'Busan'),
                'speed_range': (12, 16),
            },
            {
                'imo_number': '9834567',
                'name': 'Global Trader',
                'type': 'Break Bulk Carrier',
                'flag': 'Liberia',
                'cargo_type': 'Heavy Lift Cargo',
                'operator': 'Seatrade',
                'destination': 'New York',
                'route': ('Rotterdam', 'New York'),
                'speed_range': (15, 19),
            },
            # Refrigerated Cargo Ships
            {
                'imo_number': '9945678',
                'name': 'Maersk Seatrade',
                'type': 'Refrigerated Cargo Ship',
                'flag': 'Denmark',
                'cargo_type': 'Refrigerated Goods',
                'operator': 'A.P. Moller-Maersk',
                'destination': 'Dubai',
                'route': ('Port Said', 'Dubai'),
                'speed_range': (16, 20),
            },
            # Specialized Ships
            {
                'imo_number': '9056789',
                'name': 'Heavy Lift Vessel',
                'type': 'Heavy Lift Ship',
                'flag': 'Germany',
                'cargo_type': 'Project Cargo',
                'operator': 'Boskalis',
                'destination': 'Singapore',
                'route': ('Hamburg', 'Singapore'),
                'speed_range': (11, 15),
            },
            {
                'imo_number': '9167890',
                'name': 'Vehicle Carrier One',
                'type': 'Car Carrier',
                'flag': 'Japan',
                'cargo_type': 'Vehicles',
                'operator': 'Nippon Yusen Kaisha',
                'destination': 'Tokyo',
                'route': ('Los Angeles', 'Tokyo'),
                'speed_range': (18, 22),
            },
            {
                'imo_number': '9278901',
                'name': 'Ro-Ro Vessel',
                'type': 'RoRo Ship',
                'flag': 'Norway',
                'cargo_type': 'Roll-on/Roll-off Cargo',
                'operator': 'Schiber',
                'destination': 'Antwerp',
                'route': ('Hamburg', 'Antwerp'),
                'speed_range': (17, 21),
            },
            {
                'imo_number': '9389012',
                'name': 'Multipurpose Vessel',
                'type': 'Multipurpose Ship',
                'flag': 'Hong Kong',
                'cargo_type': 'General & Heavy Cargo',
                'operator': 'Universal Ocean Services',
                'destination': 'Mumbai',
                'route': ('Shanghai', 'Mumbai'),
                'speed_range': (14, 18),
            },
            {
                'imo_number': '9490123',
                'name': 'Offshore Supply Vessel',
                'type': 'Offshore Supply Vessel',
                'flag': 'Singapore',
                'cargo_type': 'Offshore Equipment',
                'operator': 'Maersk Supply Service',
                'destination': 'Singapore',
                'route': ('Dubai', 'Singapore'),
                'speed_range': (12, 16),
            },
            {
                'imo_number': '9501234',
                'name': 'Yacht Support Vessel',
                'type': 'Yacht Support Vessel',
                'flag': 'Cayman Islands',
                'cargo_type': 'Yacht Supplies',
                'operator': 'Camper & Nicholsons',
                'destination': 'Dubai',
                'route': ('Rotterdam', 'Dubai'),
                'speed_range': (14, 18),
            },
        ]
        
        created_vessels = []
        
        for vessel_data in vessels_data[:num_vessels]:
            vessel, created = Vessel.objects.get_or_create(
                imo_number=vessel_data['imo_number'],
                defaults={
                    'name': vessel_data['name'],
                    'type': vessel_data['type'],
                    'flag': vessel_data['flag'],
                    'cargo_type': vessel_data['cargo_type'],
                    'operator': vessel_data['operator'],
                    'destination': vessel_data['destination'],
                }
            )
            
            # Generate realistic route positions
            route = vessel_data['route']
            route_points = VesselPositionService.generate_realistic_route(
                route[0], route[1], num_points=24
            )
            
            # Clear existing positions if regenerating
            if not created:
                VesselPosition.objects.filter(vessel=vessel).delete()
            
            # Generate position history for last 24 hours
            now = timezone.now()
            positions = []
            
            for i, (lat, lon) in enumerate(route_points):
                timestamp = now - timedelta(hours=24-i)
                
                position = VesselPosition(
                    vessel=vessel,
                    latitude=lat + random.uniform(-0.05, 0.05),
                    longitude=lon + random.uniform(-0.05, 0.05),
                    speed=None,  # Will be calculated on-the-fly
                    course=None,  # Will be calculated on-the-fly
                    timestamp=timestamp,
                    source='mock',
                )
                positions.append(position)
            
            # Bulk create positions
            VesselPosition.objects.bulk_create(positions)
            
            # Update vessel's last position
            if route_points:
                last_lat, last_lon = route_points[-1]
                vessel.last_position_lat = last_lat + random.uniform(-0.05, 0.05)
                vessel.last_position_lon = last_lon + random.uniform(-0.05, 0.05)
                vessel.last_update = timezone.now()
                vessel.save()
            
            created_vessels.append(vessel)
            logger.info(f"Generated mock data for vessel: {vessel.name}")
        
        return created_vessels
    
    @staticmethod
    def update_vessel_position(vessel_id, latitude, longitude, speed=None, course=None, source='api'):
        """
        Update or create a new position for a vessel
        """
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            
            position = VesselPosition.objects.create(
                vessel=vessel,
                latitude=latitude,
                longitude=longitude,
                speed=speed,
                course=course,
                timestamp=timezone.now(),
                source=source,
            )
            
            # Update vessel's last position
            vessel.last_position_lat = latitude
            vessel.last_position_lon = longitude
            vessel.last_update = timezone.now()
            vessel.save()
            
            logger.info(f"Updated position for vessel {vessel.name}: ({latitude}, {longitude})")
            return position
            
        except Vessel.DoesNotExist:
            logger.error(f"Vessel with id {vessel_id} not found")
            return None
    
    @staticmethod
    def simulate_continuous_movement():
        """
        Continuously simulate vessel movement (for development/demo)
        Run this in a background task or thread
        """
        while True:
            try:
                vessels = Vessel.objects.all()
                
                for vessel in vessels:
                    # Get the latest position
                    latest_pos = VesselPosition.objects.filter(
                        vessel=vessel
                    ).order_by('-timestamp').first()
                    
                    if latest_pos:
                        # Calculate small random movement
                        lat_change = random.uniform(-0.01, 0.01)
                        lon_change = random.uniform(-0.01, 0.01)
                        
                        new_lat = latest_pos.latitude + lat_change
                        new_lon = latest_pos.longitude + lon_change
                        
                        # Clamp to valid ranges
                        new_lat = max(-90, min(90, new_lat))
                        new_lon = max(-180, min(180, new_lon))
                        
                        VesselPositionService.update_vessel_position(
                            vessel.id,
                            new_lat,
                            new_lon,
                            speed=None,
                            course=None,
                            source='mock'
                        )
                
                # Update every 5 minutes
                time.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in continuous movement simulation: {str(e)}")
                time.sleep(60)
    
    @staticmethod
    def start_background_simulation():
        """
        Start the continuous movement simulation in a daemon thread
        Call this from management command or app ready signal
        """
        thread = threading.Thread(
            target=VesselPositionService.simulate_continuous_movement,
            daemon=True
        )
        thread.start()
        logger.info("Started background vessel position simulation")
        return thread
    
    @staticmethod
    def get_vessel_stats(vessel_id):
        """
        Get statistical data about a vessel's positions
        """
        positions = VesselPosition.objects.filter(
            vessel_id=vessel_id,
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).order_by('timestamp')
        
        if not positions.exists():
            return None
        
        speeds = [p.speed for p in positions if p.speed is not None]
        
        return {
            'avg_speed': round(sum(speeds) / len(speeds), 2) if speeds else 0,
            'max_speed': round(max(speeds), 2) if speeds else 0,
            'min_speed': round(min(speeds), 2) if speeds else 0,
            'total_positions': positions.count(),
            'latest_position': {
                'lat': positions.last().latitude,
                'lon': positions.last().longitude,
                'timestamp': positions.last().timestamp,
            }
        }