from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Vessel, VesselPosition, Voyage
from .serializers import VesselSerializer, VesselPositionSerializer, VoyageSerializer
from users.permissions import IsOperatorOrAnalyst, IsAnalyst

class VesselViewSet(viewsets.ModelViewSet):
    queryset = Vessel.objects.filter(is_active=True)
    serializer_class = VesselSerializer
    permission_classes = [IsOperatorOrAnalyst]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        vessel_type = self.request.query_params.get('type')
        flag = self.request.query_params.get('flag')
        
        if vessel_type:
            queryset = queryset.filter(vessel_type=vessel_type)
        if flag:
            queryset = queryset.filter(flag__icontains=flag)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def live_tracking(self, request):
        vessels_with_positions = []
        for vessel in self.get_queryset():
            latest_position = vessel.positions.first()
            if latest_position:
                vessel_data = VesselSerializer(vessel).data
                vessel_data['latest_position'] = VesselPositionSerializer(latest_position).data
                vessels_with_positions.append(vessel_data)
        return Response(vessels_with_positions)

class VesselPositionViewSet(viewsets.ModelViewSet):
    queryset = VesselPosition.objects.all()
    serializer_class = VesselPositionSerializer
    permission_classes = [IsOperatorOrAnalyst]
    
    def get_queryset(self):
        queryset = super().get_queryset().order_by('-timestamp')
        vessel_id = self.request.query_params.get('vessel')
        if vessel_id:
            queryset = queryset.filter(vessel_id=vessel_id)
        return queryset

class VoyageViewSet(viewsets.ModelViewSet):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    permission_classes = [IsAnalyst]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-departure_date')
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        total_voyages = self.get_queryset().count()
        active_voyages = self.get_queryset().filter(status='active').count()
        completed_voyages = self.get_queryset().filter(status='completed').count()
        
        return Response({
            'total_voyages': total_voyages,
            'active_voyages': active_voyages,
            'completed_voyages': completed_voyages,
            'completion_rate': (completed_voyages / total_voyages * 100) if total_voyages > 0 else 0
        })