"""
Admin Management Views
Handles user management, system monitoring, and administrative functions
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, F
from django.utils import timezone
from django.http import JsonResponse
from datetime import timedelta, datetime
import logging
import json

from ..models import (
    UserAction,
    Vessel,
    Port,
    Voyage,
    Notification,
    PiracyZone,
    WeatherAlert,
)
from ..serializers import (
    UserSerializer,
    RegisterSerializer,
    UserActionSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


# ============================================
# USER MANAGEMENT VIEWSET
# ============================================

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
# USER ACTION LOGGING VIEWSET
# ============================================

class UserActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and analyzing user action logs
    Endpoints:
    - GET /api/admin/user-actions/ - List all actions
    - GET /api/admin/user-actions/{id}/ - Get action details
    - GET /api/admin/user-actions/recent/ - Get recent actions
    - GET /api/admin/user-actions/stats/ - Get statistics
    - GET /api/admin/user-actions/by-user/ - Group by user
    """
    queryset = UserAction.objects.all().order_by('-timestamp')
    serializer_class = UserActionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = UserAction.objects.all().order_by('-timestamp')
        
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
    def recent(self, request):
        """Get recent user actions"""
        limit = int(request.query_params.get('limit', 50))
        queryset = self.get_queryset()[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
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


# ============================================
# SYSTEM INFORMATION ENDPOINT
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
# DATA EXPORT ENDPOINT
# ============================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_export_data(request):
    """
    Export system data as JSON
    GET /api/admin/export/
    """
    try:
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