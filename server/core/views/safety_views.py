"""
Safety Data Views
Handles piracy zones, weather alerts, and country information
"""

from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
import logging

from ..models import PiracyZone, WeatherAlert, Country
from ..serializers import (
    PiracyZoneSerializer,
    WeatherAlertSerializer,
    CountrySerializer,
)

logger = logging.getLogger(__name__)


# ============================================
# PIRACY ZONE VIEWS
# ============================================

class PiracyZoneListAPI(generics.ListAPIView):
    """Get all active piracy zones"""
    queryset = PiracyZone.objects.filter(is_active=True)
    serializer_class = PiracyZoneSerializer
    permission_classes = [permissions.IsAuthenticated]


# ============================================
# WEATHER ALERT VIEWS
# ============================================

class WeatherAlertListAPI(generics.ListAPIView):
    """Get all active weather alerts"""
    queryset = WeatherAlert.objects.filter(is_active=True)
    serializer_class = WeatherAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter out expired alerts"""
        queryset = super().get_queryset()
        
        # Filter alerts that haven't expired
        now = timezone.now()
        return queryset.filter(
            Q(alert_expires__gt=now) | Q(alert_expires__isnull=True)
        )


# ============================================
# COUNTRY VIEWS
# ============================================

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """Get all countries with their locations and continents"""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """Return countries grouped by continent"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Group by continent
        by_continent = {}
        for country in serializer.data:
            continent = country['continent']
            if continent not in by_continent:
                by_continent[continent] = []
            by_continent[continent].append(country)
        
        return Response({
            'count': queryset.count(),
            'by_continent': by_continent,
            'results': serializer.data
        })