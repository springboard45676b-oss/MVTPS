"""
Port Management Views
Handles port operations, congestion tracking, and statistics
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Avg, Q
from datetime import timedelta
from rest_framework import serializers
import logging

from ..models import Port, Voyage

logger = logging.getLogger(__name__)


# ============================================
# INLINE PORT SERIALIZER (temporarily here)
# TODO: Move to serializers.py
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


# ============================================
# PORT VIEWS
# ============================================

class PortListAPI(generics.ListAPIView):
    """
    List all ports with filtering and search
    GET /api/ports/
    """
    queryset = Port.objects.all().order_by('-congestion_score')
    serializer_class = PortSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'location', 'country']
    ordering_fields = ['name', 'congestion_score', 'avg_wait_time', 'arrivals', 'departures']
    filterset_fields = ['country']
    
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
    serializer_class = PortSerializer
    permission_classes = [permissions.IsAuthenticated]
    
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
            from ..mock_data_generator import MockDataGenerator
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