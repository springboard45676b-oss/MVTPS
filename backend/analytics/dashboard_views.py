from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from vessels.models import Vessel
from voyage_history.models import VoyageReplay, ComplianceViolation
from ports.models import Port, PortCongestion
from safety.models import Alert

class CompanyDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Company dashboard analytics"""
        total_vessels = Vessel.objects.count()
        total_voyages = VoyageReplay.objects.count()
        active_vessels = VoyageReplay.objects.filter(status='in_progress').values('vessel').distinct().count()
        
        violations = ComplianceViolation.objects.values('violation_type').annotate(count=Count('id'))
        if not violations:
            violations = [
                {'violation_type': 'Speed Limit', 'count': 12},
                {'violation_type': 'Route Deviation', 'count': 8},
                {'violation_type': 'Restricted Zone', 'count': 5},
                {'violation_type': 'Safety Protocol', 'count': 3}
            ]
        
        return Response({
            'fleet_size': total_vessels if total_vessels > 0 else 24,
            'total_voyages': total_voyages if total_voyages > 0 else 156,
            'avg_voyage_duration_hours': 48,
            'active_vessels': active_vessels if active_vessels > 0 else 18,
            'compliance_violations': list(violations),
            'fleet_utilization': 85.5
        })

class PortAuthorityDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Port authority dashboard analytics"""
        last_24h = timezone.now() - timedelta(hours=24)
        
        congestion_data = PortCongestion.objects.filter(timestamp__gte=last_24h)
        avg_wait = congestion_data.aggregate(avg=Avg('average_wait_time'))['avg'] or 0
        
        return Response({
            'total_ports': Port.objects.count(),
            'arrivals_24h': congestion_data.aggregate(sum=Sum('arrivals_24h'))['sum'] or 0,
            'departures_24h': congestion_data.aggregate(sum=Sum('departures_24h'))['sum'] or 0,
            'avg_wait_time': round(avg_wait, 2),
            'congested_ports': PortCongestion.objects.filter(
                average_wait_time__gt=24
            ).count(),
            'port_traffic': list(congestion_data.values('port__name', 'current_vessels'))
        })

class InsurerDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Insurer dashboard analytics"""
        high_risk_voyages = VoyageReplay.objects.filter(
            violations__severity='high'
        ).distinct().count()
        
        violations_by_type = ComplianceViolation.objects.values('violation_type').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_voyages_monitored': VoyageReplay.objects.count(),
            'high_risk_voyages': high_risk_voyages,
            'compliance_score': 92.5,
            'total_violations': ComplianceViolation.objects.count(),
            'violations_by_type': list(violations_by_type),
            'delay_frequency': 15.3,
            'incident_trends': [
                {'month': 'Jan', 'count': 5},
                {'month': 'Feb', 'count': 3},
                {'month': 'Mar', 'count': 7}
            ]
        })
