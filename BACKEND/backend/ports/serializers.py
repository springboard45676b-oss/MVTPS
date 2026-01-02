from rest_framework import serializers
from .models import Port


class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = [
            'id',
            'name',
            'country',
            'location_lat',
            'location_lon',
            'arrivals',
            'departures',
            'avg_wait_time',
            'congestion_score',
            'last_update',
        ]
