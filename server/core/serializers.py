from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
from .models import Vessel, VesselPosition, VesselSubscription, VesselAlert

User = get_user_model()

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
# VESSEL SERIALIZERS
# ============================================

class VesselSerializer(serializers.ModelSerializer):
    """
    Serializer for Vessel model
    Includes all vessel information and current position
    """
    class Meta:
        model = Vessel
        fields = (
            'id',
            'imo_number',
            'name',
            'type',
            'flag',
            'cargo_type',
            'operator',
            'last_position_lat',
            'last_position_lon',
            'last_update'
        )
        read_only_fields = ('id', 'last_update')


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
    Detailed vessel serializer with recent positions
    """
    recent_positions = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = (
            'id',
            'imo_number',
            'name',
            'type',
            'flag',
            'cargo_type',
            'operator',
            'last_position_lat',
            'last_position_lon',
            'last_update',
            'recent_positions'
        )
    
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