from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from vessels.models import Vessel
from ports.models import Port
from vessels.voyage_models import VoyageReplay, VoyagePosition, ComplianceViolation

class Command(BaseCommand):
    help = 'Generate mock voyage replay data'

    def handle(self, *args, **options):
        vessels = list(Vessel.objects.all()[:3])
        ports = list(Port.objects.all()[:5])
        
        if not vessels or not ports:
            self.stdout.write(self.style.WARNING('Need vessels and ports in database'))
            return
        
        for i, vessel in enumerate(vessels):
            start_time = timezone.now() - timedelta(days=random.randint(1, 30))
            end_time = start_time + timedelta(hours=random.randint(24, 72))
            
            voyage = VoyageReplay.objects.create(
                vessel=vessel,
                voyage_id=f'VOY{vessel.mmsi}{i:03d}',
                start_time=start_time,
                end_time=end_time,
                origin_port=random.choice(ports),
                destination_port=random.choice(ports),
                status='completed'
            )
            
            # Generate positions
            num_positions = 50
            for j in range(num_positions):
                timestamp = start_time + (end_time - start_time) * j / num_positions
                lat = random.uniform(-60, 60)
                lng = random.uniform(-180, 180)
                
                VoyagePosition.objects.create(
                    voyage=voyage,
                    latitude=lat,
                    longitude=lng,
                    speed=random.uniform(5, 20),
                    course=random.uniform(0, 360),
                    timestamp=timestamp
                )
            
            # Generate violations
            if random.random() > 0.5:
                ComplianceViolation.objects.create(
                    voyage=voyage,
                    violation_type=random.choice(['route_deviation', 'excessive_wait', 'speed_violation']),
                    severity=random.choice(['low', 'medium', 'high']),
                    description='Detected compliance violation',
                    latitude=random.uniform(-60, 60),
                    longitude=random.uniform(-180, 180),
                    timestamp=start_time + timedelta(hours=random.randint(1, 48))
                )
        
        self.stdout.write(self.style.SUCCESS(f'Generated {len(vessels)} voyages with replay data'))
