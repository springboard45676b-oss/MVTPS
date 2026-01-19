"""
API Views for Maritime Vessel Tracking Platform.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    User, Vessel, Port, Voyage, VoyageWaypoint,
    SafetyZone, Event, Notification, APISource, SystemLog
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    ChangePasswordSerializer, VesselSerializer, VesselListSerializer,
    VesselPositionSerializer, PortSerializer, PortAnalyticsSerializer,
    VoyageSerializer, VoyageListSerializer, VoyageWaypointSerializer,
    SafetyZoneSerializer, EventSerializer, NotificationSerializer,
    APISourceSerializer, SystemLogSerializer, DashboardStatsSerializer
)


# ============== Authentication Views ==============

class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        user.last_activity = timezone.now()
        user.save(update_fields=['last_activity'])
        
        refresh = RefreshToken.for_user(user)
        
        # Log the login
        SystemLog.objects.create(
            level='info',
            module='auth',
            message=f'User login: {user.email}',
            user=user,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful.'
        })


class LogoutView(APIView):
    """User logout endpoint."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout successful.'})
        except Exception:
            return Response({'message': 'Logout successful.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change password endpoint."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({'message': 'Password changed successfully.'})


# ============== Vessel Views ==============

class VesselViewSet(viewsets.ModelViewSet):
    """ViewSet for Vessel CRUD operations."""
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['vessel_type', 'flag', 'status']
    search_fields = ['name', 'imo_number', 'mmsi', 'destination']
    ordering_fields = ['name', 'last_update', 'speed']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VesselListSerializer
        return VesselSerializer
    
    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get all vessels with their current positions."""
        vessels = self.queryset.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )
        serializer = VesselPositionSerializer(vessels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get vessel statistics."""
        stats = {
            'total': self.queryset.count(),
            'by_type': dict(self.queryset.values('vessel_type').annotate(count=Count('id')).values_list('vessel_type', 'count')),
            'by_status': dict(self.queryset.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'sailing': self.queryset.filter(status='sailing').count(),
            'docked': self.queryset.filter(status='docked').count(),
            'avg_speed': self.queryset.filter(status='sailing').aggregate(avg=Avg('speed'))['avg'] or 0,
        }
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """Get events for a specific vessel."""
        vessel = self.get_object()
        events = vessel.events.all()[:50]
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def voyages(self, request, pk=None):
        """Get voyages for a specific vessel."""
        vessel = self.get_object()
        voyages = vessel.voyages.all()[:20]
        serializer = VoyageListSerializer(voyages, many=True)
        return Response(serializer.data)


# ============== Port Views ==============

class PortViewSet(viewsets.ModelViewSet):
    """ViewSet for Port CRUD operations."""
    queryset = Port.objects.all()
    serializer_class = PortSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['country']
    search_fields = ['name', 'code', 'country']
    ordering_fields = ['name', 'congestion_score', 'avg_wait_time']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get port analytics data."""
        ports = self.queryset.all()
        serializer = PortAnalyticsSerializer(ports, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def congestion(self, request):
        """Get ports sorted by congestion."""
        ports = self.queryset.order_by('-congestion_score')[:20]
        serializer = PortAnalyticsSerializer(ports, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """Get events for a specific port."""
        port = self.get_object()
        events = port.events.all()[:50]
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


# ============== Voyage Views ==============

class VoyageViewSet(viewsets.ModelViewSet):
    """ViewSet for Voyage CRUD operations."""
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'vessel']
    search_fields = ['voyage_id', 'vessel__name']
    ordering_fields = ['departure_time', 'arrival_time']
    ordering = ['-departure_time']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VoyageListSerializer
        return VoyageSerializer
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get voyage history."""
        voyages = self.queryset.filter(status='completed')[:100]
        serializer = VoyageListSerializer(voyages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active voyages."""
        voyages = self.queryset.filter(status='in_transit')
        serializer = VoyageListSerializer(voyages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def waypoints(self, request, pk=None):
        """Get waypoints for voyage replay."""
        voyage = self.get_object()
        waypoints = voyage.waypoints.all()
        serializer = VoyageWaypointSerializer(waypoints, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        """Get audit trail for a voyage."""
        voyage = self.get_object()
        events = voyage.events.all()
        serializer = EventSerializer(events, many=True)
        return Response({
            'voyage': VoyageSerializer(voyage).data,
            'events': serializer.data
        })


# ============== Safety Zone Views ==============

class SafetyZoneViewSet(viewsets.ModelViewSet):
    """ViewSet for SafetyZone CRUD operations."""
    queryset = SafetyZone.objects.filter(is_active=True)
    serializer_class = SafetyZoneSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['zone_type', 'severity']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active safety zones."""
        zones = self.queryset.filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=timezone.now())
        )
        serializer = SafetyZoneSerializer(zones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def piracy(self, request):
        """Get piracy risk zones."""
        zones = self.queryset.filter(zone_type='piracy')
        serializer = SafetyZoneSerializer(zones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def weather(self, request):
        """Get weather warning zones."""
        zones = self.queryset.filter(zone_type='weather')
        serializer = SafetyZoneSerializer(zones, many=True)
        return Response(serializer.data)


# ============== Event Views ==============

class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for Event CRUD operations."""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event_type', 'is_critical']
    search_fields = ['title', 'description']
    ordering = ['-timestamp']
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent events."""
        limit = int(request.query_params.get('limit', 20))
        events = self.queryset.all()[:limit]
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get critical alerts."""
        events = self.queryset.filter(is_critical=True)[:50]
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


# ============== Notification Views ==============

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification operations."""
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications."""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read.'})


# ============== Dashboard Views ==============

class DashboardView(APIView):
    """Dashboard statistics and overview."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Gather statistics
        stats = {
            'active_vessels': Vessel.objects.filter(status='sailing').count(),
            'total_vessels': Vessel.objects.count(),
            'total_ports': Port.objects.count(),
            'active_alerts': Event.objects.filter(is_critical=True, timestamp__gte=timezone.now() - timezone.timedelta(hours=24)).count(),
            'active_voyages': Voyage.objects.filter(status='in_transit').count(),
            'vessels_by_type': dict(Vessel.objects.values('vessel_type').annotate(count=Count('id')).values_list('vessel_type', 'count')),
            'port_congestion_avg': Port.objects.aggregate(avg=Avg('congestion_score'))['avg'] or 0,
        }
        
        # Recent events
        recent_events = Event.objects.all()[:10]
        stats['recent_events'] = EventSerializer(recent_events, many=True).data
        
        # Traffic data (last 7 days simulation)
        stats['traffic_data'] = {
            'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'arrivals': [245, 312, 287, 356, 298, 275, 320],
            'departures': [232, 298, 275, 342, 285, 268, 310],
        }
        
        return Response(stats)


# ============== Admin Views ==============

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management (Admin only)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']


class APISourceViewSet(viewsets.ModelViewSet):
    """ViewSet for API Source management."""
    queryset = APISource.objects.all()
    serializer_class = APISourceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for System Logs (read-only)."""
    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['level', 'module']
    search_fields = ['message']


class SystemHealthView(APIView):
    """System health check endpoint."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        health = {
            'status': 'operational',
            'database': 'connected',
            'timestamp': timezone.now().isoformat(),
            'stats': {
                'total_users': User.objects.count(),
                'total_vessels': Vessel.objects.count(),
                'total_ports': Port.objects.count(),
                'total_voyages': Voyage.objects.count(),
                'api_calls_today': 142847,  # Simulated
            }
        }
        return Response(health)