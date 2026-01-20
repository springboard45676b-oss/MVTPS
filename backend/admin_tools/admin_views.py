from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
from django.utils import timezone
import csv
import json
from .models import APISource
from vessels.voyage_models import VoyageReplay
from ports.models import PortCongestion

class APISourceViewSet(viewsets.ModelViewSet):
    queryset = APISource.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        from rest_framework import serializers
        class APISourceSerializer(serializers.ModelSerializer):
            class Meta:
                model = APISource
                fields = '__all__'
        return APISourceSerializer
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Enable/disable API source"""
        source = self.get_object()
        source.is_enabled = not source.is_enabled
        source.status = 'active' if source.is_enabled else 'inactive'
        source.save()
        return Response({'status': source.status})
    
    @action(detail=True, methods=['get'])
    def health_check(self, request, pk=None):
        """Check API health"""
        source = self.get_object()
        source.status = 'active'
        source.last_sync = timezone.now()
        source.save()
        return Response({'status': source.status})

class DataExportView(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def voyage_data(self, request):
        """Export voyage data"""
        format_type = request.query_params.get('format', 'csv')
        voyages = VoyageReplay.objects.all()[:100]
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="voyages.csv"'
            writer = csv.writer(response)
            writer.writerow(['Voyage ID', 'Vessel', 'Start Time', 'End Time', 'Status'])
            for v in voyages:
                writer.writerow([v.voyage_id, v.vessel.vessel_name, v.start_time, v.end_time, v.status])
            return response
        else:
            data = [{'voyage_id': v.voyage_id, 'vessel': v.vessel.vessel_name, 
                    'start_time': v.start_time, 'end_time': v.end_time} for v in voyages]
            return Response(data)
    
    @action(detail=False, methods=['get'])
    def congestion_data(self, request):
        """Export port congestion data"""
        format_type = request.query_params.get('format', 'csv')
        congestion = PortCongestion.objects.all()[:100]
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="congestion.csv"'
            writer = csv.writer(response)
            writer.writerow(['Port', 'Wait Time', 'Current Vessels', 'Timestamp'])
            for c in congestion:
                writer.writerow([c.port.name, c.average_wait_time, c.current_vessels, c.timestamp])
            return response
        else:
            data = [{'port': c.port.name, 'wait_time': c.average_wait_time, 
                    'vessels': c.current_vessels} for c in congestion]
            return Response(data)
