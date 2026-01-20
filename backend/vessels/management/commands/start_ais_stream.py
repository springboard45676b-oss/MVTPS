"""
Django management command to start AIS streaming
"""

from django.core.management.base import BaseCommand
from vessels.aisstream_service import aisstream_service
import signal
import sys

class Command(BaseCommand):
    help = 'Start AIS streaming from aisstream.io'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--bounds',
            type=str,
            help='Bounding box as "minlat,minlon,maxlat,maxlon"'
        )
        parser.add_argument(
            '--global',
            action='store_true',
            help='Stream global AIS data (default)'
        )
    
    def handle(self, *args, **options):
        bounds = None
        
        if options['bounds']:
            try:
                coords = [float(x.strip()) for x in options['bounds'].split(',')]
                if len(coords) == 4:
                    bounds = {
                        'minlat': coords[0],
                        'minlon': coords[1],
                        'maxlat': coords[2],
                        'maxlon': coords[3]
                    }
                    self.stdout.write(f"Using bounds: {bounds}")
                else:
                    self.stdout.write(
                        self.style.ERROR('Invalid bounds format. Use: minlat,minlon,maxlat,maxlon')
                    )
                    return
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid bounds format. Use: minlat,minlon,maxlat,maxlon')
                )
                return
        
        # Set up signal handler for graceful shutdown
        def signal_handler(sig, frame):
            self.stdout.write('\nStopping AIS stream...')
            aisstream_service.stop_streaming()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        self.stdout.write('Starting AIS stream...')
        self.stdout.write('Press Ctrl+C to stop')
        
        try:
            aisstream_service.start_streaming(bounds)
            
            # Keep the command running
            while aisstream_service.is_streaming():
                import time
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.stdout.write('\nStopping AIS stream...')
            aisstream_service.stop_streaming()
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {e}')
            )