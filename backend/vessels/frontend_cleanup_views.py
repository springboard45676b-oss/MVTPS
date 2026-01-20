from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.utils import timezone
from permissions import VesselTrackingPermission
from .frontend_serializers import VesselMapDisplaySerializer, MockVesselSerializer, WeatherDataSerializer, VesselDetailsSerializer
from .models import Vessel
import logging

logger = logging.getLogger(__name__)

class FormattedLiveVesselsView(APIView):
    """Provides formatted vessel data for frontend map display"""
    permission_classes = [VesselTrackingPermission]
    
    def get(self, request):
        try:
            # Get bounds from request
            lat_min = float(request.GET.get('lat_min', 40))
            lat_max = float(request.GET.get('lat_max', 60))
            lng_min = float(request.GET.get('lng_min', -10))
            lng_max = float(request.GET.get('lng_max', 10))
            
            bounds = {
                'lat_min': lat_min, 'lat_max': lat_max,
                'lng_min': lng_min, 'lng_max': lng_max
            }
            
            # Check cache first
            cache_key = f"formatted_vessels_{lat_min}_{lat_max}_{lng_min}_{lng_max}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get vessels in area
            vessels = Vessel.objects.filter(
                is_active=True,
                positions__latitude__gte=lat_min,
                positions__latitude__lte=lat_max,
                positions__longitude__gte=lng_min,
                positions__longitude__lte=lng_max
            ).distinct().prefetch_related('positions')[:50]  # Limit for performance
            
            if vessels.exists():
                serializer = VesselMapDisplaySerializer(vessels, many=True)
                formatted_data = {
                    'vessels': serializer.data,
                    'count': len(serializer.data),
                    'bounds': bounds,
                    'timestamp': timezone.now().isoformat(),
                    'source': 'database'
                }
            else:
                # Fallback to mock data
                mock_vessels = MockVesselSerializer.generate_mock_vessels(15, bounds)
                formatted_data = {
                    'vessels': mock_vessels,
                    'count': len(mock_vessels),
                    'bounds': bounds,
                    'timestamp': timezone.now().isoformat(),
                    'source': 'mock'
                }
            
            # Cache for 5 minutes
            cache.set(cache_key, formatted_data, 300)
            
            return Response(formatted_data)
            
        except Exception as e:
            logger.error(f"Error in FormattedLiveVesselsView: {e}")
            # Return mock data as fallback
            mock_vessels = MockVesselSerializer.generate_mock_vessels(15)
            return Response({
                'vessels': mock_vessels,
                'count': len(mock_vessels),
                'timestamp': timezone.now().isoformat(),
                'source': 'mock_fallback',
                'error': str(e)
            })

class FormattedWeatherView(APIView):
    """Provides formatted weather data with business logic validation"""
    permission_classes = [VesselTrackingPermission]
    
    def get(self, request):
        try:
            lat = float(request.GET.get('lat', 33.7))
            lng = float(request.GET.get('lng', -118.2))
            
            # Check cache first
            cache_key = f"formatted_weather_{lat}_{lng}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Trigger async weather fetch
            from tasks.comprehensive_async_tasks import fetch_weather_data_comprehensive_task
            task_result = fetch_weather_data_comprehensive_task.delay(lat, lng, True)
            
            # Return cached weather data or mock data
            weather_cache_key = f"weather_comprehensive_{lat}_{lng}"
            weather_data = cache.get(weather_cache_key)
            
            if weather_data:
                # Validate and format weather data
                serializer = WeatherDataSerializer(data=weather_data)
                if serializer.is_valid():
                    formatted_data = {
                        'weather': serializer.validated_data,
                        'location': {'lat': lat, 'lng': lng},
                        'timestamp': timezone.now().isoformat(),
                        'source': 'api',
                        'task_id': task_result.id
                    }
                else:
                    # Return mock weather data if validation fails
                    formatted_data = self._get_mock_weather(lat, lng)
            else:
                # Return mock weather data while async task runs
                formatted_data = self._get_mock_weather(lat, lng)
                formatted_data['task_id'] = task_result.id
            
            # Cache formatted data for 10 minutes
            cache.set(cache_key, formatted_data, 600)
            
            return Response(formatted_data)
            
        except Exception as e:
            logger.error(f"Error in FormattedWeatherView: {e}")
            return Response(self._get_mock_weather(33.7, -118.2))
    
    def _get_mock_weather(self, lat, lng):
        """Generate mock weather data"""
        import random
        return {
            'weather': {
                'temperature': 20 + random.randint(-5, 15),
                'humidity': 60 + random.randint(-20, 30),
                'pressure': 1013 + random.randint(-20, 20),
                'wind_speed': random.randint(5, 25),
                'wind_direction': random.randint(0, 359),
                'wave_height': random.uniform(0.5, 3.0),
                'visibility': random.uniform(5, 15),
                'weather_condition': random.choice(['Clear', 'Cloudy', 'Partly Cloudy', 'Light Rain']),
                'timestamp': timezone.now().isoformat()
            },
            'location': {'lat': lat, 'lng': lng},
            'timestamp': timezone.now().isoformat(),
            'source': 'mock'
        }

class FormattedVesselDetailsView(APIView):
    """Provides formatted vessel details with business logic"""
    permission_classes = [VesselTrackingPermission]
    
    def get(self, request, mmsi):
        try:
            # Check cache first
            cache_key = f"formatted_vessel_details_{mmsi}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            try:
                vessel = Vessel.objects.prefetch_related('positions').get(mmsi=mmsi)
                serializer = VesselDetailsSerializer(vessel)
                
                formatted_data = {
                    'vessel': serializer.data,
                    'timestamp': timezone.now().isoformat(),
                    'source': 'database'
                }
                
                # Cache for 30 minutes
                cache.set(cache_key, formatted_data, 1800)
                
                return Response(formatted_data)
                
            except Vessel.DoesNotExist:
                return Response(
                    {'error': 'Vessel not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        except Exception as e:
            logger.error(f"Error in FormattedVesselDetailsView: {e}")
            return Response(
                {'error': f'Failed to get vessel details: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
@permission_classes([VesselTrackingPermission])
def vessel_type_icons_view(request):
    """Provides vessel type icon mapping - moved from frontend"""
    try:
        cache_key = "vessel_type_icons"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        icon_mapping = {
            'Cargo': '🚢',
            'Tanker': '🛢️',
            'Container': '📦',
            'Passenger': '🛳️',
            'Fishing': '🎣',
            'Tug': '🚤',
            'Unknown': '⚓'
        }
        
        response_data = {
            'icons': icon_mapping,
            'timestamp': timezone.now().isoformat()
        }
        
        # Cache for 1 hour (this data rarely changes)
        cache.set(cache_key, response_data, 3600)
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in vessel_type_icons_view: {e}")
        return Response(
            {'error': f'Failed to get vessel type icons: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([VesselTrackingPermission])
def mock_vessels_view(request):
    """Provides mock vessel data for testing - moved from frontend"""
    try:
        count = int(request.GET.get('count', 15))
        lat_min = float(request.GET.get('lat_min', 33.7))
        lat_max = float(request.GET.get('lat_max', 35.7))
        lng_min = float(request.GET.get('lng_min', -120.2))
        lng_max = float(request.GET.get('lng_max', -116.2))
        
        bounds = {
            'lat_min': lat_min, 'lat_max': lat_max,
            'lng_min': lng_min, 'lng_max': lng_max
        }
        
        # Check cache first
        cache_key = f"mock_vessels_{count}_{hash(str(bounds))}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        mock_vessels = MockVesselSerializer.generate_mock_vessels(count, bounds)
        
        response_data = {
            'vessels': mock_vessels,
            'count': len(mock_vessels),
            'bounds': bounds,
            'timestamp': timezone.now().isoformat(),
            'source': 'mock'
        }
        
        # Cache mock data for 2 minutes
        cache.set(cache_key, response_data, 120)
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in mock_vessels_view: {e}")
        return Response(
            {'error': f'Failed to generate mock vessels: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )