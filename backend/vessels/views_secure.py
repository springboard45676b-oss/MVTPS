from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from .models import Vessel, VesselPosition, Voyage
from .serializers import VesselSerializer, VesselPositionSerializer, VoyageSerializer
from users.permissions_enhanced import IsOperatorOrAbove, IsAnalystOrAbove, IsAdminOnly, require_role
import logging

logger = logging.getLogger(__name__)

class VesselViewSet(viewsets.ModelViewSet):
    queryset = Vessel.objects.filter(is_active=True)
    serializer_class = VesselSerializer
    permission_classes = [IsOperatorOrAbove]  # FIXED: Proper permissions
    
    def get_permissions(self):
        """Dynamic permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admins can modify vessels
            permission_classes = [IsAdminOnly]
        else:
            # All authenticated users can view
            permission_classes = [IsOperatorOrAbove]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Role-based data filtering
        if self.request.user.role == 'operator':
            # Operators see limited vessel data
            queryset = queryset.select_related().prefetch_related('positions')[:100]
        
        # Apply filters
        vessel_type = self.request.query_params.get('type')
        flag = self.request.query_params.get('flag')
        
        if vessel_type:
            queryset = queryset.filter(vessel_type_text__icontains=vessel_type)
        if flag:
            queryset = queryset.filter(flag__icontains=flag)
            
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsOperatorOrAbove])
    def live_tracking(self, request):
        """Live vessel tracking - all roles can access"""
        try:
            vessels_with_positions = []
            queryset = self.get_queryset()[:50]  # Limit for performance
            
            for vessel in queryset:
                latest_position = vessel.positions.first()
                if latest_position:
                    vessel_data = VesselSerializer(vessel).data
                    vessel_data['latest_position'] = VesselPositionSerializer(latest_position).data
                    vessels_with_positions.append(vessel_data)
            
            logger.info(f"Live tracking accessed by {request.user.username} ({request.user.role})")
            return Response(vessels_with_positions)
            
        except Exception as e:
            logger.error(f"Live tracking error for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Failed to fetch live tracking data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOnly])
    def update_status(self, request, pk=None):
        """Update vessel status - admin only"""
        vessel = self.get_object()
        new_status = request.data.get('is_active')
        
        if new_status is not None:
            vessel.is_active = new_status
            vessel.save()
            logger.info(f"Vessel {vessel.mmsi} status updated by admin {request.user.username}")
            return Response({'status': 'updated'})
        
        return Response({'error': 'is_active field required'}, status=status.HTTP_400_BAD_REQUEST)

class VesselPositionViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to vessel positions"""
    queryset = VesselPosition.objects.all()
    serializer_class = VesselPositionSerializer
    permission_classes = [IsOperatorOrAbove]
    
    def get_queryset(self):
        queryset = super().get_queryset().order_by('-ais_timestamp')
        
        # Role-based data limits
        if self.request.user.role == 'operator':
            # Operators get last 24 hours only
            yesterday = timezone.now() - timezone.timedelta(days=1)
            queryset = queryset.filter(ais_timestamp__gte=yesterday)
        
        # Apply filters
        vessel_id = self.request.query_params.get('vessel')
        mmsi = self.request.query_params.get('mmsi')
        
        if vessel_id:
            queryset = queryset.filter(vessel_id=vessel_id)
        if mmsi:
            queryset = queryset.filter(vessel__mmsi=mmsi)
            
        return queryset[:1000]  # Limit results

class VoyageViewSet(viewsets.ModelViewSet):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    permission_classes = [IsAnalystOrAbove]  # FIXED: Analysts and admins only
    
    def get_permissions(self):
        """Dynamic permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOnly]  # Only admins can modify
        else:
            permission_classes = [IsAnalystOrAbove]  # Analysts can view
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-departure_date')
    
    @action(detail=False, methods=['get'], permission_classes=[IsAnalystOrAbove])
    def analytics(self, request):
        """Voyage analytics - analysts and admins only"""
        try:
            queryset = self.get_queryset()
            total_voyages = queryset.count()
            active_voyages = queryset.filter(status='active').count()
            completed_voyages = queryset.filter(status='completed').count()
            
            analytics_data = {
                'total_voyages': total_voyages,
                'active_voyages': active_voyages,
                'completed_voyages': completed_voyages,
                'completion_rate': (completed_voyages / total_voyages * 100) if total_voyages > 0 else 0
            }
            
            logger.info(f"Voyage analytics accessed by {request.user.username} ({request.user.role})")
            return Response(analytics_data)
            
        except Exception as e:
            logger.error(f"Voyage analytics error for user {request.user.username}: {str(e)}")
            return Response(
                {'error': 'Failed to fetch analytics data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )