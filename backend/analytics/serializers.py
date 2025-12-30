from rest_framework import serializers
from .models import Voyage, VoyageEvent
from vessels.serializers import VesselSerializer
from ports.serializers import PortSerializer

class VoyageEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoyageEvent
        fields = '__all__'

class VoyageSerializer(serializers.ModelSerializer):
    vessel = VesselSerializer(read_only=True)
    origin_port = PortSerializer(read_only=True)
    destination_port = PortSerializer(read_only=True)
    events = VoyageEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Voyage
        fields = '__all__'