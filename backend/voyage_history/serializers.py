from rest_framework import serializers
from .models import VoyageReplay, VoyagePosition, ComplianceViolation

class VoyagePositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoyagePosition
        fields = ['latitude', 'longitude', 'speed', 'course', 'timestamp']

class ComplianceViolationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceViolation
        fields = ['id', 'violation_type', 'severity', 'description', 'latitude', 'longitude', 'timestamp']

class VoyageReplaySerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.vessel_name', read_only=True)
    vessel_mmsi = serializers.CharField(source='vessel.mmsi', read_only=True)
    origin_port_name = serializers.CharField(source='origin_port.name', read_only=True)
    destination_port_name = serializers.CharField(source='destination_port.name', read_only=True)
    positions = VoyagePositionSerializer(many=True, read_only=True)
    violations = ComplianceViolationSerializer(many=True, read_only=True)
    
    class Meta:
        model = VoyageReplay
        fields = ['id', 'voyage_id', 'vessel_name', 'vessel_mmsi', 'start_time', 'end_time',
                 'origin_port_name', 'destination_port_name', 'status', 'positions', 'violations']