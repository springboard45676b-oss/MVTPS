"""
Voyage Tracking System
Automatically creates and updates voyages based on vessel movements
"""

import logging
from datetime import datetime, timedelta
from django.db import models
from django.utils import timezone
from .models import Vessel, VesselPosition
from geopy.distance import geodesic
import math

logger = logging.getLogger(__name__)

class VoyageTracker:
    def __init__(self):
        self.min_voyage_distance = 10  # km - minimum distance to start a new voyage
        self.max_stationary_time = 6   # hours - max time stationary before ending voyage
        self.min_speed_threshold = 2   # knots - minimum speed to consider "moving"
    
    def create_voyage_from_positions(self, vessel, start_position, end_position=None):
        """Create a new voyage from vessel positions"""
        from .models import Voyage  # Import here to avoid circular imports
        
        voyage = Voyage.objects.create(
            vessel=vessel,
            start_time=start_position.timestamp,
            start_latitude=start_position.latitude,
            start_longitude=start_position.longitude,
            start_port=self.get_nearest_port(start_position.latitude, start_position.longitude),
            status='active'
        )
        
        if end_position:
            self.complete_voyage(voyage, end_position)
        
        return voyage
    
    def complete_voyage(self, voyage, end_position):
        """Complete a voyage with end position"""
        voyage.end_time = end_position.timestamp
        voyage.end_latitude = end_position.latitude
        voyage.end_longitude = end_position.longitude
        voyage.end_port = self.get_nearest_port(end_position.latitude, end_position.longitude)
        voyage.status = 'completed'
        
        # Calculate voyage statistics
        if voyage.start_latitude and voyage.start_longitude:
            distance = geodesic(
                (voyage.start_latitude, voyage.start_longitude),
                (voyage.end_latitude, voyage.end_longitude)
            ).kilometers
            voyage.distance_km = distance
            
            # Calculate duration
            duration = voyage.end_time - voyage.start_time
            voyage.duration_hours = duration.total_seconds() / 3600
            
            # Calculate average speed
            if voyage.duration_hours > 0:
                voyage.average_speed = distance / voyage.duration_hours * 0.539957  # Convert to knots
        
        voyage.save()
        return voyage
    
    def process_vessel_positions(self, vessel):
        """Process all positions for a vessel and create/update voyages"""
        positions = VesselPosition.objects.filter(vessel=vessel).order_by('timestamp')
        
        if positions.count() < 2:
            return []
        
        voyages = []
        current_voyage = None
        last_position = None
        stationary_start = None
        
        for position in positions:
            if last_position is None:
                last_position = position
                continue
            
            # Calculate distance and time between positions
            distance = geodesic(
                (last_position.latitude, last_position.longitude),
                (position.latitude, position.longitude)
            ).kilometers
            
            time_diff = (position.timestamp - last_position.timestamp).total_seconds() / 3600  # hours
            
            # Determine if vessel is moving
            is_moving = position.speed and position.speed > self.min_speed_threshold
            significant_movement = distance > self.min_voyage_distance
            
            if is_moving and significant_movement:
                # Vessel is moving significantly
                if current_voyage is None:
                    # Start new voyage
                    current_voyage = self.create_voyage_from_positions(vessel, last_position)
                    voyages.append(current_voyage)
                    logger.info(f"Started new voyage for {vessel.name}")
                
                stationary_start = None  # Reset stationary timer
                
            else:
                # Vessel is stationary or moving slowly
                if stationary_start is None:
                    stationary_start = position.timestamp
                
                # Check if vessel has been stationary too long
                if current_voyage and stationary_start:
                    stationary_duration = (position.timestamp - stationary_start).total_seconds() / 3600
                    
                    if stationary_duration > self.max_stationary_time:
                        # End current voyage
                        self.complete_voyage(current_voyage, position)
                        logger.info(f"Completed voyage for {vessel.name}")
                        current_voyage = None
                        stationary_start = None
            
            last_position = position
        
        # Complete any active voyage
        if current_voyage and last_position:
            self.complete_voyage(current_voyage, last_position)
            logger.info(f"Completed final voyage for {vessel.name}")
        
        return voyages
    
    def get_nearest_port(self, latitude, longitude):
        """Get nearest port to given coordinates"""
        # This is a simplified version - you could integrate with a ports database
        major_ports = {
            'Rotterdam': (51.9225, 4.4792),
            'Singapore': (1.2966, 103.8006),
            'Shanghai': (31.2304, 121.4737),
            'Los Angeles': (33.7405, -118.2668),
            'Hamburg': (53.5511, 9.9937),
            'New York': (40.6892, -74.0445),
            'Hong Kong': (22.3193, 114.1694),
            'Dubai': (25.2769, 55.2962),
        }
        
        min_distance = float('inf')
        nearest_port = 'Unknown'
        
        for port_name, (port_lat, port_lon) in major_ports.items():
            distance = geodesic((latitude, longitude), (port_lat, port_lon)).kilometers
            if distance < min_distance:
                min_distance = distance
                nearest_port = port_name
        
        # Only return port name if within reasonable distance (500km)
        return nearest_port if min_distance < 500 else 'Open Sea'
    
    def update_active_voyages(self):
        """Update all active voyages with latest position data"""
        from .models import Voyage
        
        active_voyages = Voyage.objects.filter(status='active')
        updated_count = 0
        
        for voyage in active_voyages:
            latest_position = VesselPosition.objects.filter(
                vessel=voyage.vessel
            ).order_by('-timestamp').first()
            
            if latest_position:
                # Check if vessel is still moving
                time_since_last = timezone.now() - latest_position.timestamp
                
                if time_since_last.total_seconds() / 3600 > self.max_stationary_time:
                    # Complete the voyage
                    self.complete_voyage(voyage, latest_position)
                    updated_count += 1
        
        return updated_count
    
    def get_voyage_statistics(self, vessel=None):
        """Get voyage statistics"""
        from .models import Voyage
        
        voyages = Voyage.objects.all()
        if vessel:
            voyages = voyages.filter(vessel=vessel)
        
        completed_voyages = voyages.filter(status='completed')
        
        stats = {
            'total_voyages': voyages.count(),
            'active_voyages': voyages.filter(status='active').count(),
            'completed_voyages': completed_voyages.count(),
            'total_distance': sum(v.distance_km or 0 for v in completed_voyages),
            'total_duration': sum(v.duration_hours or 0 for v in completed_voyages),
            'average_voyage_distance': 0,
            'average_voyage_duration': 0,
        }
        
        if completed_voyages.count() > 0:
            stats['average_voyage_distance'] = stats['total_distance'] / completed_voyages.count()
            stats['average_voyage_duration'] = stats['total_duration'] / completed_voyages.count()
        
        return stats

# Global instance
voyage_tracker = VoyageTracker()