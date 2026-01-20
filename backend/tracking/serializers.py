from rest_framework import serializers
from .models import Vessel, Position


class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = [
            'mmsi',
            'name',
            'vessel_type',
            'flag',
            'cargo',
            'destination',
            'eta',
            'speed',
            'course',
        ]


class PositionSerializer(serializers.ModelSerializer):
    vessel_mmsi = serializers.CharField(source='vessel.mmsi', read_only=True)

    class Meta:
        model = Position
        fields = [
            'vessel_mmsi',
            'latitude',
            'longitude',
            'speed',
            'course',
            'timestamp',
        ]
