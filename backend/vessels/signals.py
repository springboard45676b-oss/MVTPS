from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import VesselPosition, VesselAlert, VesselSubscription
from decimal import Decimal
import math

User = get_user_model()
channel_layer = get_channel_layer()


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in nautical miles"""
    R = 3440.065  # Earth's radius in nautical miles
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


@receiver(post_save, sender=VesselPosition)
def vessel_position_updated(sender, instance, created, **kwargs):
    """Handle vessel position updates and trigger alerts"""
    vessel = instance.vessel
    
    # Get all active subscriptions for this vessel
    subscriptions = VesselSubscription.objects.filter(
        vessel=vessel,
        is_active=True
    ).select_related('user')
    
    for subscription in subscriptions:
        user = subscription.user
        user_group = f"user_{user.id}_alerts"
        
        # Check speed threshold alerts
        if 'speed' in subscription.alert_types and subscription.speed_threshold:
            if instance.speed and instance.speed > subscription.speed_threshold:
                alert = VesselAlert.objects.create(
                    user=user,
                    vessel=vessel,
                    alert_type='speed',
                    message=f"Speed alert: {vessel.name} is traveling at {instance.speed:.1f} knots (threshold: {subscription.speed_threshold} knots)"
                )
                
                # Send WebSocket alert
                async_to_sync(channel_layer.group_send)(
                    user_group,
                    {
                        'type': 'vessel_alert',
                        'alert': {
                            'id': alert.id,
                            'vessel': {
                                'id': vessel.id,
                                'name': vessel.name,
                                'mmsi': vessel.mmsi
                            },
                            'alert_type': alert.alert_type,
                            'message': alert.message,
                            'created_at': alert.created_at.isoformat()
                        }
                    }
                )
        
        # Check port entry/exit alerts (simplified - would need port data for full implementation)
        if 'port' in subscription.alert_types:
            # Get previous position for comparison
            previous_positions = VesselPosition.objects.filter(
                vessel=vessel
            ).exclude(id=instance.id).order_by('-timestamp')[:1]
            
            if previous_positions.exists():
                prev_pos = previous_positions.first()
                # Simple port proximity check (would need actual port data)
                # This is a placeholder for real port detection logic
                distance_moved = calculate_distance(
                    prev_pos.latitude, prev_pos.longitude,
                    instance.latitude, instance.longitude
                )
                
                # If vessel moved significantly, it might be entering/exiting a port area
                if distance_moved > 10:  # 10 nautical miles threshold
                    alert = VesselAlert.objects.create(
                        user=user,
                        vessel=vessel,
                        alert_type='port',
                        message=f"Port activity: {vessel.name} has moved significantly (position updated at {instance.timestamp})"
                    )
                    
                    # Send WebSocket alert
                    async_to_sync(channel_layer.group_send)(
                        user_group,
                        {
                            'type': 'vessel_alert',
                            'alert': {
                                'id': alert.id,
                                'vessel': {
                                    'id': vessel.id,
                                    'name': vessel.name,
                                    'mmsi': vessel.mmsi
                                },
                                'alert_type': alert.alert_type,
                                'message': alert.message,
                                'created_at': alert.created_at.isoformat()
                            }
                        }
                    )
        
        # Send position update to user's position group
        position_group = f"user_{user.id}_positions"
        async_to_sync(channel_layer.group_send)(
            position_group,
            {
                'type': 'vessel_position_update',
                'vessel': {
                    'id': vessel.id,
                    'name': vessel.name,
                    'mmsi': vessel.mmsi
                },
                'position': {
                    'latitude': instance.latitude,
                    'longitude': instance.longitude,
                    'speed': instance.speed,
                    'course': instance.course,
                    'heading': instance.heading,
                    'timestamp': instance.timestamp.isoformat()
                }
            }
        )
