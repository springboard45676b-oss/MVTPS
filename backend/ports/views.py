from rest_framework import generics
from .models import Port, PortCongestion
from .serializers import PortSerializer, PortCongestionSerializer

class PortListView(generics.ListAPIView):
    queryset = Port.objects.all()
    serializer_class = PortSerializer
    
    def get_queryset(self):
        queryset = Port.objects.all()
        country = self.request.query_params.get('country')
        search = self.request.query_params.get('search')
        
        if country:
            queryset = queryset.filter(country__icontains=country)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

class PortDetailView(generics.RetrieveAPIView):
    queryset = Port.objects.all()
    serializer_class = PortSerializer

class PortCongestionListView(generics.ListAPIView):
    serializer_class = PortCongestionSerializer
    
    def get_queryset(self):
        port_id = self.kwargs['port_id']
        return PortCongestion.objects.filter(port_id=port_id)