"""
Voyage Serializers
Handles voyage tracking and journey management
"""

from rest_framework import serializers
from ..models import Voyage


class VoyageSerializer(serializers.ModelSerializer):
    """Voyage serializer with vessel and port details"""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    vessel_type = serializers.CharField(source='vessel.type', read_only=True)
    port_from_name = serializers.CharField(source='port_from.name', read_only=True)
    port_from_country = serializers.CharField(source='port_from.country', read_only=True)
    port_to_name = serializers.CharField(source='port_to.name', read_only=True)
    port_to_country = serializers.CharField(source='port_to.country', read_only=True)
    duration_days = serializers.SerializerMethodField()
    wait_time_hours = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Voyage
        fields = (
            'id',
            'vessel',
            'vessel_name',
            'vessel_imo',
            'vessel_type',
            'port_from',
            'port_from_name',
            'port_from_country',
            'port_to',
            'port_to_name',
            'port_to_country',
            'departure_time',
            'arrival_time',
            'entry_time',
            'berthing_time',
            'duration_days',
            'wait_time_hours',
            'status',
            'status_display'
        )
        read_only_fields = ('id',)
    
    def get_duration_days(self, obj):
        if obj.arrival_time and obj.departure_time:
            delta = obj.arrival_time - obj.departure_time
            return round(delta.total_seconds() / 86400, 1)
        return None
    
    def get_wait_time_hours(self, obj):
        return obj.wait_time_hours


class VoyageDetailedSerializer(serializers.ModelSerializer):
    """Detailed voyage serializer with full route information"""
    
    vessel_details = serializers.SerializerMethodField()
    port_from_details = serializers.SerializerMethodField()
    port_to_details = serializers.SerializerMethodField()
    duration_days = serializers.SerializerMethodField()
    wait_time_hours = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    estimated_position = serializers.SerializerMethodField()
    
    class Meta:
        model = Voyage
        fields = (
            'id',
            'vessel',
            'vessel_details',
            'port_from',
            'port_from_details',
            'port_to',
            'port_to_details',
            'departure_time',
            'arrival_time',
            'entry_time',
            'berthing_time',
            'duration_days',
            'wait_time_hours',
            'status',
            'status_display',
            'progress_percentage',
            'estimated_position'
        )
        read_only_fields = ('id',)
    
    def get_vessel_details(self, obj):
        vessel = obj.vessel
        return {
            'id': vessel.id,
            'name': vessel.name,
            'imo_number': vessel.imo_number,
            'type': vessel.type,
            'flag': vessel.flag,
            'cargo_type': vessel.cargo_type,
            'operator': vessel.operator,
            'last_position_lat': vessel.last_position_lat,
            'last_position_lon': vessel.last_position_lon
        }
    
    def get_port_from_details(self, obj):
        port = obj.port_from
        return {
            'id': port.id,
            'name': port.name,
            'location': port.location,
            'country': port.country,
            'congestion_score': port.congestion_score,
            'avg_wait_time': port.avg_wait_time,
            'latitude': port.latitude,
            'longitude': port.longitude
        }
    
    def get_port_to_details(self, obj):
        port = obj.port_to
        return {
            'id': port.id,
            'name': port.name,
            'location': port.location,
            'country': port.country,
            'congestion_score': port.congestion_score,
            'avg_wait_time': port.avg_wait_time,
            'latitude': port.latitude,
            'longitude': port.longitude
        }
    
    def get_duration_days(self, obj):
        if obj.arrival_time and obj.departure_time:
            delta = obj.arrival_time - obj.departure_time
            return round(delta.total_seconds() / 86400, 1)
        return None
    
    def get_wait_time_hours(self, obj):
        return obj.wait_time_hours
    
    def get_progress_percentage(self, obj):
        from django.utils import timezone
        
        if obj.status != 'in_progress':
            return None
        
        now = timezone.now()
        if now < obj.departure_time:
            return 0
        if now > obj.arrival_time:
            return 100
        
        total_duration = (obj.arrival_time - obj.departure_time).total_seconds()
        elapsed_duration = (now - obj.departure_time).total_seconds()
        
        if total_duration == 0:
            return 0
        
        return round((elapsed_duration / total_duration) * 100, 1)
    
    def get_estimated_position(self, obj):
        if obj.status != 'in_progress':
            return None
        
        vessel = obj.vessel
        if vessel.last_position_lat and vessel.last_position_lon:
            return {
                'latitude': vessel.last_position_lat,
                'longitude': vessel.last_position_lon,
                'timestamp': vessel.last_update
            }
        
        return None