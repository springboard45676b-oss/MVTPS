"""
Shared Utilities
Position calculation and other common utilities
"""

import math


class PositionCalculator:
    """Calculate speed and course from GPS coordinates"""
    
    EARTH_RADIUS_KM = 6371.0
    KNOTS_PER_KMH = 0.539957
    
    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates in km"""
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))
        
        return PositionCalculator.EARTH_RADIUS_KM * c
    
    @staticmethod
    def calculate_bearing(lat1, lon1, lat2, lon2):
        """Calculate bearing (course) from point 1 to point 2 (0-360 degrees)"""
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlon = lon2_rad - lon1_rad
        
        x = math.sin(dlon) * math.cos(lat2_rad)
        y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlon)
        
        bearing_rad = math.atan2(x, y)
        bearing_deg = math.degrees(bearing_rad)
        bearing_deg = (bearing_deg + 360) % 360
        
        return round(bearing_deg, 2)
    
    @staticmethod
    def calculate_speed_and_course(lat1, lon1, timestamp1, lat2, lon2, timestamp2):
        """Calculate speed (knots) and course from two positions"""
        distance_km = PositionCalculator.haversine_distance(lat1, lon1, lat2, lon2)
        time_diff = timestamp2 - timestamp1
        hours = time_diff.total_seconds() / 3600
        
        if hours == 0 or distance_km < 0.01:
            return {'speed': 0.0, 'course': 0.0}
        
        speed_kmh = distance_km / hours
        speed_knots = speed_kmh * PositionCalculator.KNOTS_PER_KMH
        course = PositionCalculator.calculate_bearing(lat1, lon1, lat2, lon2)
        
        return {
            'speed': round(min(speed_knots, 30), 2),
            'course': course
        }