from rest_framework import serializers
from .models import User, Vessel, Port, Event

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "role", "email", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# --- NEW SERIALIZER FOR MAP (Milestone 2) ---
class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = ['id', 'name', 'vessel_type', 'flag', 'latitude', 'longitude', 'status']