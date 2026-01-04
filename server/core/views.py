# Replace the first 20 lines of your server/core/views.py with this:

from rest_framework import generics, status, permissions, serializers  # ✅ ADDED serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, update_session_auth_hash
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Max, OuterRef, F, Q, Avg, Count, Sum  # ✅ ADDED Sum
from datetime import timedelta
import random
import logging

from .models import (
    Vessel, 
    VesselPosition, 
    VesselSubscription, 
    VesselAlert,
    Notification,
    Port,
    Voyage
)

try:
    from .notification_service import NotificationService
except ImportError:
    class NotificationService:
        @staticmethod
        def notify_position_update(vessel_id, latitude, longitude, speed):
            print(f"⚠️ NotificationService unavailable")
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

from .services import VesselPositionService

logger = logging.getLogger(__name__)
User = get_user_model()

# ============================================
# API ROOT
# ============================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request, format=None):
    """Root API endpoint that lists all available endpoints"""
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
            'mark_read': base_url + 'api/users/notifications/{id}/mark-read/',
            'mark_all_read': base_url + 'api/users/notifications/mark-all-read/',
            'delete_one': base_url + 'api/users/notifications/{id}/delete/',
            'clear_all': base_url + 'api/users/notifications/clear-all/',
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
    """Register a new user"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Registration attempt")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        
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
    """Custom token obtain view"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return response

# ============================================
# USER PROFILE VIEWS
# ============================================

class UserProfileAPI(generics.RetrieveAPIView):
    """Get the current user's profile information"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateAPI(generics.UpdateAPIView):
    """Update the current user's profile"""
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        logger.info(f"Profile update request for user {user.username}")
        
        serializer = self.get_serializer(
            user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
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
    """List all vessels or create a new vessel"""
    queryset = Vessel.objects.all().order_by('id')
    serializer_class = VesselSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'flag']
    search_fields = ['name', 'imo_number']
    ordering_fields = ['name', 'type', 'flag']
    ordering = ['id']
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can create vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class VesselDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific vessel"""
    queryset = Vessel.objects.all().order_by('id')
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
    """Get vessel position history with time range filtering"""
    serializer_class = VesselPositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        vessel_id = self.kwargs.get('vessel_id')
        hours = int(self.request.query_params.get('hours', 24))
        hours = min(max(1, hours), 720)
        
        since = timezone.now() - timedelta(hours=hours)
        
        return VesselPosition.objects.filter(
            vessel_id=vessel_id,
            timestamp__gte=since
        ).order_by('timestamp')
    
    def list(self, request, *args, **kwargs):
        vessel_id = self.kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = super().list(request, *args, **kwargs)
        
        response.data = {
            'vessel': VesselSerializer(vessel).data,
            'positions': response.data,
            'count': len(response.data) if isinstance(response.data, list) else 0,
        }
        
        return response


class VesselCurrentPositionAPI(generics.RetrieveAPIView):
    """Get the current/latest position of a vessel"""
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
    """Get statistics about a vessel's recent movement"""
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        vessel_id = kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            
            return Response({
                'vessel': VesselSerializer(vessel).data,
            })
            
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UpdateVesselPositionAPI(APIView):
    """Update vessel position"""
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
            
            if latitude is None or longitude is None:
                return Response(
                    {'error': 'Latitude and longitude are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            vessel.last_position_lat = latitude
            vessel.last_position_lon = longitude
            vessel.last_update = timezone.now()
            vessel.save()
            
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
    """Get current positions for all vessels"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
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
    """Generate comprehensive mock vessel and position data"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            num_vessels = int(request.data.get('num_vessels', 5))
            num_vessels = min(max(1, num_vessels), 10)
            
            from .services import VesselPositionService
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
# NOTIFICATION VIEWS - CRUD OPERATIONS
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
    
    def list(self, request, *args, **kwargs):
        """Override to add metadata"""
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'unread_count': unread_count,
            'results': serializer.data
        })


class NotificationDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a single notification
    GET /api/users/notifications/{id}/
    PATCH /api/users/notifications/{id}/ - Mark as read
    DELETE /api/users/notifications/{id}/ - Delete
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to access their own notifications"""
        return Notification.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Update notification - only is_read field"""
        notification = self.get_object()
        
        if 'is_read' in request.data:
            notification.is_read = request.data.get('is_read', False)
            notification.save()
            logger.info(f"Notification {notification.id} marked as read by user {request.user.id}")
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a single notification"""
        notification = self.get_object()
        notification_id = notification.id
        notification.delete()
        
        logger.info(f"Notification {notification_id} deleted by user {request.user.id}")
        return Response(
            {
                'success': True,
                'message': 'Notification deleted successfully',
                'notification_id': notification_id
            },
            status=status.HTTP_204_NO_CONTENT
        )


class MarkNotificationAsReadAPI(APIView):
    """
    Mark a specific notification as read
    PATCH /api/users/notifications/{notification_id}/mark-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, notification_id):
        """Mark notification as read"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )
            
            notification.mark_as_read()
            logger.info(f"Notification {notification_id} marked as read")
            
            serializer = NotificationSerializer(notification)
            return Response({
                'success': True,
                'message': 'Notification marked as read',
                'notification': serializer.data
            }, status=status.HTTP_200_OK)
        
        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {request.user.id}")
            return Response(
                {'detail': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MarkAllNotificationsAsReadAPI(APIView):
    """
    Mark all unread notifications as read for the current user
    PATCH /api/users/notifications/mark-all-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        """Mark all unread notifications as read"""
        try:
            updated_count = Notification.objects.filter(
                user=request.user,
                is_read=False
            ).update(is_read=True)
            
            logger.info(f"User {request.user.id} marked {updated_count} notifications as read")
            
            return Response({
                'success': True,
                'message': f'{updated_count} notifications marked as read',
                'updated_count': updated_count
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ClearAllNotificationsAPI(APIView):
    """
    Delete all notifications for the current user
    DELETE /api/users/notifications/clear-all/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        """Delete all notifications for current user"""
        try:
            notifications = Notification.objects.filter(user=request.user)
            deleted_count = notifications.count()
            
            notifications.delete()
            
            logger.info(f"User {request.user.id} cleared {deleted_count} notifications")
            
            return Response({
                'success': True,
                'message': f'{deleted_count} notifications cleared',
                'deleted_count': deleted_count
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error clearing notifications: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DeleteNotificationAPI(APIView):
    """
    Delete a specific notification
    DELETE /api/users/notifications/{notification_id}/delete/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, notification_id):
        """Delete a single notification"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )
            
            notification.delete()
            logger.info(f"Notification {notification_id} deleted by user {request.user.id}")
            
            return Response({
                'success': True,
                'message': 'Notification deleted',
                'deleted_id': notification_id
            }, status=status.HTTP_200_OK)
        
        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {request.user.id}")
            return Response(
                {'detail': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

# ============================================
# SUBSCRIPTION VIEWS
# ============================================

class UserVesselSubscriptionsAPI(generics.ListCreateAPIView):
    """List all vessel subscriptions for user or create a new subscription"""
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
            
            subscription, created = VesselSubscription.objects.get_or_create(
                user=request.user,
                vessel=vessel,
                defaults={'alert_type': alert_type, 'is_active': True}
            )
            
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
    """Get, update, or delete a specific vessel subscription"""
    serializer_class = VesselSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow users to access their own subscriptions"""
        return VesselSubscription.objects.filter(user=self.request.user)

# ============================================
# ALERT VIEWS
# ============================================

class UserAlertsAPI(generics.ListAPIView):
    """Get all vessel alerts for the authenticated user"""
    serializer_class = VesselAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get alerts for current user's subscriptions"""
        return VesselAlert.objects.filter(
            subscription__user=self.request.user
        ).select_related('subscription__vessel', 'subscription__user').order_by('-created_at')


class AlertMarkAsReadAPI(APIView):
    """Mark a specific alert as read"""
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
        
class PortListAPI(generics.ListAPIView):
    """
    List all ports with filtering and search
    GET /api/ports/
    """
    queryset = Port.objects.all().order_by('-congestion_score')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'location', 'country']
    ordering_fields = ['name', 'congestion_score', 'avg_wait_time', 'arrivals', 'departures']
    filterset_fields = ['country']
    
    def get_serializer_class(self):
        """Return basic port serializer for list view"""
        return PortSerializer
    
    def list(self, request, *args, **kwargs):
        """Add statistics to response"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate statistics
        total_ports = queryset.count()
        avg_congestion = queryset.aggregate(Avg('congestion_score'))['congestion_score__avg']
        avg_wait_time = queryset.aggregate(Avg('avg_wait_time'))['avg_wait_time__avg']
        
        # Congestion levels
        low_congestion = queryset.filter(congestion_score__lt=3).count()
        moderate_congestion = queryset.filter(congestion_score__gte=3, congestion_score__lt=6).count()
        high_congestion = queryset.filter(congestion_score__gte=6, congestion_score__lt=8).count()
        critical_congestion = queryset.filter(congestion_score__gte=8).count()
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': total_ports,
            'statistics': {
                'avg_congestion_score': round(avg_congestion, 2) if avg_congestion else 0,
                'avg_wait_time_hours': round(avg_wait_time, 2) if avg_wait_time else 0,
                'congestion_levels': {
                    'low': low_congestion,
                    'moderate': moderate_congestion,
                    'high': high_congestion,
                    'critical': critical_congestion
                }
            },
            'results': serializer.data
        })


class PortDetailAPI(generics.RetrieveAPIView):
    """
    Get detailed information about a specific port with statistics
    GET /api/ports/{id}/
    """
    queryset = Port.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        return PortSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Return port with detailed statistics"""
        port = self.get_object()
        serializer = self.get_serializer(port)
        
        # Calculate comprehensive statistics
        total_arrivals = Voyage.objects.filter(port_to=port).count()
        total_departures = Voyage.objects.filter(port_from=port).count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_arrivals = Voyage.objects.filter(
            port_to=port,
            arrival_time__gte=thirty_days_ago
        ).count()
        recent_departures = Voyage.objects.filter(
            port_from=port,
            departure_time__gte=thirty_days_ago
        ).count()
        
        # Active voyages
        active_to_port = Voyage.objects.filter(
            port_to=port,
            status='in_progress'
        ).count()
        active_from_port = Voyage.objects.filter(
            port_from=port,
            status='in_progress'
        ).count()
        
        # Completed arrivals
        completed_arrivals = Voyage.objects.filter(
            port_to=port,
            status='completed'
        )
        
        # Calculate average wait time from completed voyages
        wait_times = []
        for voyage in completed_arrivals:
            if voyage.wait_time_hours is not None:
                wait_times.append(voyage.wait_time_hours)
        
        avg_wait = sum(wait_times) / len(wait_times) if wait_times else 0
        
        return Response({
            **serializer.data,
            'statistics': {
                'congestion': {
                    'score': round(port.congestion_score, 2),
                    'level': 'critical' if port.congestion_score >= 8 else 
                            'high' if port.congestion_score >= 6 else
                            'moderate' if port.congestion_score >= 3 else 'low',
                    'avg_wait_time_hours': round(port.avg_wait_time, 2)
                },
                'traffic': {
                    'total': {
                        'arrivals': total_arrivals,
                        'departures': total_departures
                    },
                    'last_30_days': {
                        'arrivals': recent_arrivals,
                        'departures': recent_departures
                    },
                    'current_activity': {
                        'incoming_vessels': active_to_port,
                        'outgoing_vessels': active_from_port
                    }
                },
                'performance': {
                    'completed_arrivals': completed_arrivals.count(),
                    'turnover_rate': round((port.departures / port.arrivals * 100), 2) if port.arrivals > 0 else 0,
                    'avg_wait_time_hours': round(avg_wait, 2)
                }
            }
        })


class PortStatisticsAPI(APIView):
    """
    Get comprehensive port statistics and analytics
    GET /api/ports/{id}/statistics/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, port_id):
        try:
            port = Port.objects.get(id=port_id)
        except Port.DoesNotExist:
            return Response(
                {'error': 'Port not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get voyage statistics
        total_arrivals = Voyage.objects.filter(port_to=port).count()
        total_departures = Voyage.objects.filter(port_from=port).count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_arrivals = Voyage.objects.filter(
            port_to=port,
            arrival_time__gte=thirty_days_ago
        ).count()
        recent_departures = Voyage.objects.filter(
            port_from=port,
            departure_time__gte=thirty_days_ago
        ).count()
        
        # Active voyages (in progress to/from this port)
        active_to_port = Voyage.objects.filter(
            port_to=port,
            status='in_progress'
        ).count()
        active_from_port = Voyage.objects.filter(
            port_from=port,
            status='in_progress'
        ).count()
        
        # Calculate performance metrics
        completed_arrivals = Voyage.objects.filter(
            port_to=port,
            status='completed'
        )
        
        # Calculate wait times
        wait_times = []
        for voyage in completed_arrivals:
            if voyage.wait_time_hours is not None:
                wait_times.append(voyage.wait_time_hours)
        
        avg_wait_time = sum(wait_times) / len(wait_times) if wait_times else 0
        
        return Response({
            'port': {
                'id': port.id,
                'name': port.name,
                'location': port.location,
                'country': port.country,
                'latitude': port.latitude,
                'longitude': port.longitude
            },
            'congestion': {
                'score': round(port.congestion_score, 2),
                'level': 'critical' if port.congestion_score >= 8 else 
                        'high' if port.congestion_score >= 6 else
                        'moderate' if port.congestion_score >= 3 else 'low',
                'avg_wait_time_hours': round(port.avg_wait_time, 2)
            },
            'traffic': {
                'total': {
                    'arrivals': total_arrivals,
                    'departures': total_departures,
                    'total': total_arrivals + total_departures
                },
                'last_30_days': {
                    'arrivals': recent_arrivals,
                    'departures': recent_departures,
                    'total': recent_arrivals + recent_departures
                },
                'current_activity': {
                    'incoming_vessels': active_to_port,
                    'outgoing_vessels': active_from_port,
                    'total_active': active_to_port + active_from_port
                }
            },
            'performance': {
                'completed_arrivals': completed_arrivals.count(),
                'turnover_rate': round((port.departures / port.arrivals * 100), 2) if port.arrivals > 0 else 0,
                'avg_wait_time_hours': round(avg_wait_time, 2)
            }
        })


# ============================================
# VOYAGE VIEWS - Add these to your views.py
# ============================================

class VoyageListAPI(generics.ListAPIView):
    """
    List all voyages with filtering
    GET /api/voyages/
    """
    queryset = Voyage.objects.all().select_related(
        'vessel', 'port_from', 'port_to'
    ).order_by('-departure_time')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['vessel__name', 'vessel__imo_number', 'port_from__name', 'port_to__name']
    ordering_fields = ['departure_time', 'arrival_time', 'status']
    filterset_fields = ['status', 'vessel', 'port_from', 'port_to']
    
    def get_serializer_class(self):
        return VoyageSerializer
    
    def get_queryset(self):
        """Add custom filtering"""
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(departure_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(departure_time__lte=end_date)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Add statistics"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate statistics
        total_voyages = queryset.count()
        by_status = {
            'scheduled': queryset.filter(status='scheduled').count(),
            'in_progress': queryset.filter(status='in_progress').count(),
            'completed': queryset.filter(status='completed').count(),
            'cancelled': queryset.filter(status='cancelled').count()
        }
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': total_voyages,
            'statistics': {
                'by_status': by_status
            },
            'results': serializer.data
        })


class VoyageDetailAPI(generics.RetrieveAPIView):
    """
    Get detailed information about a specific voyage
    GET /api/voyages/{id}/
    """
    queryset = Voyage.objects.all().select_related(
        'vessel', 'port_from', 'port_to'
    )
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        return VoyageSerializer


class VoyagesByVesselAPI(generics.ListAPIView):
    """
    Get all voyages for a specific vessel
    GET /api/voyages/vessel/{vessel_id}/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        return VoyageSerializer
    
    def get_queryset(self):
        vessel_id = self.kwargs.get('vessel_id')
        return Voyage.objects.filter(
            vessel_id=vessel_id
        ).select_related('vessel', 'port_from', 'port_to').order_by('-departure_time')


class VoyagesByPortAPI(generics.ListAPIView):
    """
    Get all voyages to/from a specific port
    GET /api/voyages/port/{port_id}/?direction=arrivals|departures|all
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        return VoyageSerializer
    
    def get_queryset(self):
        port_id = self.kwargs.get('port_id')
        direction = self.request.query_params.get('direction', 'all')
        
        if direction == 'arrivals':
            return Voyage.objects.filter(port_to_id=port_id)
        elif direction == 'departures':
            return Voyage.objects.filter(port_from_id=port_id)
        else:  # all
            return Voyage.objects.filter(
                Q(port_from_id=port_id) | Q(port_to_id=port_id)
            ).select_related('vessel', 'port_from', 'port_to').order_by('-departure_time')


class ActiveVoyagesAPI(generics.ListAPIView):
    """
    Get all currently active (in_progress) voyages
    GET /api/voyages/active/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        return VoyageSerializer
    
    def get_queryset(self):
        return Voyage.objects.filter(
            status='in_progress'
        ).select_related('vessel', 'port_from', 'port_to').order_by('arrival_time')


# ============================================
# SIMPLE INLINE SERIALIZERS (if not importing from serializers.py)
# Add these if you haven't updated serializers.py yet
# ============================================

class PortSerializer(serializers.ModelSerializer):
    """Basic port serializer"""
    congestion_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = (
            'id', 'name', 'location', 'country', 'latitude', 'longitude',
            'congestion_score', 'congestion_level', 'avg_wait_time',
            'arrivals', 'departures', 'last_update'
        )
    
    def get_congestion_level(self, obj):
        if obj.congestion_score < 3:
            return 'low'
        elif obj.congestion_score < 6:
            return 'moderate'
        elif obj.congestion_score < 8:
            return 'high'
        else:
            return 'critical'


class VoyageSerializer(serializers.ModelSerializer):
    """Basic voyage serializer with wait time"""
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)
    vessel_imo = serializers.CharField(source='vessel.imo_number', read_only=True)
    port_from_name = serializers.CharField(source='port_from.name', read_only=True)
    port_to_name = serializers.CharField(source='port_to.name', read_only=True)
    duration_days = serializers.SerializerMethodField()
    wait_time_hours = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Voyage
        fields = (
            'id', 'vessel', 'vessel_name', 'vessel_imo',
            'port_from', 'port_from_name', 'port_to', 'port_to_name',
            'departure_time', 'arrival_time', 'entry_time', 'berthing_time',
            'duration_days', 'wait_time_hours', 'status', 'status_display'
        )
    
    def get_duration_days(self, obj):
        if obj.arrival_time and obj.departure_time:
            delta = obj.arrival_time - obj.departure_time
            return round(delta.total_seconds() / 86400, 1)
        return None
    
    def get_wait_time_hours(self, obj):
        return obj.wait_time_hours


# ============================================
# MOCK DATA GENERATION VIEW
# ============================================

class GeneratePortVoyageMockDataAPI(APIView):
    """
    Generate mock port and voyage data
    POST /api/generate-port-voyage-mock-data/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate 15 ports and 15 voyages with wait time data"""
        try:
            from .mock_data_generator import MockDataGenerator
            result = MockDataGenerator.generate_all_mock_data()
            
            return Response({
                'success': True,
                'message': 'Mock data generated successfully',
                'data': {
                    'ports_created': len(result['ports']),
                    'voyages_created': len(result['voyages']),
                    'summary': result['summary']
                }
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error generating mock data: {str(e)}")
            return Response(
                {'error': f'Failed to generate mock data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )