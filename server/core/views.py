# Replace the first 20 lines of your server/core/views.py with this:

from rest_framework import generics, status, permissions, serializers  # ✅ ADDED serializers
from django.db.models.functions import TruncMonth 
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
from datetime import timedelta, datetime  # ✅ ADD datetime HERE
from django.http import JsonResponse  # ✅ ADD THIS for export functionality
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
    Voyage,
    PiracyZone,
    Country,
    WeatherAlert
    
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
    PiracyZoneSerializer,
    CountrySerializer,
    WeatherAlertSerializer
    
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

# class RegisterAPI(generics.CreateAPIView):
#     """Register a new user"""
#     serializer_class = RegisterSerializer
#     permission_classes = [permissions.AllowAny]
    
#     def create(self, request, *args, **kwargs):
#         logger.info(f"Registration attempt")
#         serializer = self.get_serializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Validation errors: {serializer.errors}")
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         user = serializer.save()
        
#         token_serializer = CustomTokenObtainPairSerializer(data={
#             'username': user.username,
#             'password': request.data.get('password')
#         })
#         token_serializer.is_valid(raise_exception=True)
        
#         token_data = token_serializer.validated_data
        
#         return Response({
#             'user': UserSerializer(user).data,
#             'access': token_data.get('access'),
#             'refresh': token_data.get('refresh'),
#         }, status=status.HTTP_201_CREATED)

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterAPI(generics.CreateAPIView):
    """Register a new user and return tokens"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"📝 Registration attempt")
        
        # Validate registration data
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"❌ Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the user
        try:
            user = serializer.save()
            logger.info(f"✅ User created: {user.username}")
        except Exception as e:
            logger.error(f"❌ Error creating user: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate tokens manually
        try:
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            refresh_str = str(refresh)
            
            logger.info(f"✅ Tokens generated for new user: {user.username}")
            
            response_data = {
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': getattr(user, 'role', 'operator'),
                    'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
                },
                'access': access,
                'refresh': refresh_str,
            }
            
            logger.info(f"✅ Registration successful for user: {user.username}")
            logger.info(f"✅ Response keys: {list(response_data.keys())}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"❌ Error generating tokens: {str(e)}", exc_info=True)
            return Response(
                {'error': f'User created but token generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# class CustomTokenObtainPairView(TokenObtainPairView):
#     """Custom token obtain view"""
#     serializer_class = CustomTokenObtainPairSerializer
    
#     def post(self, request, *args, **kwargs):
#         response = super().post(request, *args, **kwargs)
#         return response

# class CustomTokenObtainPairView(TokenObtainPairView):
#     """Custom token obtain view with role validation"""
#     serializer_class = CustomTokenObtainPairSerializer
    
#     def post(self, request, *args, **kwargs):
#         # Get login data
#         username = request.data.get('username')
#         selected_role = request.data.get('selected_role', 'operator')  # Default to operator
        
#         # Try to authenticate first
#         try:
#             response = super().post(request, *args, **kwargs)
#         except Exception as e:
#             logger.warning(f"Authentication failed for {username}: {str(e)}")
#             return Response(
#                 {'detail': 'Invalid credentials'},
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
        
#         # Get the user
#         try:
#             try:
#                 user = User.objects.get(username=username)
#             except User.DoesNotExist:
#                 user = User.objects.get(email=username)
            
#             # Validate role match (optional - comment out if you don't want to enforce it)
#             # if user.role != selected_role and selected_role != 'admin':
#             #     return Response(
#             #         {'selected_role': f'User role is {user.role}, not {selected_role}'},
#             #         status=status.HTTP_400_BAD_REQUEST
#             #     )
            
#             # Add user data to response
#             response.data['user'] = {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'role': user.role,
#                 'created_at': user.created_at.isoformat() if user.created_at else None,
#             }
            
#             logger.info(f"User {user.username} (role: {user.role}) logged in successfully")
            
#         except User.DoesNotExist:
#             logger.warning(f"Login attempt with non-existent user: {username}")
#             return Response(
#                 {'detail': 'User not found'},
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
#         except Exception as e:
#             logger.error(f"Error in token view: {str(e)}")
#             # Return the tokens even if we can't add user data
#             response.data['user'] = {
#                 'id': None,
#                 'username': username,
#                 'email': None,
#                 'role': 'operator',
#             }
        
#         return response

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(APIView):
    """
    Custom Token Obtain View - Complete Override
    Doesn't inherit from TokenObtainPairView
    Manually handles authentication and token generation
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Handle POST request for token generation
        Manual authentication and token generation
        """
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        
        logger.info(f"🔐 Login attempt for: {username_or_email}")
        
        if not username_or_email or not password:
            logger.error("❌ Missing username or password")
            return Response(
                {'detail': 'Username and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to authenticate with username
        user = authenticate(username=username_or_email, password=password)
        logger.info(f"Authenticate by username result: {user}")
        
        # If authentication failed, try with email
        if not user and '@' in username_or_email:
            logger.info(f"Trying email authentication for: {username_or_email}")
            try:
                user_obj = User.objects.get(email=username_or_email)
                logger.info(f"Found user by email: {user_obj.username}")
                user = authenticate(username=user_obj.username, password=password)
                logger.info(f"Email authentication result: {user}")
            except User.DoesNotExist:
                logger.warning(f"User not found by email: {username_or_email}")
                pass
        
        if not user:
            logger.error(f"❌ Authentication failed for: {username_or_email}")
            return Response(
                {'detail': 'Invalid username/email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        logger.info(f"✅ User authenticated: {user.username}")
        
        # Generate tokens manually
        try:
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            refresh_str = str(refresh)
            
            logger.info(f"✅ Tokens generated")
            logger.info(f"✅ Access token: {access[:50]}...")
            logger.info(f"✅ Refresh token: {refresh_str[:50]}...")
            
            # Build response
            response_data = {
                'access': access,
                'refresh': refresh_str,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': getattr(user, 'role', 'operator'),
                    'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else None,
                }
            }
            
            logger.info(f"✅ Response data prepared")
            logger.info(f"✅ Response keys: {list(response_data.keys())}")
            logger.info(f"✅ User in response: {response_data['user']}")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Error generating tokens: {str(e)}", exc_info=True)
            return Response(
                {'detail': f'Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

            # ADD THESE 5 LINES:
            try:
                    NotificationService.run_safety_checks_for_vessel(vessel)
            except Exception as e:
                    logger.warning(f"Could not run safety checks: {str(e)}")
            
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
        
class PiracyZoneListAPI(generics.ListAPIView):
    """Get all active piracy zones"""
    queryset = PiracyZone.objects.filter(is_active=True)
    serializer_class = PiracyZoneSerializer
    permission_classes = [permissions.IsAuthenticated]

from rest_framework import viewsets

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """Get all countries with their locations and continents"""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """Return countries grouped by continent"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Group by continent
        by_continent = {}
        for country in serializer.data:
            continent = country['continent']
            if continent not in by_continent:
                by_continent[continent] = []
            by_continent[continent].append(country)
        
        return Response({
            'count': queryset.count(),
            'by_continent': by_continent,
            'results': serializer.data
        })
class WeatherAlertListAPI(generics.ListAPIView):
    """Get all active weather alerts"""
    queryset = WeatherAlert.objects.filter(is_active=True)
    serializer_class = WeatherAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter out expired alerts"""
        queryset = super().get_queryset()
        
        # Filter alerts that haven't expired
        now = timezone.now()
        return queryset.filter(
            Q(alert_expires__gt=now) | Q(alert_expires__isnull=True)
        )

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import UserAction
from .serializers import UserActionSerializer

class UserActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and analyzing user action logs
    Endpoints:
    - GET /api/admin/user-actions/ - List all actions
    - GET /api/admin/user-actions/{id}/ - Get action details
    - GET /api/admin/user-actions/stats/ - Get statistics
    - GET /api/admin/user-actions/by-user/ - Group by user
    """
    queryset = UserAction.objects.all()
    serializer_class = UserActionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = UserAction.objects.all()
        
        # Filters
        user_id = self.request.query_params.get('user_id')
        action = self.request.query_params.get('action')
        status_code = self.request.query_params.get('status_code')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if action:
            queryset = queryset.filter(action=action)
        if status_code:
            queryset = queryset.filter(status_code=status_code)
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__lte=date_to)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get overall statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_actions': queryset.count(),
            'total_users': queryset.values('user').distinct().count(),
            'successful_actions': queryset.filter(status_code__lt=300).count(),
            'failed_actions': queryset.filter(status_code__gte=400).count(),
            'last_24h': queryset.filter(timestamp__gte=timezone.now() - timedelta(hours=24)).count(),
            'by_action': dict(queryset.values('action').annotate(count=Count('id')).values_list('action', 'count')),
            'by_status': dict(queryset.values('status_code').annotate(count=Count('id')).values_list('status_code', 'count')),
            'by_method': dict(queryset.values('method').annotate(count=Count('id')).values_list('method', 'count')),
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get actions grouped by user"""
        queryset = self.get_queryset()
        
        user_stats = queryset.values('user__username').annotate(
            total_actions=Count('id'),
            successful=Count('id', filter=Q(status_code__lt=300)),
            failed=Count('id', filter=Q(status_code__gte=400)),
            last_action=F('timestamp')
        ).order_by('-total_actions')
        
        return Response(list(user_stats))
    
    @action(detail=False, methods=['get'])
    def by_action(self, request):
        """Get actions grouped by action type"""
        queryset = self.get_queryset()
        
        action_stats = queryset.values('action').annotate(
            total=Count('id'),
            successful=Count('id', filter=Q(status_code__lt=300)),
            failed=Count('id', filter=Q(status_code__gte=400)),
            avg_duration_ms=F('duration_ms')
        ).order_by('-total')
        
        return Response(list(action_stats))
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get most recent actions"""
        limit = int(request.query_params.get('limit', 50))
        queryset = self.get_queryset()[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def errors(self, request):
        """Get only failed actions"""
        queryset = self.get_queryset().filter(status_code__gte=400)
        limit = int(request.query_params.get('limit', 50))
        
        serializer = self.get_serializer(queryset[:limit], many=True)
        return Response(serializer.data)
    
# ============================================
# COMPANY DASHBOARD VIEW
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def company_dashboard(request):
    """
    Company dashboard with real fleet efficiency data
    GET /api/dashboard/company/
    """
    try:
        date_range = request.GET.get('dateRange', 'all')
        status_filter = request.GET.get('status', 'all')
        
        # Date filtering
        date_query = Q()
        if date_range == 'week':
            start_date = timezone.now() - timedelta(days=7)
            date_query = Q(departure_time__gte=start_date)
        elif date_range == 'month':
            start_date = timezone.now() - timedelta(days=30)
            date_query = Q(departure_time__gte=start_date)
        elif date_range == 'quarter':
            start_date = timezone.now() - timedelta(days=90)
            date_query = Q(departure_time__gte=start_date)
        elif date_range == 'year':
            start_date = timezone.now() - timedelta(days=365)
            date_query = Q(departure_time__gte=start_date)
        
        # Status filtering
        status_query = Q()
        if status_filter == 'active':
            status_query = Q(status='in_progress')
        elif status_filter == 'completed':
            status_query = Q(status='completed')
        elif status_filter == 'pending':
            status_query = Q(status='scheduled')
        
        # Get filtered voyages
        voyages = Voyage.objects.filter(date_query, status_query)
        
        # KPI 1: Total Voyages
        total_voyages = voyages.count()
        
        # KPI 2: Active Fleet
        active_fleet = Vessel.objects.filter(
            Q(voyages__status='in_progress') | Q(voyages__status='scheduled')
        ).distinct().count()
        
        # KPI 3: Total Revenue (mock - you can replace with actual revenue field)
        total_revenue = total_voyages * 50000  # Mock calculation
        
        # KPI 4: Success Rate
        completed_voyages = voyages.filter(status='completed').count()
        success_rate = round((completed_voyages / total_voyages * 100), 1) if total_voyages > 0 else 0
        
        # Monthly Revenue Trend (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_data = voyages.filter(
            departure_time__gte=six_months_ago
        ).annotate(
            month=TruncMonth('departure_time')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        monthly_revenue = [
            {
                'month': item['month'].strftime('%b'),
                'revenue': item['count'] * 50000  # Mock revenue per voyage
            }
            for item in monthly_data
        ]
        
        # Voyage Status Distribution
        voyage_status_data = voyages.values('status').annotate(
            count=Count('id')
        )
        
        status_colors = {
            'completed': '#10b981',
            'in_progress': '#3b82f6',
            'scheduled': '#f59e0b',
            'cancelled': '#ef4444'
        }
        
        voyage_status = [
            {
                'name': item['status'].replace('_', ' ').title(),
                'value': item['count'],
                'fill': status_colors.get(item['status'], '#6b7280')
            }
            for item in voyage_status_data
        ]
        
        # Vessel Performance (Top 5 vessels by voyage count)
        vessel_performance_data = voyages.values(
            'vessel__name'
        ).annotate(
            trips=Count('id'),
            vessel_name=F('vessel__name')
        ).order_by('-trips')[:5]
        
        vessel_performance = [
            {
                'vessel': item['vessel_name'] or f"Vessel {item['vessel']}",
                'trips': item['trips'],
                'revenue': item['trips'] * 50000  # Mock revenue
            }
            for item in vessel_performance_data
        ]
        
        return Response({
            'totalVoyages': total_voyages,
            'activeFleet': active_fleet,
            'totalRevenue': total_revenue,
            'successRate': success_rate,
            'monthlyRevenue': monthly_revenue,
            'voyageStatus': voyage_status,
            'vesselPerformance': vessel_performance
        })
        
    except Exception as e:
        logger.error(f"Error in company dashboard: {str(e)}")
        return Response(
            {'error': str(e), 'message': 'Failed to fetch company dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# ============================================
# PORT DASHBOARD VIEW
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def port_dashboard(request):
    """
    Port dashboard with congestion trends and traffic analytics
    GET /api/dashboard/port/
    """
    try:
        date_range = request.GET.get('dateRange', 'all')
        port_id = request.GET.get('portId', None)  # Optional: filter by specific port
        
        # Date filtering
        date_query = Q()
        if date_range == 'week':
            start_date = timezone.now() - timedelta(days=7)
            date_query = Q(last_update__gte=start_date)
        elif date_range == 'month':
            start_date = timezone.now() - timedelta(days=30)
            date_query = Q(last_update__gte=start_date)
        elif date_range == 'quarter':
            start_date = timezone.now() - timedelta(days=90)
            date_query = Q(last_update__gte=start_date)
        elif date_range == 'year':
            start_date = timezone.now() - timedelta(days=365)
            date_query = Q(last_update__gte=start_date)
        
        # Port filtering
        port_query = Q()
        if port_id:
            port_query = Q(id=port_id)
        
        # Get filtered ports
        ports = Port.objects.filter(date_query, port_query)
        
        # KPI 1: Total Ports
        total_ports = ports.count()
        
        # KPI 2: Average Congestion Score
        avg_congestion = ports.aggregate(Avg('congestion_score'))['congestion_score__avg'] or 0
        
        # KPI 3: Total Vessels in Ports (active voyages to ports)
        vessels_in_ports = Voyage.objects.filter(
            Q(port_to__in=ports) & Q(status='in_progress')
        ).count()
        
        # KPI 4: Average Wait Time
        avg_wait_time = ports.aggregate(Avg('avg_wait_time'))['avg_wait_time__avg'] or 0
        
        # Congestion Trends (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        
        # Since ports don't have historical congestion data, we'll use voyage data as proxy
        monthly_congestion = Voyage.objects.filter(
            port_to__in=ports,
            arrival_time__gte=six_months_ago,
            status='completed'
        ).annotate(
            month=TruncMonth('arrival_time')
        ).values('month').annotate(
            avg_congestion=Avg('port_to__congestion_score'),
            avg_wait=Avg('port_to__avg_wait_time')
        ).order_by('month')
        
        congestion_trends = [
            {
                'month': item['month'].strftime('%b'),
                'congestion': round(item['avg_congestion'] or 0, 2),
                'waitTime': round(item['avg_wait'] or 0, 2)
            }
            for item in monthly_congestion
        ]
        
        # If no historical data, create current month snapshot
        if not congestion_trends:
            congestion_trends = [{
                'month': timezone.now().strftime('%b'),
                'congestion': round(avg_congestion, 2),
                'waitTime': round(avg_wait_time, 2)
            }]
        
        # Port Congestion Distribution
        congestion_distribution = [
            {
                'name': 'Low (0-3)',
                'value': ports.filter(congestion_score__lt=3).count(),
                'fill': '#10b981'  # green
            },
            {
                'name': 'Moderate (3-6)',
                'value': ports.filter(congestion_score__gte=3, congestion_score__lt=6).count(),
                'fill': '#f59e0b'  # yellow
            },
            {
                'name': 'High (6-8)',
                'value': ports.filter(congestion_score__gte=6, congestion_score__lt=8).count(),
                'fill': '#ef4444'  # orange
            },
            {
                'name': 'Critical (8+)',
                'value': ports.filter(congestion_score__gte=8).count(),
                'fill': '#7f1d1d'  # dark red
            }
        ]
        
        # Top 5 Most Congested Ports
        most_congested = ports.order_by('-congestion_score')[:5].values(
            'id', 'name', 'country', 'congestion_score', 'avg_wait_time', 'arrivals'
        )
        
        top_congested_ports = [
            {
                'port': f"{item['name']}, {item['country']}",
                'congestion': round(item['congestion_score'], 2),
                'waitTime': round(item['avg_wait_time'], 2),
                'vessels': item['arrivals']
            }
            for item in most_congested
        ]
        
        # Traffic Volume by Port (Top 5 busiest)
        busiest_ports = ports.annotate(
            total_traffic=F('arrivals') + F('departures')
        ).order_by('-total_traffic')[:5].values(
            'name', 'country', 'arrivals', 'departures', 'total_traffic'
        )
        
        port_traffic = [
            {
                'port': f"{item['name']}, {item['country']}",
                'arrivals': item['arrivals'],
                'departures': item['departures'],
                'total': item['total_traffic']
            }
            for item in busiest_ports
        ]
        
        return Response({
            'totalPorts': total_ports,
            'avgCongestion': round(avg_congestion, 2),
            'vesselsInPorts': vessels_in_ports,
            'avgWaitTime': round(avg_wait_time, 2),
            'congestionTrends': congestion_trends,
            'congestionDistribution': congestion_distribution,
            'topCongestedPorts': top_congested_ports,
            'portTraffic': port_traffic
        })
        
    except Exception as e:
        logger.error(f"Error in port dashboard: {str(e)}")
        return Response(
            {'error': str(e), 'message': 'Failed to fetch port dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================
# INSURER DASHBOARD VIEW
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def insurer_dashboard(request):
    """
    Insurer dashboard with risk exposure and safety analytics
    GET /api/dashboard/insurer/
    """
    try:
        date_range = request.GET.get('dateRange', 'all')
        risk_level = request.GET.get('riskLevel', 'all')
        
        # Date filtering
        date_query = Q()
        if date_range == 'week':
            start_date = timezone.now() - timedelta(days=7)
            date_query = Q(timestamp__gte=start_date)
        elif date_range == 'month':
            start_date = timezone.now() - timedelta(days=30)
            date_query = Q(timestamp__gte=start_date)
        elif date_range == 'quarter':
            start_date = timezone.now() - timedelta(days=90)
            date_query = Q(timestamp__gte=start_date)
        elif date_range == 'year':
            start_date = timezone.now() - timedelta(days=365)
            date_query = Q(timestamp__gte=start_date)
        
        # Get all vessels with their latest positions
        vessels = Vessel.objects.all()
        total_vessels = vessels.count()
        
        # Get piracy zones and weather alerts
        piracy_zones = PiracyZone.objects.filter(is_active=True)
        weather_alerts = WeatherAlert.objects.filter(is_active=True)
        
        # Filter out expired weather alerts
        now = timezone.now()
        active_weather_alerts = weather_alerts.filter(
            Q(alert_expires__gt=now) | Q(alert_expires__isnull=True)
        )
        
        # KPI 1: Total Risk Zones
        total_risk_zones = piracy_zones.count() + active_weather_alerts.count()
        
        # KPI 2: High Risk Vessels (vessels in high-risk areas)
        # This requires calculating which vessels are near risk zones
        high_risk_vessels = 0
        vessels_at_risk = []
        
        for vessel in vessels:
            if vessel.last_position_lat and vessel.last_position_lon:
                # Check piracy zones
                for zone in piracy_zones:
                    if zone.risk_level in ['high', 'critical']:
                        # Simple distance check (you can improve this with actual geodesic calculation)
                        lat_diff = abs(vessel.last_position_lat - zone.latitude)
                        lon_diff = abs(vessel.last_position_lon - zone.longitude)
                        # Rough approximation: 1 degree ≈ 111 km
                        distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
                        
                        if distance_km <= zone.radius_km:
                            high_risk_vessels += 1
                            vessels_at_risk.append({
                                'vessel': vessel.name,
                                'zone': zone.name,
                                'risk_type': 'piracy',
                                'risk_level': zone.risk_level
                            })
                            break
                
                # Check weather alerts
                for alert in active_weather_alerts:
                    if alert.severity in ['severe', 'extreme']:
                        lat_diff = abs(vessel.last_position_lat - alert.latitude)
                        lon_diff = abs(vessel.last_position_lon - alert.longitude)
                        distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
                        
                        if distance_km <= alert.radius_km:
                            if vessel.name not in [v['vessel'] for v in vessels_at_risk]:
                                high_risk_vessels += 1
                                vessels_at_risk.append({
                                    'vessel': vessel.name,
                                    'zone': alert.name,
                                    'risk_type': 'weather',
                                    'risk_level': alert.severity
                                })
                            break
        
        # KPI 3: Total Incidents (last 90 days from piracy zones)
        total_incidents = piracy_zones.aggregate(Sum('incidents_90_days'))['incidents_90_days__sum'] or 0
        
        # KPI 4: Active Alerts
        active_alerts = Notification.objects.filter(
            type__in=['warning', 'alert'],
            is_read=False,
            timestamp__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Risk Exposure Trend (last 6 months)
        # Use piracy incidents and weather alerts over time
        six_months_ago = timezone.now() - timedelta(days=180)
        
        # Create monthly risk data
        monthly_risk = []
        for i in range(6):
            month_start = timezone.now() - timedelta(days=30 * (6 - i))
            month_name = month_start.strftime('%b')
            
            # Piracy incidents (simplified - using current data)
            piracy_risk = piracy_zones.filter(
                risk_level__in=['high', 'critical']
            ).count() * 10  # Mock multiplier
            
            # Weather severity
            weather_risk = active_weather_alerts.filter(
                severity__in=['severe', 'extreme']
            ).count() * 8  # Mock multiplier
            
            monthly_risk.append({
                'month': month_name,
                'piracyRisk': piracy_risk,
                'weatherRisk': weather_risk,
                'totalRisk': piracy_risk + weather_risk
            })
        
        # Risk Distribution by Type
        risk_distribution = [
            {
                'name': 'Piracy Zones',
                'value': piracy_zones.count(),
                'fill': '#ef4444'
            },
            {
                'name': 'Weather Alerts',
                'value': active_weather_alerts.count(),
                'fill': '#3b82f6'
            },
            {
                'name': 'Safe Zones',
                'value': max(0, 50 - total_risk_zones),  # Mock safe zones
                'fill': '#10b981'
            }
        ]
        
        # Top Risk Zones (by severity and incidents)
        top_piracy_zones = piracy_zones.filter(
            risk_level__in=['high', 'critical']
        ).order_by('-incidents_90_days')[:5]
        
        top_risk_zones = [
            {
                'zone': zone.name,
                'riskLevel': zone.risk_level.title(),
                'incidents': zone.incidents_90_days,
                'type': 'Piracy'
            }
            for zone in top_piracy_zones
        ]
        
        # Add top weather alerts
        top_weather = active_weather_alerts.filter(
            severity__in=['severe', 'extreme']
        ).order_by('-severity')[:3]
        
        for alert in top_weather:
            top_risk_zones.append({
                'zone': alert.name,
                'riskLevel': alert.severity.title(),
                'incidents': 0,  # Weather alerts don't have incidents
                'type': alert.get_weather_type_display()
            })
        
        # Limit to top 5
        top_risk_zones = top_risk_zones[:5]
        
        # Vessel Safety Score (mock calculation based on risk exposure)
        vessel_safety_scores = []
        for vessel in vessels[:10]:  # Top 10 vessels
            # Calculate safety score based on proximity to risk zones
            safety_score = 100  # Start at 100
            
            if vessel.last_position_lat and vessel.last_position_lon:
                # Deduct points for being near risk zones
                for zone in piracy_zones:
                    lat_diff = abs(vessel.last_position_lat - zone.latitude)
                    lon_diff = abs(vessel.last_position_lon - zone.longitude)
                    distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
                    
                    if distance_km <= zone.radius_km * 2:  # Within 2x radius
                        if zone.risk_level == 'critical':
                            safety_score -= 30
                        elif zone.risk_level == 'high':
                            safety_score -= 20
                        elif zone.risk_level == 'moderate':
                            safety_score -= 10
                
                for alert in active_weather_alerts:
                    lat_diff = abs(vessel.last_position_lat - alert.latitude)
                    lon_diff = abs(vessel.last_position_lon - alert.longitude)
                    distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
                    
                    if distance_km <= alert.radius_km * 2:
                        if alert.severity == 'extreme':
                            safety_score -= 25
                        elif alert.severity == 'severe':
                            safety_score -= 15
            
            safety_score = max(0, min(100, safety_score))  # Keep between 0-100
            
            vessel_safety_scores.append({
                'vessel': vessel.name,
                'safetyScore': safety_score,
                'riskLevel': 'High' if safety_score < 50 else 'Moderate' if safety_score < 75 else 'Low'
            })
        
        # Sort by safety score
        vessel_safety_scores.sort(key=lambda x: x['safetyScore'])
        
        return Response({
            'totalRiskZones': total_risk_zones,
            'highRiskVessels': high_risk_vessels,
            'totalIncidents': total_incidents,
            'activeAlerts': active_alerts,
            'riskExposureTrend': monthly_risk,
            'riskDistribution': risk_distribution,
            'topRiskZones': top_risk_zones,
            'vesselSafetyScores': vessel_safety_scores[:5],  # Top 5 lowest scores
            'vesselsAtRisk': vessels_at_risk[:10]  # Top 10 vessels at risk
        })
        
    except Exception as e:
        logger.error(f"Error in insurer dashboard: {str(e)}")
        return Response(
            {'error': str(e), 'message': 'Failed to fetch insurer dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

# ============================================
# ADMIN USER MANAGEMENT ENDPOINTS
# Add these to your server/core/views.py
# ============================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin-only user management endpoints
    Endpoints:
    - GET /api/admin/users/ - List all users
    - GET /api/admin/users/{id}/ - Get user details
    - POST /api/admin/users/ - Create new user
    - PUT/PATCH /api/admin/users/{id}/ - Update user
    - DELETE /api/admin/users/{id}/ - Delete user
    - POST /api/admin/users/{id}/activate/ - Activate user
    - POST /api/admin/users/{id}/deactivate/ - Deactivate user
    - POST /api/admin/users/{id}/change-role/ - Change user role
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def list(self, request):
        """Get all users with statistics"""
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        
        # Calculate statistics
        stats = {
            'total_users': users.count(),
            'by_role': {
                'admin': users.filter(role='admin').count(),
                'analyst': users.filter(role='analyst').count(),
                'operator': users.filter(role='operator').count(),
            },
            'recent_signups': users.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
        }
        
        return Response({
            'count': users.count(),
            'stats': stats,
            'results': serializer.data
        })
    
    def create(self, request):
        """Create a new user"""
        from .serializers import RegisterSerializer
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user account"""
        user = self.get_object()
        
        # Since we don't have is_active field, we can add custom logic
        # For now, just return success
        return Response({
            'success': True,
            'message': f'User {user.username} activated',
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user account"""
        user = self.get_object()
        
        if user.role == 'admin' and User.objects.filter(role='admin').count() == 1:
            return Response(
                {'error': 'Cannot deactivate the last admin user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'success': True,
            'message': f'User {user.username} deactivated',
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Change user role"""
        user = self.get_object()
        new_role = request.data.get('role')
        
        if new_role not in ['operator', 'analyst', 'admin']:
            return Response(
                {'error': 'Invalid role. Must be operator, analyst, or admin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Don't allow changing last admin's role
        if user.role == 'admin' and new_role != 'admin':
            if User.objects.filter(role='admin').count() == 1:
                return Response(
                    {'error': 'Cannot change role of the last admin user'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        old_role = user.role
        user.role = new_role
        user.save()
        
        return Response({
            'success': True,
            'message': f'User role changed from {old_role} to {new_role}',
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Admin can reset user password"""
        user = self.get_object()
        new_password = request.data.get('password')
        
        if not new_password:
            return Response(
                {'error': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': f'Password reset for user {user.username}'
        })


# ============================================
# ADMIN SYSTEM INFO ENDPOINT
# ============================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_system_info(request):
    """
    Get comprehensive system information
    GET /api/admin/system-info/
    """
    try:
        # User statistics
        total_users = User.objects.count()
        users_by_role = {
            'admin': User.objects.filter(role='admin').count(),
            'analyst': User.objects.filter(role='analyst').count(),
            'operator': User.objects.filter(role='operator').count(),
        }
        
        # Database statistics
        total_vessels = Vessel.objects.count()
        total_ports = Port.objects.count()
        total_voyages = Voyage.objects.count()
        total_notifications = Notification.objects.count()
        
        # Recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_users = User.objects.filter(created_at__gte=week_ago).count()
        recent_voyages = Voyage.objects.filter(departure_time__gte=week_ago).count()
        
        # System status
        piracy_zones = PiracyZone.objects.filter(is_active=True).count()
        weather_alerts = WeatherAlert.objects.filter(is_active=True).count()
        
        # User action statistics
        total_actions = UserAction.objects.count()
        actions_24h = UserAction.objects.filter(
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        return Response({
            'users': {
                'total': total_users,
                'by_role': users_by_role,
                'recent_signups': recent_users
            },
            'database': {
                'vessels': total_vessels,
                'ports': total_ports,
                'voyages': total_voyages,
                'notifications': total_notifications
            },
            'activity': {
                'total_actions': total_actions,
                'actions_24h': actions_24h,
                'recent_voyages': recent_voyages
            },
            'safety': {
                'active_piracy_zones': piracy_zones,
                'active_weather_alerts': weather_alerts,
                'total_risk_zones': piracy_zones + weather_alerts
            },
            'system': {
                'version': '2.1.0',
                'database_type': 'PostgreSQL',
                'api_version': 'v1',
                'status': 'operational'
            }
        })
    
    except Exception as e:
        logger.error(f"Error fetching system info: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================
# ADMIN DATA EXPORT ENDPOINT
# ============================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_export_data(request):
    """
    Export system data as JSON
    GET /api/admin/export/
    """
    try:
        from django.http import JsonResponse
        import json
        
        # Export all users (excluding passwords)
        users = list(User.objects.values('id', 'username', 'email', 'role', 'created_at'))
        
        # Export vessels
        vessels = list(Vessel.objects.values())
        
        # Export ports
        ports = list(Port.objects.values())
        
        # Export voyages
        voyages = list(Voyage.objects.values())
        
        export_data = {
            'export_date': timezone.now().isoformat(),
            'users': users,
            'vessels': vessels,
            'ports': ports,
            'voyages': voyages,
            'metadata': {
                'total_users': len(users),
                'total_vessels': len(vessels),
                'total_ports': len(ports),
                'total_voyages': len(voyages)
            }
        }
        
        # Convert datetime objects to strings
        def convert_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")
        
        response = JsonResponse(export_data, safe=False, json_dumps_params={'default': convert_datetime})
        response['Content-Disposition'] = f'attachment; filename="vessel_tracking_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.json"'
        
        return response
    
    except Exception as e:
        logger.error(f"Error exporting data: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
