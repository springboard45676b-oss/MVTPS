from rest_framework import serializers
from .models import Port, Vessel, Voyage

class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = "__all__"

class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = "__all__"

class VoyageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voyage
        fields = "__all__"
