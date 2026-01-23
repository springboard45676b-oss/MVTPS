"""
Vessel Management & Position Tracking Views
Handles vessel CRUD, position updates, and real-time tracking
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
import logging

from ..models import Vessel, VesselPosition
from ..serializers import VesselSerializer, VesselPositionSerializer

# Import notification service with fallback
try:
    from ..websocket.notification_service import NotificationService
except ImportError:
    class NotificationService:
        @staticmethod
        def notify_position_update(vessel_id, latitude, longitude, speed):
            print(f"⚠️ NotificationService unavailable")
            pass
        
        @staticmethod
        def run_safety_checks_for_vessel(vessel):
            pass

logger = logging.getLogger(__name__)


# ============================================
# VESSEL MANAGEMENT VIEWS
# ============================================

class VesselListCreateAPI(generics.ListCreateAPIView):
    """List all vessels or create a new vessel"""
    queryset = Vessel.objects.all().order_by('id')
    serializer_class = VesselSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'flag']
    search_fields = ['name', 'imo_number']
    ordering_fields = ['name', 'type', 'flag']
    ordering = ['id']
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can create vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class VesselDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific vessel"""
    queryset = Vessel.objects.all().order_by('id')
    serializer_class = VesselSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can update vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can delete vessels.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


# ============================================
# REAL-TIME VESSEL POSITION ENDPOINTS
# ============================================

class VesselPositionHistoryAPI(generics.ListAPIView):
    """Get vessel position history with time range filtering"""
    serializer_class = VesselPositionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        vessel_id = self.kwargs.get('vessel_id')
        hours = int(self.request.query_params.get('hours', 24))
        hours = min(max(1, hours), 720)
        
        since = timezone.now() - timedelta(hours=hours)
        
        return VesselPosition.objects.filter(
            vessel_id=vessel_id,
            timestamp__gte=since
        ).order_by('timestamp')
    
    def list(self, request, *args, **kwargs):
        vessel_id = self.kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        response = super().list(request, *args, **kwargs)
        
        response.data = {
            'vessel': VesselSerializer(vessel).data,
            'positions': response.data,
            'count': len(response.data) if isinstance(response.data, list) else 0,
        }
        
        return response


class VesselCurrentPositionAPI(generics.RetrieveAPIView):
    """Get the current/latest position of a vessel"""
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        vessel_id = kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            latest_position = VesselPosition.objects.filter(
                vessel_id=vessel_id
            ).order_by('-timestamp').first()
            
            if not latest_position:
                return Response(
                    {'detail': 'No position data available'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'vessel': VesselSerializer(vessel).data,
                'current_position': VesselPositionSerializer(latest_position).data,
            })
            
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VesselStatsAPI(generics.RetrieveAPIView):
    """Get statistics about a vessel's recent movement"""
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        vessel_id = kwargs.get('vessel_id')
        
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            
            return Response({
                'vessel': VesselSerializer(vessel).data,
            })
            
        except Vessel.DoesNotExist:
            return Response(
                {'detail': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UpdateVesselPositionAPI(APIView):
    """Update vessel position and trigger safety checks"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, vessel_id):
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response(
                {'error': 'Vessel not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            latitude = request.data.get('latitude')
            longitude = request.data.get('longitude')
            speed = request.data.get('speed', 0)
            course = request.data.get('course', 0)
            source = request.data.get('source', 'api')
            
            if latitude is None or longitude is None:
                return Response(
                    {'error': 'Latitude and longitude are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update vessel's last known position
            vessel.last_position_lat = latitude
            vessel.last_position_lon = longitude
            vessel.last_update = timezone.now()
            vessel.save()
            
            # Create position history record
            try:
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=latitude,
                    longitude=longitude,
                    speed=speed,
                    course=course,
                    timestamp=timezone.now(),
                    source=source
                )
            except Exception as e:
                logger.warning(f"Could not create position history: {str(e)}")
            
            # Notify subscribers
            try:
                NotificationService.notify_position_update(
                    vessel_id=vessel_id,
                    latitude=latitude,
                    longitude=longitude,
                    speed=speed
                )
            except Exception as e:
                logger.warning(f"Could not send notifications: {str(e)}")

            # Run safety checks (piracy zones, weather alerts)
            try:
                NotificationService.run_safety_checks_for_vessel(vessel)
            except Exception as e:
                logger.warning(f"Could not run safety checks: {str(e)}")
            
            return Response({
                'success': True,
                'message': f'Position updated for {vessel.name}',
                'vessel': {
                    'id': vessel.id,
                    'name': vessel.name,
                    'latitude': vessel.last_position_lat,
                    'longitude': vessel.last_position_lon,
                    'speed': speed,
                    'course': course,
                }
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error updating vessel position: {str(e)}")
            return Response(
                {'error': f'Failed to update position: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class BulkVesselPositionsAPI(generics.ListAPIView):
    """Get current positions for all vessels"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        vessels = Vessel.objects.all()
        
        positions_data = []
        for vessel in vessels:
            latest_pos = VesselPosition.objects.filter(
                vessel=vessel
            ).order_by('-timestamp').first()
            
            if latest_pos:
                positions_data.append({
                    'id': vessel.id,
                    'name': vessel.name,
                    'imo_number': vessel.imo_number,
                    'position': VesselPositionSerializer(latest_pos).data,
                    'vessel_info': {
                        'type': vessel.type,
                        'flag': vessel.flag,
                        'operator': vessel.operator,
                    }
                })
        
        return Response({
            'count': len(positions_data),
            'vessels': positions_data,
        })


class GenerateRealisticMockDataAPI(APIView):
    """Generate comprehensive mock vessel and position data"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            num_vessels = int(request.data.get('num_vessels', 5))
            num_vessels = min(max(1, num_vessels), 10)
            
            from ..services import VesselPositionService
            vessels = VesselPositionService.generate_mock_vessel_data(num_vessels)
            
            return Response({
                'message': f'Generated mock data for {len(vessels)} vessels',
                'vessels': [
                    {
                        'id': v.id,
                        'name': v.name,
                        'imo_number': v.imo_number,
                        'positions_count': VesselPosition.objects.filter(vessel=v).count(),
                    }
                    for v in vessels
                ],
                'total_vessels': Vessel.objects.count(),
                'total_positions': VesselPosition.objects.count(),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error generating mock data: {str(e)}")
            return Response(
                {'detail': f'Error generating mock data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )