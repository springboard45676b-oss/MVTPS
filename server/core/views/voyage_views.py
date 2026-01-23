"""
Voyage Management Views
Handles voyage tracking and journey management (CONSOLIDATED)
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from rest_framework import serializers
import logging

from ..models import Voyage

logger = logging.getLogger(__name__)


# ============================================
# INLINE VOYAGE SERIALIZER (temporarily here)
# TODO: Move to serializers.py
# ============================================

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
# VOYAGE VIEWS (CONSOLIDATED)
# ============================================

class VoyageListAPI(generics.ListAPIView):
    """
    List all voyages with filtering (CONSOLIDATED)
    GET /api/voyages/
    
    Query Parameters:
    - status: Filter by status (scheduled, in_progress, completed, cancelled)
    - vessel: Filter by vessel ID
    - port_from: Filter by origin port ID
    - port_to: Filter by destination port ID
    - start_date: Filter voyages departing after this date
    - end_date: Filter voyages departing before this date
    """
    queryset = Voyage.objects.all().select_related(
        'vessel', 'port_from', 'port_to'
    ).order_by('-departure_time')
    serializer_class = VoyageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['vessel__name', 'vessel__imo_number', 'port_from__name', 'port_to__name']
    ordering_fields = ['departure_time', 'arrival_time', 'status']
    filterset_fields = ['status', 'vessel', 'port_from', 'port_to']
    
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
        
        # Filter by port (arrivals or departures)
        port_id = self.request.query_params.get('port')
        if port_id:
            queryset = queryset.filter(
                Q(port_from_id=port_id) | Q(port_to_id=port_id)
            )
        
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
    serializer_class = VoyageSerializer
    permission_classes = [permissions.IsAuthenticated]