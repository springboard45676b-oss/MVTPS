from rest_framework import serializers
from .models import Vessel, VesselPosition, Voyage

class VesselSerializer(serializers.ModelSerializer):
    current_port_name = serializers.CharField(source='current_port.name', read_only=True)
    latest_position = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'imo', 'mmsi', 'vessel_type', 'cargo_type', 'flag', 
                 'capacity', 'length', 'width', 'current_port', 'current_port_name', 
                 'latest_position', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_latest_position(self, obj):
        latest = obj.positions.first()
        if latest:
            return VesselPositionSerializer(latest).data
        return None

class VesselPositionSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    
    class Meta:
        model = VesselPosition
        fields = ['id', 'vessel', 'vessel_name', 'latitude', 'longitude', 
                 'speed', 'course', 'heading', 'status', 'timestamp', 'created_at']
        read_only_fields = ['id', 'created_at']

class VoyageSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    duration_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Voyage
        fields = ['id', 'vessel', 'vessel_name', 'origin', 'origin_name', 
                 'destination', 'destination_name', 'departure_date', 
                 'estimated_arrival', 'actual_arrival', 'status', 'distance',
                 'duration_hours', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_duration_hours(self, obj):
        if obj.actual_arrival and obj.departure_date:
            delta = obj.actual_arrival - obj.departure_date
            return round(delta.total_seconds() / 3600, 2)
        elif obj.estimated_arrival and obj.departure_date:
            delta = obj.estimated_arrival - obj.departure_date
            return round(delta.total_seconds() / 3600, 2)
        return None