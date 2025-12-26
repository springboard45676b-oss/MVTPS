"""
API views for port analytics using UNCTAD data
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import datetime, timedelta
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def port_congestion_analytics(request):
    """Get port congestion analytics data"""
    
    try:
        from analytics.models import PortCongestionMetric, Country
        
        # Get latest year data
        latest_year = PortCongestionMetric.objects.aggregate(
            max_year=models.Max('year')
        )['max_year'] or 2021
        
        # Top 10 most congested ports
        most_congested = PortCongestionMetric.objects.filter(
            year=latest_year
        ).order_by('-congestion_index')[:10].values(
            'country__name', 'congestion_index', 'total_port_calls', 'efficiency_score'
        )
        
        # Top 10 most efficient ports
        most_efficient = PortCongestionMetric.objects.filter(
            year=latest_year
        ).order_by('-efficiency_score')[:10].values(
            'country__name', 'efficiency_score', 'total_port_calls', 'congestion_index'
        )
        
        # Global statistics
        global_stats = PortCongestionMetric.objects.filter(
            year=latest_year
        ).aggregate(
            total_calls=Sum('total_port_calls'),
            avg_congestion=Avg('congestion_index'),
            avg_efficiency=Avg('efficiency_score'),
            total_countries=Count('country', distinct=True)
        )
        
        # Regional breakdown
        regional_data = []
        major_regions = [
            'United States of America', 'China', 'Japan', 'Germany', 
            'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands (Kingdom of the)'
        ]
        
        for region in major_regions:
            try:
                metric = PortCongestionMetric.objects.get(
                    country__name=region,
                    year=latest_year
                )
                regional_data.append({
                    'country': region,
                    'total_calls': metric.total_port_calls,
                    'congestion_index': metric.congestion_index,
                    'efficiency_score': metric.efficiency_score,
                    'container_calls': metric.container_calls,
                    'bulk_calls': metric.bulk_calls,
                    'passenger_calls': metric.passenger_calls
                })
            except PortCongestionMetric.DoesNotExist:
                continue
        
        return Response({
            'status': 'success',
            'data': {
                'year': latest_year,
                'global_stats': global_stats,
                'most_congested': list(most_congested),
                'most_efficient': list(most_efficient),
                'regional_breakdown': regional_data,
                'last_updated': timezone.now().isoformat()
            }
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def port_trends_analytics(request):
    """Get port traffic trends over time"""
    
    try:
        from analytics.models import PortCallStatistic, ShipType
        
        country = request.GET.get('country', 'United States of America')
        
        # Get yearly trends for the country
        yearly_trends = PortCallStatistic.objects.filter(
            country__name=country,
            ship_type__code='00'  # All ships
        ).values('year', 'port_calls').order_by('year')
        
        # Get ship type breakdown for latest year
        latest_year = PortCallStatistic.objects.aggregate(
            max_year=models.Max('year')
        )['max_year'] or 2021
        
        ship_type_breakdown = PortCallStatistic.objects.filter(
            country__name=country,
            year=latest_year,
            ship_type__code__in=['01', '02', '03', '04', '05', '06', '07', '08']
        ).values(
            'ship_type__name', 'port_calls'
        ).order_by('-port_calls')
        
        # Compare with global averages
        global_trends = PortCallStatistic.objects.filter(
            ship_type__code='00'
        ).values('year').annotate(
            avg_calls=Avg('port_calls')
        ).order_by('year')
        
        return Response({
            'status': 'success',
            'data': {
                'country': country,
                'yearly_trends': list(yearly_trends),
                'ship_type_breakdown': list(ship_type_breakdown),
                'global_trends': list(global_trends),
                'latest_year': latest_year
            }
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_shipping_overview(request):
    """Get global shipping overview statistics"""
    
    try:
        from analytics.models import PortCallStatistic, PortCongestionMetric
        
        latest_year = PortCallStatistic.objects.aggregate(
            max_year=models.Max('year')
        )['max_year'] or 2021
        
        # Global totals by ship type
        global_by_ship_type = PortCallStatistic.objects.filter(
            year=latest_year,
            ship_type__code__in=['01', '02', '03', '04', '05', '06', '07', '08']
        ).values(
            'ship_type__name'
        ).annotate(
            total_calls=Sum('port_calls')
        ).order_by('-total_calls')
        
        # Top countries by total traffic
        top_countries = PortCallStatistic.objects.filter(
            year=latest_year,
            ship_type__code='00'  # All ships
        ).values(
            'country__name'
        ).annotate(
            total_calls=Sum('port_calls')
        ).order_by('-total_calls')[:15]
        
        # Congestion hotspots
        congestion_hotspots = PortCongestionMetric.objects.filter(
            year=latest_year,
            congestion_index__gte=50  # High congestion threshold
        ).values(
            'country__name', 'congestion_index', 'total_port_calls'
        ).order_by('-congestion_index')[:10]
        
        # Year-over-year growth
        previous_year = latest_year - 1
        
        current_total = PortCallStatistic.objects.filter(
            year=latest_year,
            ship_type__code='00'
        ).aggregate(total=Sum('port_calls'))['total'] or 0
        
        previous_total = PortCallStatistic.objects.filter(
            year=previous_year,
            ship_type__code='00'
        ).aggregate(total=Sum('port_calls'))['total'] or 1
        
        growth_rate = ((current_total - previous_total) / previous_total) * 100
        
        return Response({
            'status': 'success',
            'data': {
                'year': latest_year,
                'global_totals': {
                    'total_port_calls': current_total,
                    'growth_rate': round(growth_rate, 2),
                    'previous_year_total': previous_total
                },
                'by_ship_type': list(global_by_ship_type),
                'top_countries': list(top_countries),
                'congestion_hotspots': list(congestion_hotspots),
                'summary': {
                    'countries_tracked': PortCallStatistic.objects.filter(
                        year=latest_year
                    ).values('country').distinct().count(),
                    'ship_types': PortCallStatistic.objects.filter(
                        year=latest_year
                    ).values('ship_type').distinct().count()
                }
            }
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def port_efficiency_rankings(request):
    """Get port efficiency rankings"""
    
    try:
        from analytics.models import PortCongestionMetric
        
        latest_year = PortCongestionMetric.objects.aggregate(
            max_year=models.Max('year')
        )['max_year'] or 2021
        
        # Efficiency rankings
        efficiency_rankings = PortCongestionMetric.objects.filter(
            year=latest_year,
            total_port_calls__gte=1000  # Minimum threshold for meaningful comparison
        ).order_by('-efficiency_score').values(
            'country__name',
            'efficiency_score',
            'congestion_index',
            'total_port_calls',
            'container_calls',
            'bulk_calls',
            'passenger_calls'
        )[:20]
        
        # Performance categories
        high_performers = efficiency_rankings.filter(efficiency_score__gte=80).count()
        medium_performers = efficiency_rankings.filter(
            efficiency_score__gte=60, 
            efficiency_score__lt=80
        ).count()
        low_performers = efficiency_rankings.filter(efficiency_score__lt=60).count()
        
        return Response({
            'status': 'success',
            'data': {
                'year': latest_year,
                'rankings': list(efficiency_rankings),
                'performance_distribution': {
                    'high_performers': high_performers,
                    'medium_performers': medium_performers,
                    'low_performers': low_performers
                },
                'criteria': {
                    'minimum_calls': 1000,
                    'high_performance_threshold': 80,
                    'medium_performance_threshold': 60
                }
            }
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)