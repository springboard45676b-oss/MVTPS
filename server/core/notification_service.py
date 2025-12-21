# server/backend/core/notification_service.py

from .models import Notification, VesselSubscription, Vessel, User
from django.utils import timezone

class NotificationService:
    """
    Service for sending real-time notifications via WebSocket
    Triggers notifications when vessel positions are updated
    
    NOTE: WebSocket functionality requires channels to be installed and Daphne server to be running
    For development without channels, this will just save notifications to the database
    """
    
    channel_layer = None
    
    @staticmethod
    def _get_channel_layer():
        """Lazily import and return channel layer if available"""
        if NotificationService.channel_layer is not None:
            return NotificationService.channel_layer
        
        try:
            from channels.layers import get_channel_layer
            NotificationService.channel_layer = get_channel_layer()
            return NotificationService.channel_layer
        except ImportError:
            return None
    
    @staticmethod
    def send_notification(user_id, vessel_id, message, notification_type='info'):
        """
        Send notification to a user via WebSocket and save to database
        
        Args:
            user_id: ID of user to notify
            vessel_id: ID of vessel related to notification
            message: Notification message text
            notification_type: Type of notification (info, warning, alert, update)
        """
        try:
            # Get user and vessel objects
            user = User.objects.get(id=user_id)
            vessel = Vessel.objects.get(id=vessel_id)
            
            # Create notification in database
            notification = Notification.objects.create(
                user_id=user_id,
                vessel_id=vessel_id,
                event_id=None,
                message=message,
                type=notification_type,
                timestamp=timezone.now()
            )
            
            # Try to send via WebSocket if channels is available
            channel_layer = NotificationService._get_channel_layer()
            if channel_layer:
                try:
                    from asgiref.sync import async_to_sync
                    
                    # Prepare notification data for WebSocket
                    notification_data = {
                        'type': 'notification.message',
                        'notification': {
                            'id': notification.id,
                            'user_id': user.id,
                            'vessel_id': vessel_id,
                            'vessel_name': vessel.name,
                            'event_id': None,
                            'message': message,
                            'notification_type': notification_type,
                            'timestamp': notification.timestamp.isoformat(),
                        }
                    }
                    
                    # Send to user's WebSocket group
                    user_group_name = f'user_{user_id}'
                    async_to_sync(channel_layer.group_send)(
                        user_group_name,
                        notification_data
                    )
                    print(f"✅ WebSocket notification sent to {user.username} for {vessel.name}")
                except Exception as ws_error:
                    print(f"⚠️ WebSocket send skipped (not using Daphne): {str(ws_error)}")
            else:
                print(f"ℹ️ Notification saved to DB for {user.username} (WebSocket not available)")
            
            return notification
        
        except User.DoesNotExist:
            print(f"❌ User {user_id} not found")
            return None
        except Vessel.DoesNotExist:
            print(f"❌ Vessel {vessel_id} not found")
            return None
        except Exception as e:
            print(f"❌ Error sending notification: {str(e)}")
            return None
    
    @staticmethod
    def notify_subscribed_users(vessel_id, alert_type, message):
        """
        Notify all users subscribed to a vessel
        
        Args:
            vessel_id: ID of vessel
            alert_type: Type of alert (position_update, departure, arrival)
            message: Alert message text
        """
        try:
            # Get all active subscriptions for this vessel
            subscriptions = VesselSubscription.objects.filter(
                vessel_id=vessel_id,
                is_active=True
            ).select_related('user', 'vessel')
            
            count = 0
            for subscription in subscriptions:
                # Check if subscription alert type matches
                if subscription.alert_type == 'all' or subscription.alert_type == alert_type:
                    NotificationService.send_notification(
                        user_id=subscription.user_id,
                        vessel_id=vessel_id,
                        message=message,
                        notification_type='alert'
                    )
                    count += 1
            
            if count > 0:
                print(f"✅ Notified {count} users about {alert_type} for vessel {vessel_id}")
            else:
                print(f"ℹ️ No active subscriptions for vessel {vessel_id}")
        
        except Exception as e:
            print(f"❌ Error notifying subscribed users: {str(e)}")
    
    @staticmethod
    def notify_position_update(vessel_id, latitude, longitude, speed):
        """
        Notify subscribed users about vessel position update
        
        Args:
            vessel_id: ID of vessel
            latitude: New latitude
            longitude: New longitude
            speed: Vessel speed in knots
        """
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            message = f"📍 {vessel.name} position updated: {latitude:.4f}°, {longitude:.4f}° | Speed: {speed:.1f} knots"
            
            NotificationService.notify_subscribed_users(
                vessel_id=vessel_id,
                alert_type='position_update',
                message=message
            )
        except Exception as e:
            print(f"❌ Error in notify_position_update: {str(e)}")