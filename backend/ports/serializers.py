from rest_framework import serializers
from .models import Port, PortCongestion

class PortSerializer(serializers.ModelSerializer):
    current_congestion = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = ['id', 'name', 'code', 'country', 'latitude', 'longitude', 
                 'timezone', 'capacity', 'current_congestion', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_current_congestion(self, obj):
        latest = obj.congestion_data.first()
        if latest:
            return PortCongestionSerializer(latest).data
        return None

class PortCongestionSerializer(serializers.ModelSerializer):
    port_name = serializers.CharField(source='port.name', read_only=True)
    
    class Meta:
        model = PortCongestion
        fields = ['id', 'port', 'port_name', 'current_vessels', 'waiting_vessels',
                 'average_wait_time', 'congestion_level', 'timestamp']
        read_only_fields = ['id', 'timestamp']