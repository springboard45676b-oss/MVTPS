from rest_framework import serializers
from .models import Vessel, VoyageHistory, Port, AlertEvent

# Milestone 4: Serializer for Historical Audit Data
class VoyageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VoyageHistory
        fields = ['id', 'latitude', 'longitude', 'timestamp']

# Milestone 2: Vessel Serializer with nested History
class VesselSerializer(serializers.ModelSerializer):
    # This matches related_name='history' in models.py
    history = VoyageHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Vessel
        fields = [
            'id', 'name', 'imo_number', 'type', 'flag', 
            'cargo_type', 'operator', 'last_position_lat', 
            'last_position_lon', 'heading', 'last_update', 'history'
        ]

# Milestone 3: Port Congestion Serializer
class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Port
        fields = '__all__'

# Milestone 3 & 4: Safety Alerts Serializer
class AlertEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertEvent
        fields = '__all__'