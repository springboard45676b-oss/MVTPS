import requests
import logging
from datetime import datetime
from django.utils import timezone
from ports.models import Port, UNCTADPortData

logger = logging.getLogger(__name__)

class UNCTADService:
    """Service to fetch and process UNCTAD port statistics"""
    
    UNCTAD_API_URL = "https://unctadstat-api.unctad.org/api/ports"  # Mock URL
    RETRY_ATTEMPTS = 3
    TIMEOUT = 10
    
    @staticmethod
    def fetch_port_data():
        """Async wrapper - triggers Celery task and returns cached data"""
        from django.core.cache import cache
        from tasks.external_api_tasks import sync_unctad_data_task
        
        # Check cache first
        cache_key = "unctad_port_data"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        # Trigger async task
        sync_unctad_data_task.delay()
        
        # Return fallback data immediately
        return UNCTADService._sync_fallback()
    
    @staticmethod
    def _sync_fallback():
        """Fetch UNCTAD data with retry and fallback to mock data - SYNC FALLBACK"""
        for attempt in range(UNCTADService.RETRY_ATTEMPTS):
            try:
                response = requests.get(
                    UNCTADService.UNCTAD_API_URL,
                    timeout=UNCTADService.TIMEOUT
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Successfully fetched UNCTAD data from API")
                    return UNCTADService._process_api_data(data)
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"UNCTAD API attempt {attempt + 1} failed: {str(e)}")
                continue
        
        # Fallback to mock data
        logger.info("Using mock UNCTAD data as fallback")
        return UNCTADService._get_mock_data()
    
    @staticmethod
    def _process_api_data(data):
        """Process and validate API response data"""
        processed = []
        for item in data.get('ports', []):
            try:
                processed.append({
                    'port_name': item['name'],
                    'country': item['country'],
                    'average_wait_time': float(item.get('avg_wait_time', 0)),
                    'vessel_arrival_count': int(item.get('arrivals', 0)),
                    'vessel_departure_count': int(item.get('departures', 0)),
                    'congestion_index': item.get('congestion', 'low'),
                    'container_throughput': int(item.get('teu', 0)),
                    'cargo_tonnage': float(item.get('tonnage', 0))
                })
            except (KeyError, ValueError) as e:
                logger.error(f"Error processing port data: {str(e)}")
                continue
        
        return processed
    
    @staticmethod
    def _get_mock_data():
        """Generate mock UNCTAD data for testing"""
        return [
            {
                'port_name': 'Port of Singapore',
                'country': 'Singapore',
                'average_wait_time': 8.5,
                'vessel_arrival_count': 1250,
                'vessel_departure_count': 1230,
                'congestion_index': 'low',
                'container_throughput': 37200000,
                'cargo_tonnage': 626.2
            },
            {
                'port_name': 'Port of Shanghai',
                'country': 'China',
                'average_wait_time': 18.2,
                'vessel_arrival_count': 1580,
                'vessel_departure_count': 1560,
                'congestion_index': 'medium',
                'container_throughput': 43300000,
                'cargo_tonnage': 735.5
            },
            {
                'port_name': 'Port of Rotterdam',
                'country': 'Netherlands',
                'average_wait_time': 12.3,
                'vessel_arrival_count': 890,
                'vessel_departure_count': 885,
                'congestion_index': 'low',
                'container_throughput': 14350000,
                'cargo_tonnage': 469.4
            },
            {
                'port_name': 'Port of Los Angeles',
                'country': 'United States',
                'average_wait_time': 36.7,
                'vessel_arrival_count': 720,
                'vessel_departure_count': 695,
                'congestion_index': 'high',
                'container_throughput': 9213000,
                'cargo_tonnage': 285.3
            },
            {
                'port_name': 'Port of Hamburg',
                'country': 'Germany',
                'average_wait_time': 14.8,
                'vessel_arrival_count': 650,
                'vessel_departure_count': 645,
                'congestion_index': 'medium',
                'container_throughput': 8730000,
                'cargo_tonnage': 136.5
            },
            {
                'port_name': 'Port of Dubai',
                'country': 'United Arab Emirates',
                'average_wait_time': 10.2,
                'vessel_arrival_count': 980,
                'vessel_departure_count': 975,
                'congestion_index': 'low',
                'container_throughput': 14100000,
                'cargo_tonnage': 122.8
            }
        ]
    
    @staticmethod
    def sync_to_database():
        """Sync UNCTAD data to database"""
        data = UNCTADService.fetch_port_data()
        synced_count = 0
        
        for item in data:
            try:
                # Find or create port
                port, created = Port.objects.get_or_create(
                    name=item['port_name'],
                    defaults={
                        'code': item['port_name'][:10].upper().replace(' ', ''),
                        'country': item['country'],
                        'latitude': 0.0,  # Would need geocoding
                        'longitude': 0.0,
                        'capacity': 100,
                        'berths': 20
                    }
                )
                
                # Create or update UNCTAD data
                UNCTADPortData.objects.update_or_create(
                    port=port,
                    defaults={
                        'port_name': item['port_name'],
                        'country': item['country'],
                        'average_wait_time': item['average_wait_time'],
                        'vessel_arrival_count': item['vessel_arrival_count'],
                        'vessel_departure_count': item['vessel_departure_count'],
                        'congestion_index': item['congestion_index'],
                        'container_throughput': item['container_throughput'],
                        'cargo_tonnage': item['cargo_tonnage']
                    }
                )
                
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Error syncing port {item['port_name']}: {str(e)}")
                continue
        
        logger.info(f"Successfully synced {synced_count} ports from UNCTAD data")
        return synced_count
