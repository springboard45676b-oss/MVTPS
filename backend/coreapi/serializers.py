from rest_framework import serializers
from .models import Vessel, VoyageHistory

class VoyageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VoyageHistory
        fields = ['latitude', 'longitude', 'timestamp']

class VesselSerializer(serializers.ModelSerializer):
    # This line is the fix: it tells Django to include all history points for the vessel
    history = VoyageHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Vessel
        fields = [
            'id', 'name', 'imo_number', 'type', 'flag', 
            'last_position_lat', 'last_position_lon', 'heading', 
            'history'  # Make sure 'history' is included here!
        ]