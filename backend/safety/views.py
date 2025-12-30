from rest_framework import generics
from .models import SafetyZone, WeatherData
from .serializers import SafetyZoneSerializer, WeatherDataSerializer

class SafetyZoneListView(generics.ListAPIView):
    serializer_class = SafetyZoneSerializer
    
    def get_queryset(self):
        queryset = SafetyZone.objects.filter(active=True)
        zone_type = self.request.query_params.get('type')
        risk_level = self.request.query_params.get('risk_level')
        
        if zone_type:
            queryset = queryset.filter(zone_type=zone_type)
        if risk_level:
            queryset = queryset.filter(risk_level=risk_level)
        
        return queryset

class WeatherDataListView(generics.ListAPIView):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer
    
    def get_queryset(self):
        queryset = WeatherData.objects.all()
        lat_min = self.request.query_params.get('lat_min')
        lat_max = self.request.query_params.get('lat_max')
        lng_min = self.request.query_params.get('lng_min')
        lng_max = self.request.query_params.get('lng_max')
        
        if all([lat_min, lat_max, lng_min, lng_max]):
            queryset = queryset.filter(
                latitude__gte=lat_min,
                latitude__lte=lat_max,
                longitude__gte=lng_min,
                longitude__lte=lng_max
            )
        
        return queryset[:100]  # Limit to 100 records