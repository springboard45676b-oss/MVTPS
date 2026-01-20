from rest_framework import serializers
from .models import Vessel, VesselPosition, VesselSubscription, Voyage, RealTimeDataSubscription

class VesselPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselPosition
        fields = '__all__'

class VoyageSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_mmsi = serializers.CharField(source='vessel.mmsi', read_only=True)
    duration_display = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Voyage
        fields = '__all__'

class VesselSerializer(serializers.ModelSerializer):
    latest_position = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    active_voyage = serializers.SerializerMethodField()
    voyage_count = serializers.SerializerMethodField()
    
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
    
    def get_active_voyage(self, obj):
        active_voyage = obj.vessel_voyages.filter(status='active').first()
        if active_voyage:
            return VoyageSerializer(active_voyage).data
        return None
    
    def get_voyage_count(self, obj):
        return obj.vessel_voyages.count()

class VesselSubscriptionSerializer(serializers.ModelSerializer):
    vessel = VesselSerializer(read_only=True)
    
    class Meta:
        model = VesselSubscription
        fields = '__all__'

class RealTimeDataSubscriptionSerializer(serializers.ModelSerializer):
    vessels = VesselSerializer(many=True, read_only=True)
    vessel_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    notification_types_display = serializers.ReadOnlyField(source='get_notification_types_display')
    
    class Meta:
        model = RealTimeDataSubscription
        fields = '__all__'
    
    def create(self, validated_data):
        vessel_ids = validated_data.pop('vessel_ids', [])
        subscription = RealTimeDataSubscription.objects.create(**validated_data)
        
        if vessel_ids:
            vessels = Vessel.objects.filter(id__in=vessel_ids)
            subscription.vessels.set(vessels)
        
        return subscription
    
    def update(self, instance, validated_data):
        vessel_ids = validated_data.pop('vessel_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if vessel_ids is not None:
            vessels = Vessel.objects.filter(id__in=vessel_ids)
            instance.vessels.set(vessels)
        
        return instance