from django.contrib.auth.models import User
from rest_framework import serializers
from accounts.models import UserProfile, ROLE_CHOICES


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=ROLE_CHOICES, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already in use.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already in use.')
        return value

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        role = validated_data.pop('role')
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile with role
        UserProfile.objects.create(user=user, role=role)
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=1)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password.')
        
        if not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')
        
        data['user'] = user
        return data


# Additional serializers can be added here as needed for other models
# ===============================
# Vessel & Position Serializers
# (Milestone-2)
# ===============================

from .models import Vessel, VesselPosition


class VesselSerializer(serializers.ModelSerializer):
    normalized_cargo = serializers.SerializerMethodField()
    class Meta:
        model = Vessel
        fields = [
            'imo_number',
            'name',
            'type',
            'flag',
            'cargo_type',
            'normalized_cargo',
            'operator',
            'last_position_lat',
            'last_position_lon',
            'last_update',
        ]
    def get_normalized_cargo(self, obj):
        return obj.get_normalized_cargo()


class VesselPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselPosition
        fields = [
            'latitude',
            'longitude',
            'speed',
            'course',
            'timestamp',
        ]
