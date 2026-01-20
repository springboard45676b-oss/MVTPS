from django.core.management.base import BaseCommand
from django.utils import timezone
from admin_tools.models import APISource

class Command(BaseCommand):
    help = 'Generate mock API source data'

    def handle(self, *args, **kwargs):
        APISource.objects.all().delete()
        
        sources = [
            {
                'name': 'MarineTraffic AIS',
                'source_type': 'ais',
                'api_url': 'https://api.marinetraffic.com/v1',
                'api_key': 'mt_demo_key_12345',
                'status': 'active',
                'is_enabled': True,
                'sync_frequency': 5
            },
            {
                'name': 'VesselFinder API',
                'source_type': 'ais',
                'api_url': 'https://api.vesselfinder.com/v2',
                'api_key': 'vf_demo_key_67890',
                'status': 'active',
                'is_enabled': True,
                'sync_frequency': 10
            },
            {
                'name': 'OpenWeatherMap',
                'source_type': 'weather',
                'api_url': 'https://api.openweathermap.org/data/2.5',
                'api_key': 'owm_demo_key_abcde',
                'status': 'active',
                'is_enabled': True,
                'sync_frequency': 30
            },
            {
                'name': 'NOAA Weather Service',
                'source_type': 'weather',
                'api_url': 'https://api.weather.gov',
                'api_key': '',
                'status': 'active',
                'is_enabled': True,
                'sync_frequency': 60
            },
            {
                'name': 'Port Authority Singapore',
                'source_type': 'port',
                'api_url': 'https://api.mpa.gov.sg/v1',
                'api_key': 'pas_demo_key_fghij',
                'status': 'active',
                'is_enabled': False,
                'sync_frequency': 15
            },
            {
                'name': 'Port of Rotterdam API',
                'source_type': 'port',
                'api_url': 'https://api.portofrotterdam.com/v2',
                'api_key': 'por_demo_key_klmno',
                'status': 'inactive',
                'is_enabled': False,
                'sync_frequency': 20
            },
            {
                'name': 'Global Shipping Watch',
                'source_type': 'traffic',
                'api_url': 'https://api.globalshippingwatch.org/v1',
                'api_key': 'gsw_demo_key_pqrst',
                'status': 'active',
                'is_enabled': True,
                'sync_frequency': 15
            },
            {
                'name': 'IMO Maritime Data',
                'source_type': 'traffic',
                'api_url': 'https://api.imo.org/maritime/v1',
                'api_key': 'imo_demo_key_uvwxy',
                'status': 'error',
                'is_enabled': True,
                'sync_frequency': 30,
                'error_count': 3,
                'last_error': 'Connection timeout after 30 seconds'
            }
        ]
        
        for source_data in sources:
            source = APISource.objects.create(**source_data)
            if source.status == 'active':
                source.last_sync = timezone.now()
                source.save()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(sources)} API sources'))
