import json
import traceback
from channels.generic.websocket import AsyncWebsocketConsumer # type: ignore
from channels.db import database_sync_to_async # type: ignore
from django.utils import timezone
from .models import User, Notification, VesselAlert, VesselSubscription


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            self.user = self.scope.get('user')
            
            # Validate user authentication
            if not self.user or not self.user.is_authenticated:
                await self.close(code=4001)
                return
            
            # Create group name and add user
            self.user_group_name = f'user_{self.user.id}'
            
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            
            # Accept connection
            await self.accept()
            
            # Send confirmation (non-blocking, don't fail if it doesn't send)
            await self.send_safe({
                'type': 'connection_established',
                'message': 'Connected to notification service',
                'user_id': self.user.id,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            # Fail silently on connection errors
            try:
                await self.close(code=4000)
            except:
                pass
    
    async def disconnect(self, close_code):
        """Handle disconnection"""
        if hasattr(self, 'user_group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.user_group_name,
                    self.channel_name
                )
            except:
                pass
    
    async def receive(self, text_data):
        """Handle incoming messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send_safe({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                })
            
            elif message_type == 'mark_read':
                notification_id = data.get('notification_id')
                success = await self.mark_notification_as_read(notification_id)
                await self.send_safe({
                    'type': 'mark_read_response',
                    'notification_id': notification_id,
                    'success': success
                })
            
            elif message_type == 'mark_all_read':
                await self.mark_all_notifications_as_read()
                await self.send_safe({
                    'type': 'mark_all_read_response',
                    'success': True
                })
        
        except json.JSONDecodeError:
            pass
        except Exception as e:
            pass
    
    async def notification_message(self, event):
        """Receive notification from group and send to WebSocket"""
        try:
            notification = event.get('notification', {})
            await self.send_safe({
                'type': 'notification',
                'data': {
                    'id': notification.get('id'),
                    'user_id': notification.get('user_id'),
                    'vessel_id': notification.get('vessel_id'),
                    'vessel_name': notification.get('vessel_name'),
                    'event_id': notification.get('event_id'),
                    'message': notification.get('message'),
                    'notification_type': notification.get('type', 'info'),
                    'timestamp': notification.get('timestamp'),
                    'is_read': notification.get('is_read', False),
                }
            })
        except Exception as e:
            pass
    
    async def send_safe(self, message):
        """Send message safely, catching any send errors"""
        try:
            await self.send(text_data=json.dumps(message))
        except Exception:
            # Connection closed or error, fail silently
            pass
    
    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """Mark notification as read"""
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
        except Exception:
            return False
    
    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        """Mark all notifications as read"""
        try:
            Notification.objects.filter(
                user=self.user,
                is_read=False
            ).update(is_read=True)
            return True
        except Exception:
            return False