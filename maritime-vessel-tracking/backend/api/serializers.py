"""
API Serializers for Maritime Vessel Tracking Platform.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Vessel, Port, Voyage, VoyageWaypoint,
    SafetyZone, Event, Notification, APISource, SystemLog
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'company', 'phone', 'is_active', 'last_activity', 
                  'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                  'first_name', 'last_name', 'role', 'company', 'phone']
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid credentials.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            attrs['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")
        
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class VesselSerializer(serializers.ModelSerializer):
    """Serializer for Vessel model."""
    
    vessel_type_display = serializers.CharField(source='get_vessel_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Vessel
        fields = '__all__'


class VesselListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vessel listings."""
    
    class Meta:
        model = Vessel
        fields = ['id', 'imo_number', 'mmsi', 'name', 'vessel_type', 'flag', 
                  'latitude', 'longitude', 'speed', 'heading', 'status', 
                  'destination', 'last_update']


class VesselPositionSerializer(serializers.ModelSerializer):
    """Serializer for vessel position updates."""
    
    class Meta:
        model = Vessel
        fields = ['id', 'latitude', 'longitude', 'speed', 'heading', 'course', 'last_update']


class PortSerializer(serializers.ModelSerializer):
    """Serializer for Port model."""
    
    class Meta:
        model = Port
        fields = '__all__'


class PortAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for port analytics data."""
    
    congestion_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = ['id', 'name', 'code', 'country', 'congestion_score', 
                  'avg_wait_time', 'arrivals_today', 'departures_today', 
                  'vessels_in_port', 'congestion_level', 'last_update']
    
    def get_congestion_level(self, obj):
        if obj.congestion_score >= 80:
            return 'high'
        elif obj.congestion_score >= 50:
            return 'medium'
        return 'low'


class VoyageWaypointSerializer(serializers.ModelSerializer):
    """Serializer for voyage waypoints."""
    
    class Meta:
        model = VoyageWaypoint
        fields = ['id', 'latitude', 'longitude', 'speed', 'heading', 'timestamp']


class VoyageSerializer(serializers.ModelSerializer):
    """Serializer for Voyage model."""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    port_from_name = serializers.CharField(source='port_from.name', read_only=True)
    port_to_name = serializers.CharField(source='port_to.name', read_only=True)
    waypoints = VoyageWaypointSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Voyage
        fields = '__all__'


class VoyageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for voyage listings."""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    port_from_name = serializers.CharField(source='port_from.name', read_only=True)
    port_to_name = serializers.CharField(source='port_to.name', read_only=True)
    
    class Meta:
        model = Voyage
        fields = ['id', 'voyage_id', 'vessel_name', 'port_from_name', 'port_to_name',
                  'departure_time', 'arrival_time', 'status']


class SafetyZoneSerializer(serializers.ModelSerializer):
    """Serializer for SafetyZone model."""
    
    zone_type_display = serializers.CharField(source='get_zone_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = SafetyZone
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model."""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    port_name = serializers.CharField(source='port.name', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'


class APISourceSerializer(serializers.ModelSerializer):
    """Serializer for APISource model."""
    
    class Meta:
        model = APISource
        fields = ['id', 'name', 'description', 'base_url', 'is_active', 
                  'last_sync', 'status', 'error_count']


class SystemLogSerializer(serializers.ModelSerializer):
    """Serializer for SystemLog model."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SystemLog
        fields = '__all__'


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    active_vessels = serializers.IntegerField()
    total_ports = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    active_voyages = serializers.IntegerField()
    vessels_by_type = serializers.DictField()
    port_congestion_avg = serializers.FloatField()
    recent_events = EventSerializer(many=True)