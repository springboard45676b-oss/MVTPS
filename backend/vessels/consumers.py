from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

class AISConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer STRICTLY for live vessel positions only"""
    
    async def connect(self):
        # Only allow connections for live vessel position data
        await self.channel_layer.group_add("ais_live_positions", self.channel_name)
        await self.accept()
        logger.info(f"WebSocket connected for live vessel positions: {self.channel_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("ais_live_positions", self.channel_name)
        logger.info(f"WebSocket disconnected: {self.channel_name}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages - RESTRICTED to position requests only"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            # ENFORCE: Only allow vessel position related messages
            allowed_types = ['request_positions', 'subscribe_area', 'unsubscribe_area']
            
            if message_type not in allowed_types:
                await self.send(text_data=json.dumps({
                    'error': 'WebSocket restricted to vessel positions only',
                    'allowed_types': allowed_types,
                    'rejected_type': message_type
                }))
                return
            
            # Handle allowed message types
            if message_type == 'request_positions':
                await self.handle_position_request(data)
            elif message_type == 'subscribe_area':
                await self.handle_area_subscription(data)
            elif message_type == 'unsubscribe_area':
                await self.handle_area_unsubscription(data)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"WebSocket receive error: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Internal server error'
            }))
    
    async def handle_position_request(self, data):
        """Handle vessel position requests"""
        # This would trigger position data sending
        await self.send(text_data=json.dumps({
            'type': 'position_request_acknowledged',
            'message': 'Position data will be sent via send_vessel_position'
        }))
    
    async def handle_area_subscription(self, data):
        """Handle area-based position subscriptions"""
        bounds = data.get('bounds', {})
        await self.send(text_data=json.dumps({
            'type': 'area_subscribed',
            'bounds': bounds,
            'message': 'Subscribed to vessel positions in area'
        }))
    
    async def handle_area_unsubscription(self, data):
        """Handle area unsubscription"""
        await self.send(text_data=json.dumps({
            'type': 'area_unsubscribed',
            'message': 'Unsubscribed from area updates'
        }))

    async def send_vessel_position(self, event):
        """Send vessel position data - ONLY method for sending position data"""
        position_data = event.get('data', {})
        
        # ENFORCE: Only send if data contains position information
        required_fields = ['mmsi', 'latitude', 'longitude', 'timestamp']
        if not all(field in position_data for field in required_fields):
            logger.warning(f"Invalid position data rejected: {position_data}")
            return
        
        await self.send(text_data=json.dumps({
            'type': 'vessel_position',
            'data': position_data
        }))
    
    # REMOVED: All non-position related methods
    # No weather data, no analytics, no port data, no alerts
    # WebSocket is STRICTLY for live vessel positions