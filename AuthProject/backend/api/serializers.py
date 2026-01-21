from rest_framework import serializers
# 1. We added 'Voyage' to the imports here
from .models import User, Vessel, Port, Event, Voyage
from .models import VesselLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "role", "email", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'vessel_type', 'flag', 'latitude', 'longitude', 'status']

# --- NEW: VOYAGE SERIALIZER (Add this part) ---
class VoyageSerializer(serializers.ModelSerializer):
    # This grabs the vessel name so the frontend can display "Ever Given" instead of "ID: 1"
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)

    class Meta:
        model = Voyage
        fields = ['id', 'vessel_name', 'port_from', 'port_to', 'departure_time', 'arrival_time', 'status']
class VesselLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselLog
        fields = ['id', 'lat', 'lon', 'speed', 'timestamp', 'violation_status']