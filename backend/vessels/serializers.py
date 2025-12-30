from rest_framework import serializers
from .models import Vessel, VesselPosition, VesselSubscription

class VesselPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselPosition
        fields = '__all__'

class VesselSerializer(serializers.ModelSerializer):
    latest_position = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = '__all__'
    
    def get_latest_position(self, obj):
        latest = obj.positions.first()
        if latest:
            return VesselPositionSerializer(latest).data
        return None
    
    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return VesselSubscription.objects.filter(
                user=request.user, vessel=obj
            ).exists()
        return False

class VesselSubscriptionSerializer(serializers.ModelSerializer):
    vessel = VesselSerializer(read_only=True)
    
    class Meta:
        model = VesselSubscription
        fields = '__all__'