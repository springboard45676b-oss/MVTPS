"""
Vessel Serializers
Handles vessel information and GPS position tracking
"""

from rest_framework import serializers
from ..models import Vessel, VesselPosition
from .utils import PositionCalculator


class VesselSerializer(serializers.ModelSerializer):
    """Vessel serializer with calculated speed and course"""
    
    speed = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = (
            'id',
            'imo_number',
            'name',
            'type',
            'flag',
            'destination',
            'cargo_type',
            'operator',
            'last_position_lat',
            'last_position_lon',
            'last_update',
            'speed',
            'course'
        )
        read_only_fields = ('id', 'last_update', 'speed', 'course')
    
    def get_speed(self, obj):
        """Calculate current speed from last two positions"""
        try:
            positions = VesselPosition.objects.filter(vessel=obj).order_by('-timestamp')[:2]
            
            if len(positions) >= 2:
                latest = positions[0]
                previous = positions[1]
                
                calc = PositionCalculator.calculate_speed_and_course(
                    previous.latitude,
                    previous.longitude,
                    previous.timestamp,
                    latest.latitude,
                    latest.longitude,
                    latest.timestamp
                )
                return calc['speed']
            return None
        except Exception:
            return None
    
    def get_course(self, obj):
        """Calculate current course from last two positions"""
        try:
            positions = VesselPosition.objects.filter(vessel=obj).order_by('-timestamp')[:2]
            
            if len(positions) >= 2:
                latest = positions[0]
                previous = positions[1]
                
                calc = PositionCalculator.calculate_speed_and_course(
                    previous.latitude,
                    previous.longitude,
                    previous.timestamp,
                    latest.latitude,
                    latest.longitude,
                    latest.timestamp
                )
                return calc['course']
            return None
        except Exception:
            return None


class VesselPositionSerializer(serializers.ModelSerializer):
    """Serializer for GPS position history tracking"""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    
    class Meta:
        model = VesselPosition
        fields = (
            'id',
            'vessel',
            'vessel_name',
            'vessel_imo',
            'latitude',
            'longitude',
            'speed',
            'course',
            'timestamp',
            'source'
        )
        read_only_fields = ('id', 'source')


class VesselDetailedSerializer(serializers.ModelSerializer):
    """Detailed vessel serializer with recent positions"""
    
    speed = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    recent_positions = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = (
            'id',
            'imo_number',
            'name',
            'type',
            'flag',
            'destination',
            'cargo_type',
            'operator',
            'last_position_lat',
            'last_position_lon',
            'last_update',
            'speed',
            'course',
            'recent_positions'
        )
        read_only_fields = ('id', 'last_update', 'speed', 'course')
    
    def get_speed(self, obj):
        try:
            positions = VesselPosition.objects.filter(vessel=obj).order_by('-timestamp')[:2]
            if len(positions) >= 2:
                latest = positions[0]
                previous = positions[1]
                calc = PositionCalculator.calculate_speed_and_course(
                    previous.latitude, previous.longitude, previous.timestamp,
                    latest.latitude, latest.longitude, latest.timestamp
                )
                return calc['speed']
            return None
        except Exception:
            return None
    
    def get_course(self, obj):
        try:
            positions = VesselPosition.objects.filter(vessel=obj).order_by('-timestamp')[:2]
            if len(positions) >= 2:
                latest = positions[0]
                previous = positions[1]
                calc = PositionCalculator.calculate_speed_and_course(
                    previous.latitude, previous.longitude, previous.timestamp,
                    latest.latitude, latest.longitude, latest.timestamp
                )
                return calc['course']
            return None
        except Exception:
            return None
    
    def get_recent_positions(self, obj):
        """Get last 10 positions"""
        positions = VesselPosition.objects.filter(vessel=obj).order_by('-timestamp')[:10]
        return VesselPositionSerializer(positions, many=True).data