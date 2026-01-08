# backend/vessels/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

class VesselAlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get token from query string
            query_string = self.scope['query_string'].decode()
            params = parse_qs(query_string)
            token = params.get('token', [''])[0]
            
            # Validate token
            user = await self.get_user_from_token(token)
            
            if user:
                self.user = user
                self.group_name = "vessel_alerts"
                
                # Join group
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
                await self.accept()
                print(f"Alert WebSocket connected for user: {user.username}")
            else:
                print("Invalid token, rejecting connection")
                await self.close(code=4001)
                
        except Exception as e:
            print(f"WebSocket connection error: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        # Leave group
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        print(f"Alert WebSocket disconnected: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            # Handle incoming messages if needed
            print(f"Received: {data}")
        except json.JSONDecodeError:
            print("Invalid JSON received")

    # Send alert to group
    async def vessel_alert(self, event):
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from django.contrib.auth import get_user_model
            
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            User = get_user_model()
            return User.objects.get(id=user_id)
        except Exception as e:
            print(f"Token validation error: {e}")
            return None


class VesselPositionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            query_string = self.scope['query_string'].decode()
            params = parse_qs(query_string)
            token = params.get('token', [''])[0]
            
            user = await self.get_user_from_token(token)
            
            if user:
                self.user = user
                self.group_name = "vessel_positions"
                
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
                await self.accept()
                print(f"Position WebSocket connected for user: {user.username}")
            else:
                print("Invalid token, rejecting connection")
                await self.close(code=4001)
                
        except Exception as e:
            print(f"WebSocket connection error: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        print(f"Position WebSocket disconnected: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(f"Received: {data}")
        except json.JSONDecodeError:
            print("Invalid JSON received")

    # Send position update to group
    async def vessel_position(self, event):
        await self.send(text_data=json.dumps({
            'type': 'position',
            'data': event['data']
        }))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from django.contrib.auth import get_user_model
            
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            User = get_user_model()
            return User.objects.get(id=user_id)
        except Exception as e:
            print(f"Token validation error: {e}")
            return None