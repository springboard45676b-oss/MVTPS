from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def fetch_ais_hub_vessels_task(self, lat_min, lat_max, lng_min, lng_max):
    """Async task to fetch vessels from AIS Hub API"""
    try:
        from services.external_apis import AISHubAPI
        
        api = AISHubAPI()
        vessels_data = api.get_vessels_in_area(lat_min, lat_max, lng_min, lng_max)
        
        # Cache the results for 5 minutes
        cache_key = f"ais_hub_vessels_{lat_min}_{lat_max}_{lng_min}_{lng_max}"
        cache.set(cache_key, vessels_data, 300)
        
        logger.info(f"Fetched {len(vessels_data)} vessels from AIS Hub")
        return {
            'success': True,
            'vessels_count': len(vessels_data),
            'cache_key': cache_key,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"AIS Hub fetch failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def fetch_ais_stream_vessels_task(self, bbox=None):
    """Async task to fetch vessels from AIS Stream API"""
    try:
        from services.ais_stream_service import AISStreamService
        
        service = AISStreamService()
        if bbox:
            vessels_data = service.get_vessels_in_area(bbox)
        else:
            # Default bbox for testing
            vessels_data = service.get_vessels_in_area([40.0, -10.0, 60.0, 10.0])
        
        # Process and store vessel data
        stats = {'processed': 0, 'errors': 0}
        for vessel_data in vessels_data:
            if service.process_vessel_data(vessel_data):
                stats['processed'] += 1
            else:
                stats['errors'] += 1
        
        # Cache the results
        cache_key = f"ais_stream_vessels_{hash(str(bbox))}"
        cache.set(cache_key, vessels_data, 300)
        
        logger.info(f"Processed {stats['processed']} vessels from AIS Stream")
        return {
            'success': True,
            'stats': stats,
            'cache_key': cache_key,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"AIS Stream fetch failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def fetch_weather_data_task(self, lat, lng):
    """Async task to fetch weather data from OpenWeather API"""
    try:
        from services.external_apis import OpenWeatherAPI
        
        api = OpenWeatherAPI()
        weather_data = api.get_marine_weather(lat, lng)
        
        if weather_data:
            # Cache weather data for 10 minutes
            cache_key = f"weather_{lat}_{lng}"
            cache.set(cache_key, weather_data, 600)
            
            logger.info(f"Fetched weather data for {lat}, {lng}")
            return {
                'success': True,
                'cache_key': cache_key,
                'timestamp': timezone.now().isoformat()
            }
        else:
            raise Exception("No weather data received")
            
    except Exception as exc:
        logger.error(f"Weather fetch failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, max_retries=2)
def sync_unctad_data_task(self):
    """Async task to sync UNCTAD port data"""
    try:
        from services.unctad_service import UNCTADService
        
        synced_count = UNCTADService.sync_to_database()
        
        # Cache sync status
        cache.set('unctad_last_sync', {
            'timestamp': timezone.now().isoformat(),
            'synced_count': synced_count,
            'success': True
        }, 3600)  # Cache for 1 hour
        
        logger.info(f"Synced {synced_count} ports from UNCTAD")
        return {
            'success': True,
            'synced_count': synced_count,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"UNCTAD sync failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, max_retries=2)
def fetch_port_performance_task(self, port_code):
    """Async task to fetch port performance data from UNCTAD Maritime API"""
    try:
        from services.port_analytics import UNCTADMaritimeAPI
        
        api = UNCTADMaritimeAPI()
        performance_data = api.get_port_performance_data(port_code)
        
        if performance_data:
            # Cache port performance data for 1 hour
            cache_key = f"port_performance_{port_code}"
            cache.set(cache_key, performance_data, 3600)
            
            logger.info(f"Fetched performance data for port {port_code}")
            return {
                'success': True,
                'cache_key': cache_key,
                'timestamp': timezone.now().isoformat()
            }
        else:
            raise Exception(f"No performance data received for port {port_code}")
            
    except Exception as exc:
        logger.error(f"Port performance fetch failed for {port_code}: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def fetch_live_vessels_mock_task(self, bbox=None):
    """Async task to fetch mock vessel data (fallback)"""
    try:
        from services.aisstream_service import fetch_live_vessels
        
        vessels_data = fetch_live_vessels(bbox)
        
        # Cache mock data for 2 minutes
        cache_key = f"mock_vessels_{hash(str(bbox))}"
        cache.set(cache_key, vessels_data, 120)
        
        logger.info(f"Generated {len(vessels_data.get('vessels', []))} mock vessels")
        return {
            'success': True,
            'vessels_count': len(vessels_data.get('vessels', [])),
            'cache_key': cache_key,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Mock vessel fetch failed: {exc}")
        raise self.retry(exc=exc)

# Task status helpers
def get_task_status(task_id):
    """Get status of a Celery task"""
    from celery.result import AsyncResult
    result = AsyncResult(task_id)
    return {
        'task_id': task_id,
        'status': result.status,
        'result': result.result if result.ready() else None,
        'traceback': result.traceback if result.failed() else None
    }

def get_cached_data(cache_key):
    """Get cached data from task results"""
    return cache.get(cache_key)