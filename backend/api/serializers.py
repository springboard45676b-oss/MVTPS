from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Port, Vessel, Voyage, Event, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'company']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'company']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'role', 'company']
    
    def create(self, validated_data):
        # Use email as username
        validated_data['username'] = validated_data['email']
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = '__all__'

class VesselSerializer(serializers.ModelSerializer):
    current_port_name = serializers.CharField(source='current_port.name', read_only=True)
    
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'imo', 'vessel_type', 'flag', 'capacity', 'current_port', 'current_port_name']

class VoyageSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    
    class Meta:
        model = Voyage
        fields = ['id', 'vessel', 'vessel_name', 'origin', 'origin_name', 'destination', 'destination_name', 'departure_date', 'estimated_arrival', 'status']

class EventSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'event_type', 'vessel', 'vessel_name', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']