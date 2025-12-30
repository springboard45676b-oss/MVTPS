"""
Notification Service
Handles creation and management of vessel notifications
"""

from django.utils import timezone
from .models import Notification, NotificationPreference
from vessels.models import VesselSubscription, VesselPosition
from authentication.models import User

class NotificationService:
    
    @staticmethod
    def create_notification(user, vessel, notification_type, title, message, priority='medium', data=None):
        """Create a new notification for a user"""
        try:
            notification = Notification.objects.create(
                user=user,
                vessel=vessel,
                notification_type=notification_type,
                priority=priority,
                title=title,
                message=message,
                data=data or {}
            )
            return notification
        except Exception as e:
            print(f"Error creating notification: {e}")
            return None
    
    @staticmethod
    def notify_vessel_position_update(vessel, new_position):
        """Notify subscribers about vessel position updates"""
        subscriptions = VesselSubscription.objects.filter(vessel=vessel)
        
        for subscription in subscriptions:
            user = subscription.user
            
            # Check user preferences
            try:
                preferences = user.notification_preferences
                if not preferences.app_position_updates:
                    continue
            except NotificationPreference.DoesNotExist:
                # Default to sending notifications if no preferences set
                pass
            
            # Get previous position for comparison
            previous_positions = VesselPosition.objects.filter(
                vessel=vessel
            ).exclude(id=new_position.id).order_by('-timestamp')[:1]
            
            if previous_positions:
                prev_pos = previous_positions[0]
                distance_moved = NotificationService._calculate_distance(
                    prev_pos.latitude, prev_pos.longitude,
                    new_position.latitude, new_position.longitude
                )
                
                title = f"{vessel.name} Position Update"
                message = f"Vessel has moved {distance_moved:.1f} km. Current speed: {new_position.speed or 0} knots."
                
                NotificationService.create_notification(
                    user=user,
                    vessel=vessel,
                    notification_type='position_update',
                    title=title,
                    message=message,
                    priority='low',
                    data={
                        'latitude': new_position.latitude,
                        'longitude': new_position.longitude,
                        'speed': new_position.speed,
                        'course': new_position.course,
                        'distance_moved': distance_moved
                    }
                )
    
    @staticmethod
    def notify_vessel_status_change(vessel, old_status, new_status):
        """Notify subscribers about vessel status changes"""
        subscriptions = VesselSubscription.objects.filter(vessel=vessel)
        
        for subscription in subscriptions:
            user = subscription.user
            
            # Check user preferences
            try:
                preferences = user.notification_preferences
                if not preferences.app_status_changes:
                    continue
            except NotificationPreference.DoesNotExist:
                pass
            
            priority = 'medium'
            if new_status in ['Emergency', 'Distress', 'Aground']:
                priority = 'critical'
            elif new_status in ['At anchor', 'Moored', 'In port']:
                priority = 'medium'
            
            title = f"{vessel.name} Status Changed"
            message = f"Vessel status changed from '{old_status}' to '{new_status}'"
            
            NotificationService.create_notification(
                user=user,
                vessel=vessel,
                notification_type='status_change',
                title=title,
                message=message,
                priority=priority,
                data={
                    'old_status': old_status,
                    'new_status': new_status
                }
            )
    
    @staticmethod
    def notify_port_activity(vessel, port, activity_type):
        """Notify subscribers about port arrivals/departures"""
        subscriptions = VesselSubscription.objects.filter(vessel=vessel)
        
        for subscription in subscriptions:
            user = subscription.user
            
            # Check user preferences
            try:
                preferences = user.notification_preferences
                if not preferences.app_port_activities:
                    continue
            except NotificationPreference.DoesNotExist:
                pass
            
            if activity_type == 'arrival':
                title = f"{vessel.name} Arrived at Port"
                message = f"Vessel has arrived at {port.name} ({port.code})"
                notification_type = 'port_arrival'
            else:
                title = f"{vessel.name} Departed from Port"
                message = f"Vessel has departed from {port.name} ({port.code})"
                notification_type = 'port_departure'
            
            NotificationService.create_notification(
                user=user,
                vessel=vessel,
                notification_type=notification_type,
                title=title,
                message=message,
                priority='medium',
                data={
                    'port_name': port.name,
                    'port_code': port.code,
                    'activity_type': activity_type
                }
            )
    
    @staticmethod
    def notify_speed_change(vessel, old_speed, new_speed):
        """Notify subscribers about significant speed changes"""
        speed_diff = abs(new_speed - old_speed)
        
        # Only notify for significant speed changes (>5 knots)
        if speed_diff < 5:
            return
        
        subscriptions = VesselSubscription.objects.filter(vessel=vessel)
        
        for subscription in subscriptions:
            user = subscription.user
            
            priority = 'low'
            if new_speed == 0 and old_speed > 10:
                priority = 'medium'  # Vessel stopped
                title = f"{vessel.name} Stopped"
                message = f"Vessel has stopped (speed changed from {old_speed:.1f} to {new_speed:.1f} knots)"
            elif new_speed > 20 and old_speed < 10:
                priority = 'medium'  # Vessel started moving fast
                title = f"{vessel.name} Speed Increased"
                message = f"Vessel speed increased significantly (from {old_speed:.1f} to {new_speed:.1f} knots)"
            else:
                title = f"{vessel.name} Speed Changed"
                message = f"Vessel speed changed from {old_speed:.1f} to {new_speed:.1f} knots"
            
            NotificationService.create_notification(
                user=user,
                vessel=vessel,
                notification_type='speed_change',
                title=title,
                message=message,
                priority=priority,
                data={
                    'old_speed': old_speed,
                    'new_speed': new_speed,
                    'speed_difference': speed_diff
                }
            )
    
    @staticmethod
    def notify_subscription_created(user, vessel):
        """Notify user about successful vessel subscription"""
        title = f"Subscribed to {vessel.name}"
        message = f"You will now receive notifications about {vessel.name} ({vessel.mmsi})"
        
        NotificationService.create_notification(
            user=user,
            vessel=vessel,
            notification_type='subscription',
            title=title,
            message=message,
            priority='low',
            data={
                'action': 'subscribed'
            }
        )
    
    @staticmethod
    def notify_emergency_alert(vessel, alert_message):
        """Notify subscribers about emergency alerts"""
        subscriptions = VesselSubscription.objects.filter(vessel=vessel)
        
        for subscription in subscriptions:
            user = subscription.user
            
            title = f"🚨 EMERGENCY: {vessel.name}"
            message = f"Emergency alert for {vessel.name}: {alert_message}"
            
            NotificationService.create_notification(
                user=user,
                vessel=vessel,
                notification_type='emergency',
                title=title,
                message=message,
                priority='critical',
                data={
                    'alert_message': alert_message,
                    'emergency': True
                }
            )
    
    @staticmethod
    def _calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates in kilometers"""
        import math
        
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r

# Global instance
notification_service = NotificationService()