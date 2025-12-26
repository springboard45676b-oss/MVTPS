from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.db.models import Avg, Count
from datetime import datetime, timedelta
from .models import Port, PortCongestion, VesselMovement
from services.port_analytics import PortCongestionAnalyzer
import json

class PortCongestionAnalyticsView(APIView):
    """
    Comprehensive port congestion analytics with UNCTAD integration
    """
    
    def get(self, request):
        port_code = request.GET.get('port_code')
        
        if port_code:
            return self._get_single_port_analytics(port_code)
        else:
            return self._get_all_ports_overview()
    
    def _get_single_port_analytics(self, port_code):
        """Get detailed analytics for a specific port"""
        try:
            port = Port.objects.get(code=port_code)
            analyzer = PortCongestionAnalyzer()
            
            # Check cache first
            cache_key = f"port_analytics_{port_code}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Generate comprehensive analytics
            analytics = analyzer.generate_port_analytics(port)
            
            if analytics:
                # Cache for 5 minutes
                cache.set(cache_key, analytics, 300)
                return Response(analytics)
            else:
                return Response(
                    {'error': 'No congestion data available for this port'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Port.DoesNotExist:
            return Response(
                {'error': 'Port not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _get_all_ports_overview(self):
        """Get overview of all ports with current congestion status"""
        cache_key = "all_ports_congestion_overview"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        ports_data = []
        analyzer = PortCongestionAnalyzer()
        
        for port in Port.objects.filter(is_active=True):
            latest_congestion = port.congestion_data.first()
            
            if latest_congestion:
                port_summary = {
                    'port_name': port.name,
                    'port_code': port.code,
                    'country': port.country,
                    'coordinates': [port.latitude, port.longitude],
                    'congestion_level': latest_congestion.congestion_level,
                    'current_vessels': latest_congestion.current_vessels,
                    'waiting_vessels': latest_congestion.waiting_vessels,
                    'utilization_percentage': port.congestion_percentage,
                    'average_wait_time': latest_congestion.average_wait_time,
                    'arrivals_24h': latest_congestion.arrivals_24h,
                    'departures_24h': latest_congestion.departures_24h,
                    'efficiency': latest_congestion.throughput_efficiency,
                    'last_updated': latest_congestion.timestamp
                }
                ports_data.append(port_summary)
        
        # Sort by congestion level (critical first)
        congestion_priority = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        ports_data.sort(
            key=lambda x: congestion_priority.get(x['congestion_level'], 0),
            reverse=True
        )
        
        overview = {
            'total_ports': len(ports_data),
            'congestion_summary': self._get_congestion_summary(ports_data),
            'ports': ports_data,
            'last_updated': datetime.now()
        }
        
        # Cache for 2 minutes
        cache.set(cache_key, overview, 120)
        return Response(overview)
    
    def _get_congestion_summary(self, ports_data):
        """Generate summary statistics for all ports"""
        summary = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
        total_vessels = 0
        total_wait_time = 0
        
        for port in ports_data:
            summary[port['congestion_level']] += 1
            total_vessels += port['current_vessels']
            total_wait_time += port['average_wait_time']
        
        avg_wait_time = total_wait_time / len(ports_data) if ports_data else 0
        
        return {
            'by_level': summary,
            'total_vessels_in_ports': total_vessels,
            'average_wait_time_global': round(avg_wait_time, 1),
            'ports_with_delays': summary['high'] + summary['critical']
        }

class CongestionAlertsView(APIView):
    """Get congestion alerts and warnings"""
    
    def get(self, request):
        cache_key = "congestion_alerts"
        cached_alerts = cache.get(cache_key)
        
        if cached_alerts:
            return Response(cached_alerts)
        
        # Get recent congestion data
        recent_congestion = PortCongestion.objects.filter(
            timestamp__gte=datetime.now() - timedelta(hours=6)
        ).select_related('port')
        
        analyzer = PortCongestionAnalyzer()
        alerts = analyzer.detect_congestion_alerts(recent_congestion)
        
        # Sort by severity and timestamp
        severity_order = {'critical': 3, 'high': 2, 'medium': 1, 'low': 0}
        alerts.sort(
            key=lambda x: (severity_order.get(x['level'], 0), x['timestamp']),
            reverse=True
        )
        
        response_data = {
            'total_alerts': len(alerts),
            'critical_alerts': len([a for a in alerts if a['level'] == 'critical']),
            'alerts': alerts[:20],  # Limit to 20 most recent
            'generated_at': datetime.now()
        }
        
        # Cache for 1 minute
        cache.set(cache_key, response_data, 60)
        return Response(response_data)

class PortThroughputAnalyticsView(APIView):
    """Port throughput and efficiency analytics"""
    
    def get(self, request):
        port_code = request.GET.get('port_code')
        days = int(request.GET.get('days', 7))
        
        try:
            port = Port.objects.get(code=port_code)
            
            # Get vessel movements for the period
            start_date = datetime.now() - timedelta(days=days)
            movements = VesselMovement.objects.filter(
                port=port,
                actual_time__gte=start_date
            )
            
            # Calculate daily statistics
            daily_stats = []
            for i in range(days):
                day_start = start_date + timedelta(days=i)
                day_end = day_start + timedelta(days=1)
                
                day_movements = movements.filter(
                    actual_time__gte=day_start,
                    actual_time__lt=day_end
                )
                
                arrivals = day_movements.filter(movement_type='arrival').count()
                departures = day_movements.filter(movement_type='departure').count()
                avg_wait = day_movements.filter(
                    movement_type='arrival'
                ).aggregate(avg_wait=Avg('wait_time_hours'))['avg_wait'] or 0
                
                daily_stats.append({
                    'date': day_start.date(),
                    'arrivals': arrivals,
                    'departures': departures,
                    'net_change': arrivals - departures,
                    'average_wait_time': round(avg_wait, 1)
                })
            
            # Calculate period totals
            total_arrivals = movements.filter(movement_type='arrival').count()
            total_departures = movements.filter(movement_type='departure').count()
            avg_wait_period = movements.filter(
                movement_type='arrival'
            ).aggregate(avg_wait=Avg('wait_time_hours'))['avg_wait'] or 0
            
            analytics = {
                'port_name': port.name,
                'port_code': port.code,
                'period_days': days,
                'period_summary': {
                    'total_arrivals': total_arrivals,
                    'total_departures': total_departures,
                    'average_daily_arrivals': round(total_arrivals / days, 1),
                    'average_daily_departures': round(total_departures / days, 1),
                    'average_wait_time': round(avg_wait_period, 1),
                    'port_efficiency': port.port_efficiency_index
                },
                'daily_statistics': daily_stats,
                'generated_at': datetime.now()
            }
            
            return Response(analytics)
            
        except Port.DoesNotExist:
            return Response(
                {'error': 'Port not found'},
                status=status.HTTP_404_NOT_FOUND
            )