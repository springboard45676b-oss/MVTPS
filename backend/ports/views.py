from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Port, PortCongestion
from .serializers import PortSerializer, PortCongestionSerializer
from users.permissions import IsAnalyst

class PortViewSet(viewsets.ModelViewSet):
    queryset = Port.objects.filter(is_active=True)
    serializer_class = PortSerializer
    permission_classes = [IsAnalyst]
    
    @action(detail=False, methods=['get'])
    def congestion_analytics(self, request):
        ports_data = []
        for port in self.get_queryset():
            latest_congestion = port.congestion_data.first()
            if latest_congestion:
                ports_data.append({
                    'port_name': port.name,
                    'port_code': port.code,
                    'congestion_level': latest_congestion.congestion_level,
                    'current_vessels': latest_congestion.current_vessels,
                    'waiting_vessels': latest_congestion.waiting_vessels,
                    'average_wait_time': latest_congestion.average_wait_time
                })
        return Response(ports_data)

class PortCongestionViewSet(viewsets.ModelViewSet):
    queryset = PortCongestion.objects.all()
    serializer_class = PortCongestionSerializer
    permission_classes = [IsAnalyst]