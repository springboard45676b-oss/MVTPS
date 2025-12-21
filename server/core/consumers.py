# server/backend/core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import User, Notification, VesselAlert, VesselSubscription

class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    Handles notification delivery to subscribed users
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        # Only allow authenticated users
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Create a unique group for this user
        self.user_group_name = f'user_{self.user.id}'
        
        # Join the user's notification group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"User {self.user.username} connected to notifications")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave the user's group
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
        print(f"User {self.user.username} disconnected")
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_read':
                # Mark notification as read
                notification_id = data.get('notification_id')
                await self.mark_notification_as_read(notification_id)
            
            elif message_type == 'mark_all_read':
                # Mark all notifications as read for user
                await self.mark_all_notifications_as_read()
        
        except json.JSONDecodeError:
            print("Invalid JSON received")
    
    # Receive notification from group
    async def notification_message(self, event):
        """
        Receive notification from group and send to WebSocket
        Called when send_notification is invoked on the group
        """
        notification = event['notification']
        
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': notification['id'],
            'user_id': notification['user_id'],
            'vessel_id': notification['vessel_id'],
            'vessel_name': notification['vessel_name'],
            'event_id': notification.get('event_id'),
            'message': notification['message'],
            'notification_type': notification['type'],
            'timestamp': notification['timestamp'],
            'status': notification['status'],
        }))
    
    # Database operations
    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """Mark a single notification as read"""
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.status = 'read'
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        """Mark all notifications as read for the user"""
        Notification.objects.filter(user=self.user, status='unread').update(status='read')
        return True


# server/backend/core/notification_service.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification, VesselAlert, VesselSubscription, User
from django.utils import timezone

class NotificationService:
    """
    Service for sending real-time notifications via WebSocket and storing in database
    """
    
    channel_layer = get_channel_layer()
    
    @staticmethod
    def send_notification(user_id, vessel_id, event_id, message, notification_type='info'):
        """
        Send notification to a user via WebSocket and save to database
        
        Args:
            user_id: ID of user to notify
            vessel_id: ID of vessel related to notification
            event_id: ID of event that triggered notification
            message: Notification message text
            notification_type: Type of notification (info, warning, alert, update)
        """
        try:
            # Get user and vessel objects
            user = User.objects.get(id=user_id)
            
            # Create notification in database
            notification = Notification.objects.create(
                user_id=user_id,
                vessel_id=vessel_id,
                event_id=event_id,
                message=message,
                type=notification_type,
                status='unread',
                timestamp=timezone.now()
            )
            
            # Get vessel name for frontend display
            from .models import Vessel
            vessel = Vessel.objects.get(id=vessel_id)
            
            # Prepare notification data
            notification_data = {
                'type': 'notification.message',
                'notification': {
                    'id': notification.id,
                    'user_id': user.id,
                    'vessel_id': vessel_id,
                    'vessel_name': vessel.name,
                    'event_id': event_id,
                    'message': message,
                    'type': notification_type,
                    'timestamp': notification.timestamp.isoformat(),
                    'status': 'unread',
                }
            }
            
            # Send to user's WebSocket group
            user_group_name = f'user_{user_id}'
            async_to_sync(NotificationService.channel_layer.group_send)(
                user_group_name,
                notification_data
            )
            
            return notification
        
        except Exception as e:
            print(f"Error sending notification: {str(e)}")
            return None
    
    @staticmethod
    def send_vessel_alert(subscription_id, alert_type, message):
        """
        Send vessel alert to subscribed user
        
        Args:
            subscription_id: ID of vessel subscription
            alert_type: Type of alert (position_update, departure, arrival, etc.)
            message: Alert message text
        """
        try:
            subscription = VesselSubscription.objects.get(id=subscription_id)
            
            # Create alert record
            alert = VesselAlert.objects.create(
                subscription=subscription,
                alert_type=alert_type,
                message=message,
                status='sent',
            )
            
            # Also create notification
            NotificationService.send_notification(
                user_id=subscription.user_id,
                vessel_id=subscription.vessel_id,
                event_id=None,
                message=message,
                notification_type='alert'
            )
            
            return alert
        
        except Exception as e:
            print(f"Error sending vessel alert: {str(e)}")
            return None
    
    @staticmethod
    def notify_subscribed_users(vessel_id, alert_type, message, event_id=None):
        """
        Notify all users subscribed to a vessel
        
        Args:
            vessel_id: ID of vessel
            alert_type: Type of alert
            message: Alert message
            event_id: Optional event ID that triggered alert
        """
        try:
            # Get all active subscriptions for this vessel
            subscriptions = VesselSubscription.objects.filter(
                vessel_id=vessel_id,
                is_active=True
            ).select_related('user')
            
            for subscription in subscriptions:
                # Check if subscription alert type matches
                if subscription.alert_type == 'all' or subscription.alert_type == alert_type:
                    NotificationService.send_notification(
                        user_id=subscription.user_id,
                        vessel_id=vessel_id,
                        event_id=event_id,
                        message=message,
                        notification_type='alert'
                    )
        
        except Exception as e:
            print(f"Error notifying subscribed users: {str(e)}")