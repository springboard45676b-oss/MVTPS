from rest_framework import serializers
from .models import Vessel, VesselPosition
from django.utils import timezone

class VesselMapDisplaySerializer(serializers.ModelSerializer):
    """Serializer for vessel data optimized for map display"""
    
    id = serializers.CharField(source='mmsi', read_only=True)
    name = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    speed = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    type = serializers.CharField(source='vessel_type', read_only=True)
    icon = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = [
            'id', 'name', 'latitude', 'longitude', 'speed', 'course', 
            'type', 'icon', 'mmsi', 'imo', 'callsign', 'destination', 
            'eta', 'length', 'width', 'draught', 'timestamp'
        ]
    
    def get_name(self, obj):
        return obj.vessel_name or 'Unknown Vessel'
    
    def get_latitude(self, obj):
        latest_position = obj.positions.first()
        return latest_position.latitude if latest_position else None
    
    def get_longitude(self, obj):
        latest_position = obj.positions.first()
        return latest_position.longitude if latest_position else None
    
    def get_speed(self, obj):
        latest_position = obj.positions.first()
        return latest_position.speed_over_ground if latest_position else 0
    
    def get_course(self, obj):
        latest_position = obj.positions.first()
        return latest_position.course_over_ground if latest_position else 0
    
    def get_icon(self, obj):
        """Get vessel type icon - moved from frontend"""
        type_map = {
            'Cargo': '🚢',
            'Tanker': '🛢️',
            'Container': '📦',
            'Passenger': '🛳️',
            'Fishing': '🎣',
            'Tug': '🚤',
            'Unknown': '⚓'
        }
        return type_map.get(obj.vessel_type, '⚓')
    
    def get_timestamp(self, obj):
        latest_position = obj.positions.first()
        if latest_position:
            return latest_position.ais_timestamp.isoformat()
        return timezone.now().isoformat()

class MockVesselSerializer(serializers.Serializer):
    """Serializer for mock vessel data - replaces frontend mock generation"""
    
    mmsi = serializers.CharField()
    name = serializers.CharField()
    vessel_type = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    speed = serializers.IntegerField()
    course = serializers.IntegerField()
    destination = serializers.CharField()
    eta = serializers.DateTimeField()
    timestamp = serializers.DateTimeField()
    imo = serializers.CharField()
    callsign = serializers.CharField()
    length = serializers.IntegerField()
    width = serializers.IntegerField()
    draught = serializers.IntegerField()
    icon = serializers.CharField()
    
    @staticmethod
    def generate_mock_vessels(count=15, bounds=None):
        """Generate mock vessel data - moved from frontend"""
        import random
        from datetime import datetime, timedelta
        
        vessel_types = ['Cargo', 'Tanker', 'Container', 'Passenger', 'Fishing']
        statuses = ['In Transit', 'At Port', 'Anchored', 'Under Way']
        
        # Default bounds (Los Angeles area)
        if not bounds:
            lat_center, lng_center = 33.7, -118.2
            lat_range, lng_range = 2.0, 2.0
        else:
            lat_center = (bounds.get('lat_min', 33.7) + bounds.get('lat_max', 35.7)) / 2
            lng_center = (bounds.get('lng_min', -120.2) + bounds.get('lng_max', -116.2)) / 2
            lat_range = abs(bounds.get('lat_max', 35.7) - bounds.get('lat_min', 33.7))
            lng_range = abs(bounds.get('lng_max', -116.2) - bounds.get('lng_min', -120.2))
        
        type_map = {
            'Cargo': '🚢',
            'Tanker': '🛢️',
            'Container': '📦',
            'Passenger': '🛳️',
            'Fishing': '🎣'
        }
        
        mock_vessels = []
        for i in range(count):
            vessel_type = random.choice(vessel_types)
            mock_vessels.append({
                'mmsi': f'36700{str(i).zfill(4)}',
                'name': f'MV {chr(65 + (i % 26))}{random.randint(100, 999)}',
                'vessel_type': vessel_type,
                'latitude': lat_center + (random.random() - 0.5) * lat_range,
                'longitude': lng_center + (random.random() - 0.5) * lng_range,
                'speed': random.randint(0, 25),
                'course': random.randint(0, 359),
                'destination': 'Los Angeles',
                'eta': (datetime.now() + timedelta(days=random.randint(1, 3))).isoformat(),
                'timestamp': datetime.now().isoformat(),
                'imo': f'IMO{7000000 + i}',
                'callsign': f'WD{str(i).zfill(4)}',
                'length': 200 + random.randint(0, 200),
                'width': 30 + random.randint(0, 20),
                'draught': 8 + random.randint(0, 10),
                'icon': type_map[vessel_type]
            })
        
        return mock_vessels

class WeatherDataSerializer(serializers.Serializer):
    """Serializer for weather data with business logic validation"""
    
    temperature = serializers.FloatField()
    humidity = serializers.FloatField()
    pressure = serializers.FloatField()
    wind_speed = serializers.FloatField()
    wind_direction = serializers.FloatField()
    wave_height = serializers.FloatField(required=False)
    visibility = serializers.FloatField(required=False)
    weather_condition = serializers.CharField()
    timestamp = serializers.DateTimeField()
    
    def validate_wind_speed(self, value):
        """Validate wind speed is within reasonable range"""
        if value < 0 or value > 200:  # 200 knots is extreme
            raise serializers.ValidationError("Wind speed must be between 0 and 200 knots")
        return value
    
    def validate_wave_height(self, value):
        """Validate wave height is reasonable"""
        if value is not None and (value < 0 or value > 30):  # 30m is extreme
            raise serializers.ValidationError("Wave height must be between 0 and 30 meters")
        return value

class VesselDetailsSerializer(serializers.ModelSerializer):
    """Comprehensive vessel details serializer with business logic"""
    
    latest_position = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = [
            'mmsi', 'imo', 'vessel_name', 'callsign', 'vessel_type',
            'length', 'width', 'draught', 'destination', 'eta',
            'latest_position', 'status', 'risk_level', 'is_active'
        ]
    
    def get_latest_position(self, obj):
        latest = obj.positions.first()
        if latest:
            return {
                'latitude': latest.latitude,
                'longitude': latest.longitude,
                'speed': latest.speed_over_ground,
                'course': latest.course_over_ground,
                'timestamp': latest.ais_timestamp.isoformat()
            }
        return None
    
    def get_status(self, obj):
        """Calculate vessel status based on business rules"""
        latest = obj.positions.first()
        if not latest:
            return 'Unknown'
        
        # Business logic for status determination
        if latest.speed_over_ground < 0.5:
            return 'Anchored'
        elif latest.speed_over_ground < 3:
            return 'Maneuvering'
        else:
            return 'Under Way'
    
    def get_risk_level(self, obj):
        """Calculate risk level based on business rules"""
        # Simplified risk calculation
        latest = obj.positions.first()
        if not latest:
            return 'Unknown'
        
        # High speed = higher risk
        if latest.speed_over_ground > 20:
            return 'High'
        elif latest.speed_over_ground > 10:
            return 'Medium'
        else:
            return 'Low'