from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
import math
from .models import Vessel, VesselPosition, VesselSubscription, VesselAlert, Notification, PiracyZone, Country, WeatherAlert

User = get_user_model()

# ============================================
# POSITION CALCULATOR
# ============================================

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


# ============================================
# USER SERIALIZERS
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving user information.
    Used for /profile/ endpoint (viewing profile).
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'created_at')
        read_only_fields = ('id', 'created_at', 'role')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['selected_role'] = serializers.CharField(
            required=False,
            allow_blank=True,
            help_text='The role user is trying to login with (operator, analyst, admin)'
        )
    
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        selected_role = attrs.pop('selected_role', None)
        
        user = authenticate(request=self.context.get('request'), username=username_or_email, password=password)
        
        if not user and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError("Invalid username/email or password.")
        
        if selected_role:
            if user.role != selected_role:
                raise serializers.ValidationError(
                    f"Your account is registered as '{user.role.title()}', "
                    f"but you're trying to login as '{selected_role.title()}'. "
                    f"Please select the correct role and try again."
                )
        
        refresh = self.get_token(user)
        data = {}
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all(), message='A user with this username already exists.')],
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message='A user with this email already exists.')]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(
        choices=[User.ROLE_OPERATOR, User.ROLE_ANALYST, User.ROLE_ADMIN],
        error_messages={
            'invalid_choice': 'Role must be either "operator", "analyst", or "admin".',
        }
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role')

    def validate_username(self, value):
        from django.contrib.auth.validators import UnicodeUsernameValidator
        validator = UnicodeUsernameValidator()
        try:
            validator(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', User.ROLE_OPERATOR)
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    Operators and Analysts can only edit username and email.
    Admins can edit anything except role.
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    username = serializers.CharField(
        required=False,
        max_length=150,
        validators=[UniqueValidator(
            queryset=User.objects.all(), 
            message='A user with this username already exists.'
        )],
    )
    
    email = serializers.EmailField(
        required=False,
        validators=[UniqueValidator(
            queryset=User.objects.all(), 
            message='A user with this email already exists.'
        )]
    )
    
    role = serializers.ChoiceField(
        choices=['operator', 'analyst', 'admin'],
        required=False,
        error_messages={
            'invalid_choice': 'Role must be either "operator", "analyst", or "admin".',
        }
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        read_only_fields = ('id', 'role')

    def validate_password(self, value):
        """Only validate password if it's being provided"""
        if value:
            validate_password(value)
        return value

    def validate(self, data):
        """
        Additional validation:
        - Operators and Analysts can only edit username and email
        - Admins can edit username, email, and password
        """
        user = self.instance
        request = self.context.get('request')
        
        if user.role != 'admin' and request and request.user.role != 'admin':
            allowed_fields = {'username', 'email'}
            provided_fields = set(data.keys())
            restricted_fields = provided_fields - allowed_fields
            
            if restricted_fields:
                raise serializers.ValidationError(
                    f"Users with '{user.role}' role can only edit username and email. "
                    f"You cannot modify: {', '.join(restricted_fields)}"
                )
        
        return data

    def update(self, instance, validated_data):
        """Update user profile with new data"""
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


# ============================================
# VESSEL SERIALIZERS
# ============================================

class VesselSerializer(serializers.ModelSerializer):
    """
    Serializer for Vessel model with calculated speed and course
    Speed and course are calculated on-the-fly from position history
    """
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
        except Exception as e:
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
        except Exception as e:
            return None


class VesselPositionSerializer(serializers.ModelSerializer):
    """
    Serializer for VesselPosition model
    Used for position history tracking
    """
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
    """
    Detailed vessel serializer with calculated speed/course and recent positions
    """
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
        """Calculate current speed from last two positions"""
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
        """Calculate current course from last two positions"""
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


# ============================================
# SUBSCRIPTION & ALERT SERIALIZERS
# ============================================

class VesselSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for vessel subscriptions
    """
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    vessel_details = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = VesselSubscription
        fields = [
            'id',
            'user',
            'user_username',
            'vessel',
            'vessel_name',
            'vessel_imo',
            'vessel_details',
            'is_active',
            'alert_type',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_vessel_details(self, obj):
        """Include basic vessel information"""
        vessel = obj.vessel
        return {
            'id': vessel.id,
            'name': vessel.name,
            'imo_number': vessel.imo_number,
            'type': vessel.type,
            'flag': vessel.flag,
        }
    
    def create(self, validated_data):
        """
        Handle subscription creation or toggle
        If subscription exists, toggle is_active
        """
        user = self.context['request'].user
        vessel = validated_data.get('vessel')
        alert_type = validated_data.get('alert_type', 'all')
        
        if not vessel:
            raise serializers.ValidationError({'vessel': 'Vessel is required'})
        
        subscription, created = VesselSubscription.objects.get_or_create(
            user=user,
            vessel=vessel,
            defaults={
                'is_active': True,
                'alert_type': alert_type
            }
        )
        
        if not created:
            subscription.is_active = not subscription.is_active
            subscription.alert_type = alert_type
            subscription.save()
        
        return subscription


class VesselAlertSerializer(serializers.ModelSerializer):
    """Serializer for VesselAlert model"""
    subscription_vessel_name = serializers.CharField(source='subscription.vessel.name', read_only=True)
    subscription_user = serializers.CharField(source='subscription.user.username', read_only=True)
    
    class Meta:
        model = VesselAlert
        fields = [
            'id',
            'subscription',
            'subscription_vessel_name',
            'subscription_user',
            'alert_type',
            'message',
            'status',
            'created_at',
            'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


# ============================================
# NOTIFICATION SERIALIZERS
# ============================================

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    Includes is_read and event_type fields
    """
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    vessel_type = serializers.CharField(source='vessel.type', read_only=True)
    vessel_flag = serializers.CharField(source='vessel.flag', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_username',
            'vessel',
            'vessel_name',
            'vessel_imo',
            'vessel_type',
            'vessel_flag',
            'event',
            'message',
            'type',
            'type_display',
            'event_type',
            'event_type_display',
            'is_read',
            'timestamp',
        ]
        read_only_fields = [
            'id',
            'user_username',
            'vessel_name',
            'vessel_imo',
            'vessel_type',
            'vessel_flag',
            'type_display',
            'event_type_display',
            'timestamp',
        ]
    
    def validate_message(self, value):
        """Validate message field"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError('Message cannot be empty')
        return value
    
# Add these updated serializers to your server/core/serializers.py

from .models import Port, Voyage
from rest_framework import serializers

# ============================================
# PORT SERIALIZERS
# ============================================

class PortSerializer(serializers.ModelSerializer):
    """
    Serializer for Port model with congestion and wait time data
    """
    congestion_level = serializers.SerializerMethodField()
    status_indicator = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = (
            'id',
            'name',
            'location',
            'country',
            'latitude',
            'longitude',
            'congestion_score',
            'congestion_level',
            'avg_wait_time',
            'arrivals',
            'departures',
            'last_update',
            'status_indicator'
        )
        read_only_fields = ('id', 'last_update')
    
    def get_congestion_level(self, obj):
        """Calculate congestion level based on score"""
        if obj.congestion_score < 3:
            return 'low'
        elif obj.congestion_score < 6:
            return 'moderate'
        elif obj.congestion_score < 8:
            return 'high'
        else:
            return 'critical'
    
    def get_status_indicator(self, obj):
        """Get status color indicator"""
        level = self.get_congestion_level(obj)
        indicators = {
            'low': 'green',
            'moderate': 'yellow',
            'high': 'orange',
            'critical': 'red'
        }
        return indicators.get(level, 'gray')


class PortDetailedSerializer(serializers.ModelSerializer):
    """
    Detailed port serializer with statistics, wait times, and recent voyages
    """
    congestion_level = serializers.SerializerMethodField()
    status_indicator = serializers.SerializerMethodField()
    total_traffic = serializers.SerializerMethodField()
    turnover_rate = serializers.SerializerMethodField()
    recent_arrivals = serializers.SerializerMethodField()
    recent_departures = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = (
            'id',
            'name',
            'location',
            'country',
            'latitude',
            'longitude',
            'congestion_score',
            'congestion_level',
            'avg_wait_time',
            'arrivals',
            'departures',
            'total_traffic',
            'turnover_rate',
            'last_update',
            'status_indicator',
            'statistics',
            'recent_arrivals',
            'recent_departures'
        )
        read_only_fields = ('id', 'last_update')
    
    def get_congestion_level(self, obj):
        """Calculate congestion level"""
        if obj.congestion_score < 3:
            return 'low'
        elif obj.congestion_score < 6:
            return 'moderate'
        elif obj.congestion_score < 8:
            return 'high'
        else:
            return 'critical'
    
    def get_status_indicator(self, obj):
        """Get status color"""
        level = self.get_congestion_level(obj)
        indicators = {
            'low': 'green',
            'moderate': 'yellow',
            'high': 'orange',
            'critical': 'red'
        }
        return indicators.get(level, 'gray')
    
    def get_total_traffic(self, obj):
        """Total arrivals + departures"""
        return obj.arrivals + obj.departures
    
    def get_turnover_rate(self, obj):
        """Calculate port efficiency (departures/arrivals ratio)"""
        if obj.arrivals == 0:
            return 0
        return round((obj.departures / obj.arrivals) * 100, 2)
    
    def get_statistics(self, obj):
        """Get comprehensive port statistics"""
        completed_arrivals = Voyage.objects.filter(
            port_to=obj,
            status='completed'
        )
        
        wait_times = []
        for voyage in completed_arrivals:
            if voyage.wait_time_hours is not None:
                wait_times.append(voyage.wait_time_hours)
        
        return {
            'congestion': {
                'score': round(obj.congestion_score, 2),
                'level': self.get_congestion_level(obj),
                'avg_wait_time_hours': round(obj.avg_wait_time, 2)
            },
            'traffic': {
                'total': {
                    'arrivals': obj.arrivals,
                    'departures': obj.departures
                },
                'last_30_days': {
                    'arrivals': obj.arrivals,  # In production, filter by date
                    'departures': obj.departures
                },
                'current_activity': {
                    'incoming_vessels': Voyage.objects.filter(
                        port_to=obj,
                        status='in_progress'
                    ).count(),
                    'outgoing_vessels': Voyage.objects.filter(
                        port_from=obj,
                        status='in_progress'
                    ).count()
                }
            },
            'performance': {
                'completed_arrivals': completed_arrivals.count(),
                'turnover_rate': round((obj.departures / obj.arrivals * 100) if obj.arrivals > 0 else 0, 2),
                'avg_wait_time_hours': round(obj.avg_wait_time, 2)
            }
        }
    
    def get_recent_arrivals(self, obj):
        """Get last 5 vessels that arrived at this port"""
        from django.utils import timezone
        
        recent_voyages = Voyage.objects.filter(
            port_to=obj,
            arrival_time__lte=timezone.now(),
            status='completed'
        ).select_related('vessel').order_by('-arrival_time')[:5]
        
        return [{
            'vessel_name': v.vessel.name,
            'vessel_imo': v.vessel.imo_number,
            'arrival_time': v.arrival_time.isoformat(),
            'from_port': v.port_from.name,
            'wait_time_hours': v.wait_time_hours
        } for v in recent_voyages]
    
    def get_recent_departures(self, obj):
        """Get last 5 vessels that departed from this port"""
        from django.utils import timezone
        
        recent_voyages = Voyage.objects.filter(
            port_from=obj,
            departure_time__lte=timezone.now()
        ).select_related('vessel').order_by('-departure_time')[:5]
        
        return [{
            'vessel_name': v.vessel.name,
            'vessel_imo': v.vessel.imo_number,
            'departure_time': v.departure_time.isoformat(),
            'to_port': v.port_to.name,
            'status': v.status
        } for v in recent_voyages]


# ============================================
# VOYAGE SERIALIZERS
# ============================================

class VoyageSerializer(serializers.ModelSerializer):
    """
    Serializer for Voyage model with vessel and port details + wait time
    """
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
        """Calculate voyage duration in days"""
        if obj.arrival_time and obj.departure_time:
            delta = obj.arrival_time - obj.departure_time
            return round(delta.total_seconds() / 86400, 1)
        return None
    
    def get_wait_time_hours(self, obj):
        """Return calculated wait time in hours"""
        return obj.wait_time_hours


class VoyageDetailedSerializer(serializers.ModelSerializer):
    """
    Detailed voyage serializer with full vessel info, route details, and wait time
    """
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
        """Get full vessel information"""
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
        """Get departure port details"""
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
        """Get arrival port details"""
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
        """Calculate voyage duration"""
        if obj.arrival_time and obj.departure_time:
            delta = obj.arrival_time - obj.departure_time
            return round(delta.total_seconds() / 86400, 1)
        return None
    
    def get_wait_time_hours(self, obj):
        """Return calculated wait time in hours"""
        return obj.wait_time_hours
    
    def get_progress_percentage(self, obj):
        """Calculate voyage progress percentage for in_progress voyages"""
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
        """Estimate current position for in_progress voyages"""
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
    
class PiracyZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = PiracyZone
        fields = ['id', 'name', 'latitude', 'longitude', 'risk_level', 
                  'incidents_90_days', 'last_incident_date', 'radius_km', 'description', 'is_active']
        
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'latitude', 'longitude', 'continent']

class WeatherAlertSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    weather_type_display = serializers.CharField(source='get_weather_type_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = WeatherAlert
        fields = [
            'id', 'name', 'latitude', 'longitude', 
            'severity', 'severity_display',
            'weather_type', 'weather_type_display',
            'radius_km', 'description',
            'alert_issued', 'alert_expires', 'is_expired',
            'wind_speed_kmh', 'wave_height_m', 'visibility_km',
            'is_active', 'updated_at'
        ]
from rest_framework import serializers
from .models import UserAction

class UserActionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    status_display = serializers.CharField(source='get_status_code_display', read_only=True)
    is_successful = serializers.BooleanField(read_only=True)
    is_error = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserAction
        fields = [
            'id', 'username', 'action', 'action_display', 'status_code', 'status_display',
            'endpoint', 'method', 'ip_address', 'related_object_type', 'related_object_id',
            'timestamp', 'duration_ms', 'is_successful', 'is_error', 'error_message'
        ]