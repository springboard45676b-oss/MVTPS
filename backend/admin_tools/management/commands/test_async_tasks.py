from django.core.management.base import BaseCommand
from tasks.external_api_tasks import (
    fetch_ais_hub_vessels_task,
    fetch_ais_stream_vessels_task,
    fetch_weather_data_task,
    sync_unctad_data_task,
    fetch_port_performance_task,
    fetch_live_vessels_mock_task
)

class Command(BaseCommand):
    help = 'Test async external API tasks'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--task',
            type=str,
            choices=['ais_hub', 'ais_stream', 'weather', 'unctad', 'port_perf', 'mock_vessels', 'all'],
            default='all',
            help='Which task to test'
        )
    
    def handle(self, *args, **options):
        task_type = options['task']
        
        if task_type in ['ais_hub', 'all']:
            self.stdout.write('Testing AIS Hub task...')
            result = fetch_ais_hub_vessels_task.delay(40.0, 60.0, -10.0, 10.0)
            self.stdout.write(f'AIS Hub task ID: {result.id}')
        
        if task_type in ['ais_stream', 'all']:
            self.stdout.write('Testing AIS Stream task...')
            result = fetch_ais_stream_vessels_task.delay([40.0, -10.0, 60.0, 10.0])
            self.stdout.write(f'AIS Stream task ID: {result.id}')
        
        if task_type in ['weather', 'all']:
            self.stdout.write('Testing Weather task...')
            result = fetch_weather_data_task.delay(33.7, -118.2)
            self.stdout.write(f'Weather task ID: {result.id}')
        
        if task_type in ['unctad', 'all']:
            self.stdout.write('Testing UNCTAD sync task...')
            result = sync_unctad_data_task.delay()
            self.stdout.write(f'UNCTAD sync task ID: {result.id}')
        
        if task_type in ['port_perf', 'all']:
            self.stdout.write('Testing Port Performance task...')
            result = fetch_port_performance_task.delay('USLAX')
            self.stdout.write(f'Port Performance task ID: {result.id}')
        
        if task_type in ['mock_vessels', 'all']:
            self.stdout.write('Testing Mock Vessels task...')
            result = fetch_live_vessels_mock_task.delay([40.0, -10.0, 60.0, 10.0])
            self.stdout.write(f'Mock Vessels task ID: {result.id}')
        
        self.stdout.write(
            self.style.SUCCESS('All tasks triggered successfully. Check Celery worker logs for results.')
        )