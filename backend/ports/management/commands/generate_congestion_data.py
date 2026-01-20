from django.core.management.base import BaseCommand
from django.utils import timezone
from ports.models import Port, PortCongestion
import random

class Command(BaseCommand):
    help = 'Generate mock port congestion data'

    def handle(self, *args, **options):
        self.stdout.write('Generating port congestion data...')
        
        ports = Port.objects.all()
        if not ports.exists():
            self.stdout.write(self.style.WARNING('No ports found. Run sync_unctad_data first.'))
            return
        
        created_count = 0
        for port in ports:
            # Generate realistic congestion data based on port
            if 'Los Angeles' in port.name:
                congestion_data = {
                    'current_vessels': random.randint(80, 100),
                    'waiting_vessels': random.randint(20, 30),
                    'average_wait_time': random.uniform(30, 45),
                    'arrivals_24h': random.randint(60, 80),
                    'departures_24h': random.randint(55, 75),
                    'throughput_efficiency': random.uniform(0.6, 0.8)
                }
            elif 'Shanghai' in port.name:
                congestion_data = {
                    'current_vessels': random.randint(70, 85),
                    'waiting_vessels': random.randint(10, 15),
                    'average_wait_time': random.uniform(15, 22),
                    'arrivals_24h': random.randint(140, 170),
                    'departures_24h': random.randint(135, 165),
                    'throughput_efficiency': random.uniform(0.8, 0.9)
                }
            elif 'Singapore' in port.name:
                congestion_data = {
                    'current_vessels': random.randint(40, 50),
                    'waiting_vessels': random.randint(2, 5),
                    'average_wait_time': random.uniform(6, 10),
                    'arrivals_24h': random.randint(110, 130),
                    'departures_24h': random.randint(105, 125),
                    'throughput_efficiency': random.uniform(0.9, 1.0)
                }
            else:
                congestion_data = {
                    'current_vessels': random.randint(50, 70),
                    'waiting_vessels': random.randint(5, 12),
                    'average_wait_time': random.uniform(10, 18),
                    'arrivals_24h': random.randint(70, 100),
                    'departures_24h': random.randint(65, 95),
                    'throughput_efficiency': random.uniform(0.75, 0.9)
                }
            
            PortCongestion.objects.create(
                port=port,
                **congestion_data
            )
            created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created congestion data for {created_count} ports')
        )
