"""
Dashboard Analytics Views
Provides analytics and metrics for different stakeholder dashboards
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count, Sum, Q, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
import logging

from ..models import (
    Vessel,
    Port,
    Voyage,
    PiracyZone,
    WeatherAlert,
    Notification,
)
from ..serializers import VesselSerializer

logger = logging.getLogger(__name__)


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
        port_id = request.GET.get('portId', None)
        
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
        
        # KPI 3: Total Vessels in Ports
        vessels_in_ports = Voyage.objects.filter(
            Q(port_to__in=ports) & Q(status='in_progress')
        ).count()
        
        # KPI 4: Average Wait Time
        avg_wait_time = ports.aggregate(Avg('avg_wait_time'))['avg_wait_time__avg'] or 0
        
        # Congestion Trends (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
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
                'fill': '#10b981'
            },
            {
                'name': 'Moderate (3-6)',
                'value': ports.filter(congestion_score__gte=3, congestion_score__lt=6).count(),
                'fill': '#f59e0b'
            },
            {
                'name': 'High (6-8)',
                'value': ports.filter(congestion_score__gte=6, congestion_score__lt=8).count(),
                'fill': '#ef4444'
            },
            {
                'name': 'Critical (8+)',
                'value': ports.filter(congestion_score__gte=8).count(),
                'fill': '#7f1d1d'
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
        
        # KPI 2: High Risk Vessels
        high_risk_vessels = 0
        vessels_at_risk = []
        
        for vessel in vessels:
            if vessel.last_position_lat and vessel.last_position_lon:
                # Check piracy zones
                for zone in piracy_zones:
                    if zone.risk_level in ['high', 'critical']:
                        lat_diff = abs(vessel.last_position_lat - zone.latitude)
                        lon_diff = abs(vessel.last_position_lon - zone.longitude)
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
        
        # KPI 3: Total Incidents
        total_incidents = piracy_zones.aggregate(Sum('incidents_90_days'))['incidents_90_days__sum'] or 0
        
        # KPI 4: Active Alerts
        active_alerts = Notification.objects.filter(
            type__in=['warning', 'alert'],
            is_read=False,
            timestamp__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Risk Exposure Trend (last 6 months - mock data)
        monthly_risk = []
        for i in range(6):
            month_start = timezone.now() - timedelta(days=30 * (6 - i))
            month_name = month_start.strftime('%b')
            
            piracy_risk = piracy_zones.filter(risk_level__in=['high', 'critical']).count() * 10
            weather_risk = active_weather_alerts.filter(severity__in=['severe', 'extreme']).count() * 8
            
            monthly_risk.append({
                'month': month_name,
                'piracyRisk': piracy_risk,
                'weatherRisk': weather_risk,
                'totalRisk': piracy_risk + weather_risk
            })
        
        # Risk Distribution by Type
        risk_distribution = [
            {'name': 'Piracy Zones', 'value': piracy_zones.count(), 'fill': '#ef4444'},
            {'name': 'Weather Alerts', 'value': active_weather_alerts.count(), 'fill': '#3b82f6'},
            {'name': 'Safe Zones', 'value': max(0, 50 - total_risk_zones), 'fill': '#10b981'}
        ]
        
        # Top Risk Zones
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
        
        # Vessel Safety Scores
        vessel_safety_scores = []
        for vessel in vessels[:10]:
            safety_score = 100
            
            if vessel.last_position_lat and vessel.last_position_lon:
                for zone in piracy_zones:
                    lat_diff = abs(vessel.last_position_lat - zone.latitude)
                    lon_diff = abs(vessel.last_position_lon - zone.longitude)
                    distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111
                    
                    if distance_km <= zone.radius_km * 2:
                        if zone.risk_level == 'critical':
                            safety_score -= 30
                        elif zone.risk_level == 'high':
                            safety_score -= 20
            
            safety_score = max(0, min(100, safety_score))
            
            vessel_safety_scores.append({
                'vessel': vessel.name,
                'safetyScore': safety_score,
                'riskLevel': 'High' if safety_score < 50 else 'Moderate' if safety_score < 75 else 'Low'
            })
        
        vessel_safety_scores.sort(key=lambda x: x['safetyScore'])
        
        return Response({
            'totalRiskZones': total_risk_zones,
            'highRiskVessels': high_risk_vessels,
            'totalIncidents': total_incidents,
            'activeAlerts': active_alerts,
            'riskExposureTrend': monthly_risk,
            'riskDistribution': risk_distribution,
            'topRiskZones': top_risk_zones,
            'vesselSafetyScores': vessel_safety_scores[:5],
            'vesselsAtRisk': vessels_at_risk[:10]
        })
        
    except Exception as e:
        logger.error(f"Error in insurer dashboard: {str(e)}")
        return Response(
            {'error': str(e), 'message': 'Failed to fetch insurer dashboard data'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )