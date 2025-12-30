from rest_framework import serializers
from .models import Port, PortCongestion

class PortCongestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortCongestion
        fields = '__all__'

class PortSerializer(serializers.ModelSerializer):
    latest_congestion = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = '__all__'
    
    def get_latest_congestion(self, obj):
        latest = obj.congestion_data.first()
        if latest:
            return PortCongestionSerializer(latest).data
        return None