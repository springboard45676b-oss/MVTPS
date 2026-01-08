from django.test import TestCase
from django.contrib.auth import get_user_model
from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from channels.auth import AuthMiddlewareStack
from rest_framework_simplejwt.tokens import RefreshToken
from .routing import websocket_urlpatterns
from .models import Vessel, VesselPosition, VesselSubscription, VesselAlert
import json

User = get_user_model()


class VesselWebSocketTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.vessel = Vessel.objects.create(
            mmsi='123456789',
            name='Test Vessel',
            vessel_type='Cargo'
        )
        
        # Create subscription for alerts
        self.subscription = VesselSubscription.objects.create(
            user=self.user,
            vessel=self.vessel,
            alert_types=['speed', 'port'],
            speed_threshold=10.0,
            is_active=True
        )
        
        # Generate JWT token for WebSocket authentication
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

    async def test_alert_websocket_connection(self):
        """Test that WebSocket connection works with JWT authentication"""
        application = AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        
        communicator = WebsocketCommunicator(
            application,
            f'/ws/vessels/alerts/?token={self.token}'
        )
        
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)
        
        await communicator.disconnect()

    async def test_position_websocket_connection(self):
        """Test that position WebSocket connection works"""
        application = AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        
        communicator = WebsocketCommunicator(
            application,
            f'/ws/vessels/positions/?token={self.token}'
        )
        
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)
        
        await communicator.disconnect()

    def test_vessel_position_triggers_alert(self):
        """Test that vessel position changes trigger alerts"""
        # Create a position that exceeds speed threshold
        position = VesselPosition.objects.create(
            vessel=self.vessel,
            latitude=17.385,
            longitude=78.486,
            speed=15.0,  # Exceeds threshold of 10.0
            timestamp=timezone.now()
        )
        
        # Check if alert was created
        alert = VesselAlert.objects.filter(
            user=self.user,
            vessel=self.vessel,
            alert_type='speed'
        ).first()
        
        self.assertIsNotNone(alert)
        self.assertIn('Speed alert', alert.message)
        self.assertIn('15.0 knots', alert.message)
