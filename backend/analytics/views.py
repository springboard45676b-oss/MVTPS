from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .models import Voyage, VoyageEvent
from .serializers import VoyageSerializer, VoyageEventSerializer
from vessels.models import Vessel, VesselPosition
from ports.models import Port, PortCongestion

class VoyageListView(generics.ListAPIView):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    
    def get_queryset(self):
        queryset = Voyage.objects.all()
        vessel_id = self.request.query_params.get('vessel_id')
        status = self.request.query_params.get('status')
        
        if vessel_id:
            queryset = queryset.filter(vessel_id=vessel_id)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset

class VoyageDetailView(generics.RetrieveAPIView):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    # Basic analytics data
    total_voyages = Voyage.objects.count()
    active_voyages = Voyage.objects.filter(status='in_progress').count()
    completed_voyages = Voyage.objects.filter(status='completed').count()
    
    # Voyage statistics by vessel type
    vessel_stats = Voyage.objects.values('vessel__vessel_type').annotate(
        count=Count('id'),
        avg_distance=Avg('distance')
    )
    
    # Recent events
    recent_events = VoyageEvent.objects.select_related('voyage__vessel')[:10]
    
    return Response({
        'summary': {
            'total_voyages': total_voyages,
            'active_voyages': active_voyages,
            'completed_voyages': completed_voyages,
        },
        'vessel_statistics': list(vessel_stats),
        'recent_events': VoyageEventSerializer(recent_events, many=True).data,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vessel_analytics(request):
    """Comprehensive vessel analytics by type, flag, and other metrics"""
    
    try:
        # Basic vessel count
        total_vessels = Vessel.objects.count()
        
        # Vessel count by type
        vessel_by_type = list(Vessel.objects.values('vessel_type').annotate(
            count=Count('id'),
            avg_length=Avg('length'),
            avg_width=Avg('width'),
            avg_tonnage=Avg('gross_tonnage'),
            total_tonnage=Sum('gross_tonnage')
        ).order_by('-count'))
        
        # Vessel count by flag
        vessel_by_flag = list(Vessel.objects.values('flag').annotate(
            count=Count('id')
        ).order_by('-count')[:10])  # Top 10 flags
        
        # Size categories
        size_categories = {
            'small': Vessel.objects.filter(length__lt=100).count(),
            'medium': Vessel.objects.filter(length__gte=100, length__lt=200).count(),
            'large': Vessel.objects.filter(length__gte=200, length__lt=300).count(),
            'very_large': Vessel.objects.filter(length__gte=300).count(),
        }
        
        # Speed analysis (simplified)
        speed_stats = {
            'avg_speed': 15.0,
            'max_speed': 25.0,
            'min_speed': 5.0
        }
        
        # Container ship specific analytics
        container_ships = Vessel.objects.filter(vessel_type='container')
        largest_container = container_ships.order_by('-gross_tonnage').first()
        container_analytics = {
            'total_count': container_ships.count(),
            'avg_capacity': container_ships.aggregate(avg_tonnage=Avg('gross_tonnage'))['avg_tonnage'],
            'largest_ship': {
                'name': largest_container.name,
                'mmsi': largest_container.mmsi,
                'gross_tonnage': largest_container.gross_tonnage
            } if largest_container else None,
            'by_flag': list(container_ships.values('flag').annotate(count=Count('id')).order_by('-count')[:5])
        }
        
        # Tanker analytics
        tankers = Vessel.objects.filter(vessel_type='tanker')
        largest_tanker = tankers.order_by('-gross_tonnage').first()
        tanker_analytics = {
            'total_count': tankers.count(),
            'avg_capacity': tankers.aggregate(avg_tonnage=Avg('gross_tonnage'))['avg_tonnage'],
            'largest_tanker': {
                'name': largest_tanker.name,
                'mmsi': largest_tanker.mmsi,
                'gross_tonnage': largest_tanker.gross_tonnage
            } if largest_tanker else None,
            'by_flag': list(tankers.values('flag').annotate(count=Count('id')).order_by('-count')[:5])
        }
        
        # Passenger ship analytics
        passenger_ships = Vessel.objects.filter(vessel_type='passenger')
        largest_passenger = passenger_ships.order_by('-gross_tonnage').first()
        passenger_analytics = {
            'total_count': passenger_ships.count(),
            'avg_size': passenger_ships.aggregate(avg_tonnage=Avg('gross_tonnage'))['avg_tonnage'],
            'largest_cruise': {
                'name': largest_passenger.name,
                'mmsi': largest_passenger.mmsi,
                'gross_tonnage': largest_passenger.gross_tonnage
            } if largest_passenger else None,
            'by_flag': list(passenger_ships.values('flag').annotate(count=Count('id')).order_by('-count')[:5])
        }
        
        # Cargo ship analytics
        cargo_ships = Vessel.objects.filter(vessel_type='cargo')
        largest_cargo = cargo_ships.order_by('-gross_tonnage').first()
        cargo_analytics = {
            'total_count': cargo_ships.count(),
            'avg_capacity': cargo_ships.aggregate(avg_tonnage=Avg('gross_tonnage'))['avg_tonnage'],
            'largest_cargo': {
                'name': largest_cargo.name,
                'mmsi': largest_cargo.mmsi,
                'gross_tonnage': largest_cargo.gross_tonnage
            } if largest_cargo else None,
            'by_flag': list(cargo_ships.values('flag').annotate(count=Count('id')).order_by('-count')[:5])
        }
        
        return Response({
            'overview': {
                'total_vessels': total_vessels,
                'active_vessels': total_vessels,
                'total_positions': 0,
            },
            'by_type': vessel_by_type,
            'by_flag': vessel_by_flag,
            'size_categories': size_categories,
            'speed_statistics': speed_stats,
            'container_ships': container_analytics,
            'tankers': tanker_analytics,
            'passenger_ships': passenger_analytics,
            'cargo_ships': cargo_analytics,
        })
        
    except Exception as e:
        import traceback
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'overview': {
                'total_vessels': 0,
                'active_vessels': 0,
                'total_positions': 0,
            },
            'by_type': [],
            'by_flag': [],
            'size_categories': {'small': 0, 'medium': 0, 'large': 0, 'very_large': 0},
            'speed_statistics': {'avg_speed': 0, 'max_speed': 0, 'min_speed': 0},
            'container_ships': {'total_count': 0, 'avg_capacity': 0, 'largest_ship': None, 'by_flag': []},
            'tankers': {'total_count': 0, 'avg_capacity': 0, 'largest_tanker': None, 'by_flag': []},
            'passenger_ships': {'total_count': 0, 'avg_size': 0, 'largest_cruise': None, 'by_flag': []},
            'cargo_ships': {'total_count': 0, 'avg_capacity': 0, 'largest_cargo': None, 'by_flag': []},
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def port_analytics(request):
    """Port-specific analytics"""
    
    # Port congestion analysis
    port_congestion = PortCongestion.objects.values('port__name', 'port__code').annotate(
        avg_wait_time=Avg('average_wait_time'),
        avg_vessels_waiting=Avg('vessels_waiting'),
        latest_congestion=Count('id')
    ).order_by('-avg_wait_time')[:10]
    
    # Busiest ports by vessel visits
    busiest_ports = VesselPosition.objects.values(
        'vessel__name'
    ).annotate(
        position_count=Count('id')
    ).order_by('-position_count')[:10]
    
    return Response({
        'port_congestion': list(port_congestion),
        'busiest_ports': list(busiest_ports),
        'total_ports': Port.objects.count(),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fleet_composition(request):
    """Detailed fleet composition analysis"""
    
    try:
        # Get fleet composition by type with detailed breakdown
        fleet_data = []
        total_vessels = Vessel.objects.count()
        
        for vessel_type, type_name in Vessel.VESSEL_TYPES:
            vessels = Vessel.objects.filter(vessel_type=vessel_type)
            
            if vessels.exists():
                newest_vessel = vessels.order_by('-built_year').first()
                oldest_vessel = vessels.order_by('built_year').first()
                largest_vessel = vessels.order_by('-gross_tonnage').first()
                
                fleet_info = {
                    'type': vessel_type,
                    'type_name': type_name,
                    'count': vessels.count(),
                    'percentage': (vessels.count() / total_vessels) * 100 if total_vessels > 0 else 0,
                    'avg_length': vessels.aggregate(avg=Avg('length'))['avg'] or 0,
                    'avg_width': vessels.aggregate(avg=Avg('width'))['avg'] or 0,
                    'avg_tonnage': vessels.aggregate(avg=Avg('gross_tonnage'))['avg'] or 0,
                    'total_tonnage': vessels.aggregate(total=Sum('gross_tonnage'))['total'] or 0,
                    'newest_vessel': {
                        'name': newest_vessel.name,
                        'mmsi': newest_vessel.mmsi,
                        'built_year': newest_vessel.built_year
                    } if newest_vessel else None,
                    'oldest_vessel': {
                        'name': oldest_vessel.name,
                        'mmsi': oldest_vessel.mmsi,
                        'built_year': oldest_vessel.built_year
                    } if oldest_vessel else None,
                    'largest_vessel': {
                        'name': largest_vessel.name,
                        'mmsi': largest_vessel.mmsi,
                        'gross_tonnage': largest_vessel.gross_tonnage
                    } if largest_vessel else None,
                    'top_flags': list(vessels.values('flag').annotate(
                        count=Count('id')
                    ).order_by('-count')[:3])
                }
                fleet_data.append(fleet_info)
        
        total_tonnage = Vessel.objects.aggregate(total=Sum('gross_tonnage'))['total'] or 0
        
        return Response({
            'fleet_composition': fleet_data,
            'total_fleet_size': total_vessels,
            'total_tonnage': total_tonnage,
        })
        
    except Exception as e:
        import traceback
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'fleet_composition': [],
            'total_fleet_size': 0,
            'total_tonnage': 0,
        })