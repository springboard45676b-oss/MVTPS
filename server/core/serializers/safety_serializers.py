"""
Safety Serializers
Handles piracy zones, weather alerts, and country data
"""

from rest_framework import serializers
from ..models import PiracyZone, WeatherAlert, Country


class PiracyZoneSerializer(serializers.ModelSerializer):
    """Piracy zone serializer with risk information"""
    
    class Meta:
        model = PiracyZone
        fields = [
            'id',
            'name',
            'latitude',
            'longitude',
            'risk_level',
            'incidents_90_days',
            'last_incident_date',
            'radius_km',
            'description',
            'is_active'
        ]


class WeatherAlertSerializer(serializers.ModelSerializer):
    """Weather alert serializer with severity information"""
    
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    weather_type_display = serializers.CharField(source='get_weather_type_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = WeatherAlert
        fields = [
            'id',
            'name',
            'latitude',
            'longitude',
            'severity',
            'severity_display',
            'weather_type',
            'weather_type_display',
            'radius_km',
            'description',
            'alert_issued',
            'alert_expires',
            'is_expired',
            'wind_speed_kmh',
            'wave_height_m',
            'visibility_km',
            'is_active',
            'updated_at'
        ]


class CountrySerializer(serializers.ModelSerializer):
    """Country serializer with geographic information"""
    
    class Meta:
        model = Country
        fields = ['id', 'name', 'latitude', 'longitude', 'continent']