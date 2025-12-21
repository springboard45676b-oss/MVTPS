# server/backend/core/views.py

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, update_session_auth_hash
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Max, OuterRef, F
from datetime import timedelta
import random
import logging

# Safe import of notification service
try:
    from .notification_service import NotificationService
except ImportError:
    # Fallback if channels not installed
    class NotificationService:
        @staticmethod
        def notify_position_update(vessel_id, latitude, longitude, speed):
            print(f"⚠️ NotificationService unavailable - install channels if needed")
            pass
        
        @staticmethod
        def notify_subscribed_users(vessel_id, alert_type, message):
            pass
        
        @staticmethod
        def send_notification(user_id, vessel_id, message, notification_type='info'):
            return None

from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileUpdateSerializer,
    VesselSerializer,
    VesselPositionSerializer,
    VesselSubscriptionSerializer,
    VesselAlertSerializer,
    NotificationSerializer,
)
from .models import (
    Vessel, 
    VesselPosition, 
    VesselSubscription, 
    VesselAlert,
    Notification,
)
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
        'notifications': {
            'list': base_url + 'api/users/notifications/',
            'detail': base_url + 'api/users/notifications/{id}/',
            'mark_all_read': base_url + 'api/users/notifications/mark-all-read/',
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
    POST /api/auth/register/
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
    Custom token obtain view with role selection
    POST /api/auth/login/
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
    GET /api/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateAPI(generics.UpdateAPIView):
    """
    Update the current user's profile
    PUT /api/auth/profile/edit/
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
# VESSEL MANAGEMENT VIEWS
# ============================================

class VesselListCreateAPI(generics.ListCreateAPIView):
    """
    List all vessels or create a new vessel
    GET /api/vessels/ - View vessels (all authenticated users)
    POST /api/vessels/ - Create vessel (admin only)
    """
    queryset = Vessel.objects.all().order_by('id')  # FIX: Added ordering
    serializer_class = VesselSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'flag']
    search_fields = ['name', 'imo_number']
    ordering_fields = ['name', 'type', 'flag']
    ordering = ['id']  # FIX: Added default ordering
    
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
    GET /api/vessels/{id}/
    PUT /api/vessels/{id}/
    DELETE /api/vessels/{id}/
    """
    queryset = Vessel.objects.all().order_by('id')  # FIX: Added ordering
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
    Update vessel position and trigger notifications for subscribed users
    POST /api/vessels/{vessel_id}/update-position/
    
    Request body:
    {
        "latitude": 20.5,
        "longitude": 45.5,
        "speed": 15.5,
        "course": 180.0,
        "source": "api"
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, vessel_id):
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'error': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            latitude = request.data.get('latitude')
            longitude = request.data.get('longitude')
            speed = request.data.get('speed', 0)
            course = request.data.get('course', 0)
            source = request.data.get('source', 'api')
            
            # Validate coordinates
            if latitude is None or longitude is None:
                return Response(
                    {'error': 'Latitude and longitude are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update vessel position
            vessel.last_position_lat = latitude
            vessel.last_position_lon = longitude
            vessel.last_update = timezone.now()
            vessel.save()
            
            # Create position history record
            try:
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=latitude,
                    longitude=longitude,
                    speed=speed,
                    course=course,
                    timestamp=timezone.now(),
                    source=source
                )
            except Exception as e:
                logger.warning(f"Could not create position history: {str(e)}")
            
            # 🔥 TRIGGER NOTIFICATIONS FOR SUBSCRIBED USERS
            try:
                NotificationService.notify_position_update(
                    vessel_id=vessel_id,
                    latitude=latitude,
                    longitude=longitude,
                    speed=speed
                )
            except Exception as e:
                logger.warning(f"Could not send notifications: {str(e)}")
            
            return Response({
                'success': True,
                'message': f'Position updated for {vessel.name}',
                'vessel': {
                    'id': vessel.id,
                    'name': vessel.name,
                    'latitude': vessel.last_position_lat,
                    'longitude': vessel.last_position_lon,
                    'speed': speed,
                    'course': course,
                }
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error updating vessel position: {str(e)}")
            return Response(
                {'error': f'Failed to update position: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
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

# ============================================
# NOTIFICATION VIEWS
# ============================================

class UserNotificationsAPI(generics.ListAPIView):
    """
    Get all notifications for the authenticated user
    GET /api/users/notifications/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get notifications for current user - latest first"""
        return Notification.objects.filter(
            user=self.request.user
        ).select_related('vessel', 'event', 'user').order_by('-timestamp')


class NotificationDetailAPI(generics.RetrieveAPIView):
    """
    Get a single notification
    GET /api/users/notifications/{id}/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to access their own notifications"""
        return Notification.objects.filter(user=self.request.user)


class MarkAllNotificationsAsReadAPI(APIView):
    """
    Mark all notifications as viewed (no status field to track)
    POST /api/users/notifications/mark-all-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """No-op since we don't track read status"""
        return Response({
            'success': True,
            'message': 'Notifications marked as viewed',
        }, status=status.HTTP_200_OK)

# ============================================
# SUBSCRIPTION VIEWS
# ============================================

class UserVesselSubscriptionsAPI(generics.ListCreateAPIView):
    """
    List all vessel subscriptions for user or create a new subscription
    GET /api/users/subscriptions/
    POST /api/users/subscriptions/ with {"vessel": 1, "alert_type": "all"}
    """
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get subscriptions for current user"""
        return VesselSubscription.objects.filter(
            user=self.request.user
        ).select_related('vessel').order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create or toggle subscription"""
        try:
            vessel_id = request.data.get('vessel')
            alert_type = request.data.get('alert_type', 'all')
            
            if not vessel_id:
                return Response(
                    {'error': 'Vessel ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                vessel = Vessel.objects.get(id=vessel_id)
            except Vessel.DoesNotExist:
                return Response(
                    {'error': 'Vessel not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if subscription already exists
            subscription, created = VesselSubscription.objects.get_or_create(
                user=request.user,
                vessel=vessel,
                defaults={'alert_type': alert_type, 'is_active': True}
            )
            
            # If it exists, toggle is_active and update alert_type
            if not created:
                subscription.is_active = not subscription.is_active
                subscription.alert_type = alert_type
                subscription.save()
            
            serializer = VesselSubscriptionSerializer(subscription)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error in subscription create: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class VesselSubscriptionDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a specific vessel subscription
    GET /api/users/subscriptions/{id}/
    PATCH /api/users/subscriptions/{id}/
    DELETE /api/users/subscriptions/{id}/
    """
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to access their own subscriptions"""
        return VesselSubscription.objects.filter(user=self.request.user)

# ============================================
# ALERT VIEWS
# ============================================

class UserAlertsAPI(generics.ListAPIView):
    """
    Get all vessel alerts for the authenticated user
    GET /api/users/alerts/
    """
    serializer_class = VesselAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get alerts for current user's subscriptions"""
        return VesselAlert.objects.filter(
            subscription__user=self.request.user
        ).select_related('subscription__vessel', 'subscription__user').order_by('-created_at')


class AlertMarkAsReadAPI(APIView):
    """
    Mark a specific alert as read
    PATCH /api/alerts/{alert_id}/mark-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, alert_id):
        """Mark alert as read"""
        try:
            alert = VesselAlert.objects.get(
                id=alert_id,
                subscription__user=request.user
            )
            alert.status = 'read'
            alert.read_at = timezone.now()
            alert.save()
            
            serializer = VesselAlertSerializer(alert)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except VesselAlert.DoesNotExist:
            return Response(
                {'error': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )