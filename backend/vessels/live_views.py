from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Vessel, VesselPosition
from permissions import VesselTrackingPermission

@api_view(['GET'])
@permission_classes([VesselTrackingPermission])
def live_vessel_positions(request):
    """Get latest vessel positions with optional bounds filtering"""
    
    # Get latest position for each vessel
    cutoff_time = timezone.now() - timedelta(hours=24)
    
    # Get all vessels with their latest position
    vessels_data = []
    vessels = Vessel.objects.filter(is_active=True)
    
    for vessel in vessels:
        latest_position = VesselPosition.objects.filter(
            vessel=vessel,
            ais_timestamp__gte=cutoff_time
        ).order_by('-ais_timestamp').first()
        
        if latest_position:
            vessels_data.append({
                'mmsi': vessel.mmsi,
                'name': vessel.vessel_name,
                'imo': vessel.imo,
                'vessel_type': vessel.vessel_type_text or 'Unknown',
                'latitude': latest_position.latitude,
                'longitude': latest_position.longitude,
                'speed': latest_position.speed_over_ground or 0,
                'course': latest_position.course_over_ground or 0,
                'heading': latest_position.true_heading,
                'timestamp': latest_position.ais_timestamp,
                'length': vessel.length,
                'width': vessel.width,
                'callsign': vessel.call_sign,
                'destination': getattr(vessel.current_voyage, 'destination', 'Unknown') if hasattr(vessel, 'current_voyage') else 'Unknown',
                'eta': getattr(vessel.current_voyage, 'eta', None) if hasattr(vessel, 'current_voyage') else None,
                'draught': getattr(vessel.current_voyage, 'draught', None) if hasattr(vessel, 'current_voyage') else None,
            })
    
    return Response(vessels_data)
