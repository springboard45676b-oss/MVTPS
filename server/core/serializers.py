from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
import math
from .models import Vessel, VesselPosition, VesselSubscription, VesselAlert

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
    username_field = 'username'  # Allow username or email
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add selected_role field for role-based login validation
        self.fields['selected_role'] = serializers.CharField(
            required=False,
            allow_blank=True,
            help_text='The role user is trying to login with (operator, analyst, admin)'
        )
    
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        selected_role = attrs.pop('selected_role', None)  # Get the role user selected during login
        
        # Try to authenticate with username first
        user = authenticate(request=self.context.get('request'), username=username_or_email, password=password)
        
        # If that fails, try with email
        if not user and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError("Invalid username/email or password.")
        
        # ROLE-BASED VALIDATION: Check if selected role matches user's actual role
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
        
        # Add custom claims
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
        # Use Django's username validator
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
        # Remove password2 from the data
        validated_data.pop('password2', None)
        
        # Create user
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
        read_only_fields = ('id', 'role')  # Role is always read-only

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
        
        # If not an admin, restrict fields
        if user.role != 'admin' and request and request.user.role != 'admin':
            # Non-admins can only update username and email
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
        # Handle password separately since it needs special handling
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


# ============================================
# VESSEL SERIALIZERS (UPDATED WITH CALCULATIONS)
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
    
    class Meta:
        model = VesselSubscription
        fields = ('id', 'user', 'vessel', 'vessel_name', 'vessel_imo', 'is_active', 'alert_type', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class VesselAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for vessel alerts
    """
    vessel_name = serializers.CharField(source='subscription.vessel.name', read_only=True)
    
    class Meta:
        model = VesselAlert
        fields = ('id', 'subscription', 'vessel_name', 'alert_type', 'message', 'status', 'created_at', 'read_at')
        read_only_fields = ('id', 'created_at')

# server/backend/core/serializers.py - UPDATED (NO STATUS FIELD)

from rest_framework import serializers
from .models import Notification, VesselAlert, VesselSubscription, Vessel


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    event_type = serializers.CharField(source='event.event_type', read_only=True, allow_null=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_username',
            'vessel',
            'vessel_name',
            'event',
            'event_type',
            'message',
            'type',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp', 'user', 'vessel', 'event']


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


class VesselSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for VesselSubscription model"""
    vessel_details = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = VesselSubscription
        fields = [
            'id',
            'user',
            'user_username',
            'vessel',
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
        
        # Check if subscription already exists
        subscription, created = VesselSubscription.objects.get_or_create(
            user=user,
            vessel=vessel,
            defaults={
                'is_active': True,
                'alert_type': alert_type
            }
        )
        
        # If it exists, toggle is_active and update alert_type
        if not created:
            subscription.is_active = not subscription.is_active
            subscription.alert_type = alert_type
            subscription.save()
        
        return subscription