from django.db.models import Q
from vessels.models import Vessel, VesselPosition, Voyage
from vessels.serializers import VesselSerializer, VesselPositionSerializer

class VesselService:
    """Service layer for vessel-related business logic"""
    
    @staticmethod
    def get_filtered_vessels(vessel_type=None, flag=None, is_active=True):
        """Get vessels with optional filtering"""
        queryset = Vessel.objects.filter(is_active=is_active)
        
        if vessel_type:
            queryset = queryset.filter(vessel_type=vessel_type)
        if flag:
            queryset = queryset.filter(flag__icontains=flag)
            
        return queryset
    
    @staticmethod
    def get_vessels_with_live_positions():
        """Get vessels with their latest positions for live tracking"""
        vessels_with_positions = []
        vessels = Vessel.objects.filter(is_active=True)
        
        for vessel in vessels:
            latest_position = vessel.positions.first()
            if latest_position:
                vessel_data = VesselSerializer(vessel).data
                vessel_data['latest_position'] = VesselPositionSerializer(latest_position).data
                vessels_with_positions.append(vessel_data)
        
        return vessels_with_positions

class VesselPositionService:
    """Service layer for vessel position-related business logic"""
    
    @staticmethod
    def get_filtered_positions(vessel_id=None, mmsi=None):
        """Get vessel positions with optional filtering"""
        queryset = VesselPosition.objects.all().order_by('-timestamp')
        
        if vessel_id:
            queryset = queryset.filter(vessel_id=vessel_id)
        if mmsi:
            queryset = queryset.filter(vessel__mmsi=mmsi)
            
        return queryset

class VoyageService:
    """Service layer for voyage-related business logic"""
    
    @staticmethod
    def get_filtered_voyages(status_filter=None):
        """Get voyages with optional status filtering"""
        queryset = Voyage.objects.all()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-departure_date')
    
    @staticmethod
    def get_voyage_analytics():
        """Calculate voyage analytics"""
        queryset = Voyage.objects.all()
        
        total_voyages = queryset.count()
        active_voyages = queryset.filter(status='active').count()
        completed_voyages = queryset.filter(status='completed').count()
        
        completion_rate = (completed_voyages / total_voyages * 100) if total_voyages > 0 else 0
        
        return {
            'total_voyages': total_voyages,
            'active_voyages': active_voyages,
            'completed_voyages': completed_voyages,
            'completion_rate': completion_rate
        }