"""
Notification Serializers
Handles notifications, vessel subscriptions, and alerts
"""

from rest_framework import serializers
from ..models import Notification, VesselSubscription, VesselAlert


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer with vessel and user details"""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    vessel_type = serializers.CharField(source='vessel.type', read_only=True)
    vessel_flag = serializers.CharField(source='vessel.flag', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_username',
            'vessel',
            'vessel_name',
            'vessel_imo',
            'vessel_type',
            'vessel_flag',
            'event',
            'message',
            'type',
            'type_display',
            'event_type',
            'event_type_display',
            'is_read',
            'timestamp',
        ]
        read_only_fields = [
            'id',
            'user_username',
            'vessel_name',
            'vessel_imo',
            'vessel_type',
            'vessel_flag',
            'type_display',
            'event_type_display',
            'timestamp',
        ]
    
    def validate_message(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError('Message cannot be empty')
        return value


class VesselSubscriptionSerializer(serializers.ModelSerializer):
    """Vessel subscription serializer with vessel details"""
    
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    vessel_details = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = VesselSubscription
        fields = [
            'id',
            'user',
            'user_username',
            'vessel',
            'vessel_name',
            'vessel_imo',
            'vessel_details',
            'is_active',
            'alert_type',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_vessel_details(self, obj):
        vessel = obj.vessel
        return {
            'id': vessel.id,
            'name': vessel.name,
            'imo_number': vessel.imo_number,
            'type': vessel.type,
            'flag': vessel.flag,
        }
    
    def create(self, validated_data):
        user = self.context['request'].user
        vessel = validated_data.get('vessel')
        alert_type = validated_data.get('alert_type', 'all')
        
        if not vessel:
            raise serializers.ValidationError({'vessel': 'Vessel is required'})
        
        subscription, created = VesselSubscription.objects.get_or_create(
            user=user,
            vessel=vessel,
            defaults={
                'is_active': True,
                'alert_type': alert_type
            }
        )
        
        if not created:
            subscription.is_active = not subscription.is_active
            subscription.alert_type = alert_type
            subscription.save()
        
        return subscription


class VesselAlertSerializer(serializers.ModelSerializer):
    """Vessel alert serializer"""
    
    subscription_vessel_name = serializers.CharField(source='subscription.vessel.name', read_only=True)
    subscription_user = serializers.CharField(source='subscription.user.username', read_only=True)
    
    class Meta:
        model = VesselAlert
        fields = [
            'id',
            'subscription',
            'subscription_vessel_name',
            'subscription_user',
            'alert_type',
            'message',
            'status',
            'created_at',
            'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']