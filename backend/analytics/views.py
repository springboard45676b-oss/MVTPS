from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from vessels.models import Vessel, Voyage
from ports.models import PortCongestion
from safety.models import WeatherAlert, Incident
from users.models import Notification, User
from users.permissions import IsAdmin
from admin_tools.models import SystemLog, APISource

class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]
    
    def get(self, request):
        # User management stats
        total_users = User.objects.count()
        operators = User.objects.filter(role='operator').count()
        analysts = User.objects.filter(role='analyst').count()
        admins = User.objects.filter(role='admin').count()
        
        # System health
        api_sources = APISource.objects.count()
        active_sources = APISource.objects.filter(status='active').count()
        recent_errors = SystemLog.objects.filter(
            level='error',
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        return Response({
            'users': {
                'total': total_users,
                'operators': operators,
                'analysts': analysts,
                'admins': admins
            },
            'system': {
                'api_sources': api_sources,
                'active_sources': active_sources,
                'recent_errors': recent_errors,
                'uptime': '99.9%'
            }
        })

class AnalystDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['analyst', 'admin']:
            return Response({'error': 'Access denied'}, status=403)
        
        # Congestion analytics
        high_congestion_ports = PortCongestion.objects.filter(
            congestion_level__in=['high', 'critical']
        ).count()
        
        # Safety analytics
        active_incidents = Incident.objects.filter(is_resolved=False).count()
        weather_alerts = WeatherAlert.objects.filter(is_active=True).count()
        
        # Voyage analytics
        total_voyages = Voyage.objects.count()
        completed_voyages = Voyage.objects.filter(status='completed').count()
        
        return Response({
            'congestion': {
                'high_risk_ports': high_congestion_ports,
                'total_ports_monitored': PortCongestion.objects.values('port').distinct().count()
            },
            'safety': {
                'active_incidents': active_incidents,
                'weather_alerts': weather_alerts
            },
            'voyages': {
                'total': total_voyages,
                'completed': completed_voyages,
                'completion_rate': (completed_voyages / total_voyages * 100) if total_voyages > 0 else 0
            }
        })

class OperatorDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['operator', 'analyst', 'admin']:
            return Response({'error': 'Access denied'}, status=403)
        
        # Live vessel data
        total_vessels = Vessel.objects.filter(is_active=True).count()
        active_voyages = Voyage.objects.filter(status='active').count()
        
        # Recent alerts
        recent_alerts = WeatherAlert.objects.filter(
            is_active=True,
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        return Response({
            'vessels': {
                'total_active': total_vessels,
                'in_voyage': active_voyages,
                'at_port': total_vessels - active_voyages
            },
            'alerts': {
                'recent_weather': recent_alerts,
                'safety_notifications': request.user.notifications.filter(is_read=False).count()
            }
        })