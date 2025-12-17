from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, update_session_auth_hash
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Max, OuterRef, F
from datetime import timedelta
import random
import logging

from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileUpdateSerializer,
    VesselSerializer,
    VesselPositionSerializer,
    VesselSubscriptionSerializer,
    VesselAlertSerializer
)
from .models import Vessel, VesselPosition, VesselSubscription, VesselAlert
from .services import VesselPositionService

logger = logging.getLogger(__name__)
User = get_user_model()

# ============================================
# API ROOT
# ============================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request, format=None):
    """
    Root API endpoint that lists all available endpoints
    """
    base_url = request.build_absolute_uri('/')
    return Response({
        'auth': {
            'register': base_url + 'api/auth/register/',
            'login': base_url + 'api/auth/login/',
            'refresh': base_url + 'api/auth/refresh/',
            'profile': base_url + 'api/auth/profile/',
            'profile_edit': base_url + 'api/auth/profile/edit/',
        },
        'vessels': {
            'list': base_url + 'api/vessels/',
            'detail': base_url + 'api/vessels/{id}/',
            'positions': base_url + 'api/vessels/{id}/positions/',
            'current_position': base_url + 'api/vessels/{id}/current-position/',
            'stats': base_url + 'api/vessels/{id}/stats/',
            'update_position': base_url + 'api/vessels/{id}/update-position/',
            'bulk_positions': base_url + 'api/vessels/bulk/current-positions/',
        },
        'subscriptions': {
            'list': base_url + 'api/users/subscriptions/',
            'detail': base_url + 'api/users/subscriptions/{id}/',
            'alerts': base_url + 'api/users/alerts/',
            'mark_alert_read': base_url + 'api/alerts/{id}/mark-read/',
        },
        'data_generation': {
            'generate_mock': base_url + 'api/generate-realistic-mock-data/',
        }
    })

# ============================================
# AUTHENTICATION VIEWS
# ============================================

class RegisterAPI(generics.CreateAPIView):
    """
    Register a new user
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Registration attempt with data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        
        # Get token for the registered user
        token_serializer = CustomTokenObtainPairSerializer(data={
            'username': user.username,
            'password': request.data.get('password')
        })
        token_serializer.is_valid(raise_exception=True)
        
        token_data = token_serializer.validated_data
        
        return Response({
            'user': UserSerializer(user).data,
            'access': token_data.get('access'),
            'refresh': token_data.get('refresh'),
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return response

# ============================================
# USER PROFILE VIEWS
# ============================================

class UserProfileAPI(generics.RetrieveAPIView):
    """
    Get the current user's profile information
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateAPI(generics.UpdateAPIView):
    """
    Update the current user's profile
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        logger.info(f"Profile update request for user {user.username}: {request.data}")
        
        serializer = self.get_serializer(
            user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Update session auth hash if password was changed
            if 'password' in request.data and request.data.get('password'):
                update_session_auth_hash(request, user)
            
            logger.info(f"Profile updated successfully for user {user.username}")
            
            response_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at,
            }
            
            return Response({
                'message': 'Profile updated successfully',
                'user': response_data
            }, status=status.HTTP_200_OK)
        
        logger.error(f"Profile update validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# VESSEL MANAGEMENT VIEWS (Basic)
# ============================================

class VesselListCreateAPI(generics.ListCreateAPIView):
    """
    List all vessels or create a new vessel
    GET /api/vessels/ - View vessels (all authenticated users)
    POST /api/vessels/ - Create vessel (admin only)
    """
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Only admins can create vessels
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can create vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class VesselDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific vessel
    """
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can update vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can delete vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

# ============================================
# REAL-TIME VESSEL POSITION ENDPOINTS
# ============================================

class VesselPositionHistoryAPI(generics.ListAPIView):
    """
    Get vessel position history with time range filtering
    GET /api/vessels/{vessel_id}/positions/?hours=24
    """
    serializer_class = VesselPositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        vessel_id = self.kwargs.get('vessel_id')
        hours = int(self.request.query_params.get('hours', 24))
        
        # Validate hours parameter
        hours = min(max(1, hours), 720)  # Between 1 and 30 days
        
        since = timezone.now() - timedelta(hours=hours)
        
        return VesselPosition.objects.filter(
            vessel_id=vessel_id,
            timestamp__gte=since
        ).order_by('timestamp')
    
    def list(self, request, *args, **kwargs):
        """Override to add metadata"""
        vessel_id = self.kwargs.get('vessel_id')
        
        # Verify vessel exists
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = super().list(request, *args, **kwargs)
        
        # Add vessel info and stats
        response.data = {
            'vessel': VesselSerializer(vessel).data,
            'positions': response.data,
            'stats': VesselPositionService.get_vessel_stats(vessel_id),
            'count': len(response.data) if isinstance(response.data, list) else 0,
        }
        
        return response


class VesselCurrentPositionAPI(generics.RetrieveAPIView):
    """
    Get the current/latest position of a vessel
    GET /api/vessels/{vessel_id}/current-position/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        vessel_id = kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            latest_position = VesselPosition.objects.filter(
                vessel_id=vessel_id
            ).order_by('-timestamp').first()
            
            if not latest_position:
                return Response(
                    {'detail': 'No position data available'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'vessel': VesselSerializer(vessel).data,
                'current_position': VesselPositionSerializer(latest_position).data,
            })
            
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VesselStatsAPI(generics.RetrieveAPIView):
    """
    Get statistics about a vessel's recent movement
    GET /api/vessels/{vessel_id}/stats/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        vessel_id = kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            stats = VesselPositionService.get_vessel_stats(vessel_id)
            
            if not stats:
                return Response(
                    {'detail': 'No position data available'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'vessel': VesselSerializer(vessel).data,
                'stats': stats,
            })
            
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UpdateVesselPositionAPI(APIView):
    """
    Update vessel position (FIXED VERSION)
    POST /api/vessels/{vessel_id}/update-position/
    
    Request body:
    {
        "latitude": 51.5074,
        "longitude": -0.1278,
        "speed": 12.5,
        "course": 45.0,
        "source": "marinetraffic"
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, vessel_id):
        # Only allow admins and analysts to update positions
        if request.user.role not in ['admin', 'analyst']:
            return Response(
                {'detail': 'Insufficient permissions to update positions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate vessel exists
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'detail': f'Vessel with id {vessel_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get and validate coordinates
        try:
            latitude = float(request.data.get('latitude'))
            longitude = float(request.data.get('longitude'))
        except (ValueError, TypeError, AttributeError):
            return Response(
                {'detail': 'Invalid latitude or longitude - must be valid numbers'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate coordinate ranges
        if not (-90 <= latitude <= 90):
            return Response(
                {'detail': 'Latitude must be between -90 and 90'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not (-180 <= longitude <= 180):
            return Response(
                {'detail': 'Longitude must be between -180 and 180'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get optional fields
        try:
            speed = float(request.data.get('speed')) if request.data.get('speed') else None
            course = float(request.data.get('course')) if request.data.get('course') else None
        except ValueError:
            speed = None
            course = None
        
        source = request.data.get('source', 'api')
        
        try:
            # Create new position record
            position = VesselPosition.objects.create(
                vessel=vessel,
                latitude=latitude,
                longitude=longitude,
                speed=speed,
                course=course,
                timestamp=timezone.now(),
                source=source
            )
            
            # Update vessel's last position
            vessel.last_position_lat = latitude
            vessel.last_position_lon = longitude
            vessel.last_update = timezone.now()
            vessel.save()
            
            # Trigger alerts for subscribed users
            subscriptions = VesselSubscription.objects.filter(
                vessel=vessel,
                is_active=True
            )
            
            for subscription in subscriptions:
                if subscription.alert_type in ['position_update', 'all']:
                    VesselAlert.objects.create(
                        subscription=subscription,
                        alert_type='position_update',
                        message=f'{vessel.name} position updated: {latitude:.4f}°N, {longitude:.4f}°E',
                        status='pending'
                    )
            
            return Response(
                VesselPositionSerializer(position).data,
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            logger.error(f"Error updating vessel position: {str(e)}")
            return Response(
                {'detail': f'Error updating position: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GenerateRealisticMockDataAPI(APIView):
    """
    Generate comprehensive mock vessel and position data with realistic routes
    POST /api/generate-realistic-mock-data/
    
    Generates sample vessels and position data that can be viewed by all authenticated users
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Allow any authenticated user to generate mock data
        # (This is typically called once during setup)
        
        try:
            num_vessels = int(request.data.get('num_vessels', 5))
            num_vessels = min(max(1, num_vessels), 10)  # Between 1 and 10
            
            vessels = VesselPositionService.generate_mock_vessel_data(num_vessels)
            
            return Response({
                'message': f'Generated mock data for {len(vessels)} vessels',
                'vessels': [
                    {
                        'id': v.id,
                        'name': v.name,
                        'imo_number': v.imo_number,
                        'positions_count': VesselPosition.objects.filter(vessel=v).count(),
                    }
                    for v in vessels
                ],
                'total_vessels': Vessel.objects.count(),
                'total_positions': VesselPosition.objects.count(),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error generating mock data: {str(e)}")
            return Response(
                {'detail': f'Error generating mock data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BulkVesselPositionsAPI(generics.ListAPIView):
    """
    Get current positions for all vessels (for dashboard/map view)
    GET /api/vessels/bulk/current-positions/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """Return latest position for each vessel"""
        vessels = Vessel.objects.all()
        
        positions_data = []
        for vessel in vessels:
            latest_pos = VesselPosition.objects.filter(
                vessel=vessel
            ).order_by('-timestamp').first()
            
            if latest_pos:
                positions_data.append({
                    'id': vessel.id,
                    'name': vessel.name,
                    'imo_number': vessel.imo_number,
                    'position': VesselPositionSerializer(latest_pos).data,
                    'vessel_info': {
                        'type': vessel.type,
                        'flag': vessel.flag,
                        'operator': vessel.operator,
                    }
                })
        
        return Response({
            'count': len(positions_data),
            'vessels': positions_data,
        })
    
# ============================================
# SUBSCRIPTION & ALERT VIEWS
# (Add to the end of views.py from Part 1)
# ============================================

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import VesselSubscription, VesselAlert, Vessel
from .serializers import VesselSubscriptionSerializer, VesselAlertSerializer
import logging

logger = logging.getLogger(__name__)


class UserVesselSubscriptionsAPI(generics.ListCreateAPIView):
    """
    List and create vessel subscriptions for current user
    GET /api/users/subscriptions/ - Get all subscriptions
    POST /api/users/subscriptions/ - Subscribe to a vessel
    """
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VesselSubscription.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        vessel_id = request.data.get('vessel')
        alert_type = request.data.get('alert_type', 'all')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if subscription already exists
        subscription, created = VesselSubscription.objects.update_or_create(
            user=request.user,
            vessel=vessel,
            defaults={'is_active': True, 'alert_type': alert_type}
        )
        
        serializer = self.get_serializer(subscription)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        
        return Response(serializer.data, status=status_code)


class VesselSubscriptionDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific subscription
    GET /api/users/subscriptions/{id}/
    PUT /api/users/subscriptions/{id}/ - Update alert type or status
    DELETE /api/users/subscriptions/{id}/ - Unsubscribe
    """
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VesselSubscription.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        """Mark as inactive instead of deleting"""
        instance.is_active = False
        instance.save()


class UserAlertsAPI(generics.ListAPIView):
    """
    Get all alerts for current user
    GET /api/users/alerts/ - Get unread/all alerts
    GET /api/users/alerts/?status=pending - Filter by status
    """
    serializer_class = VesselAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_subscriptions = VesselSubscription.objects.filter(user=self.request.user).values_list('id', flat=True)
        queryset = VesselAlert.objects.filter(subscription_id__in=user_subscriptions)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('-created_at')


class AlertMarkAsReadAPI(APIView):
    """
    Mark alert as read
    POST /api/alerts/{alert_id}/mark-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, alert_id):
        try:
            alert = VesselAlert.objects.get(id=alert_id)
            
            # Verify user owns this alert
            if alert.subscription.user != request.user:
                return Response(
                    {'detail': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            alert.status = 'read'
            alert.read_at = timezone.now()
            alert.save()
            
            return Response(
                VesselAlertSerializer(alert).data,
                status=status.HTTP_200_OK
            )
        except VesselAlert.DoesNotExist:
            return Response(
                {'detail': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )