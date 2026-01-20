from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from .models import VoyageReplay, VoyagePosition, ComplianceViolation
from .serializers import VoyageReplaySerializer, VoyagePositionSerializer
from permissions import VesselTrackingPermission

class VoyageReplayViewSet(viewsets.ModelViewSet):
    queryset = VoyageReplay.objects.all()
    serializer_class = VoyageReplaySerializer
    permission_classes = [VesselTrackingPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        mmsi = self.request.query_params.get('mmsi')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if mmsi:
            queryset = queryset.filter(vessel__mmsi=mmsi)
        if start_date:
            queryset = queryset.filter(start_time__gte=parse_datetime(start_date))
        if end_date:
            queryset = queryset.filter(end_time__lte=parse_datetime(end_date))
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def replay_data(self, request, pk=None):
        """Get voyage replay data with positions"""
        voyage = self.get_object()
        serializer = self.get_serializer(voyage)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vessels(self, request):
        """Get list of vessels with voyage history"""
        from vessels.models import Vessel
        vessels = Vessel.objects.filter(replay_voyages__isnull=False).distinct()
        data = [{'mmsi': v.mmsi, 'name': v.vessel_name, 'imo': v.imo} for v in vessels]
        return Response(data)