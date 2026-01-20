from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from vessels.models import Vessel, VesselPosition, NavigationStatus
from ports.models import Port
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users and sample data'
    
    def handle(self, *args, **options):
        # Create test users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_user(
                username='admin',
                password='admin123',
                email='admin@test.com',
                role='admin'
            )
            self.stdout.write('Created admin user: admin/admin123')
        
        # Create navigation statuses
        nav_statuses = [
            (0, 'Under way using engine'),
            (1, 'At anchor'),
            (15, 'Undefined')
        ]
        
        for code, desc in nav_statuses:
            NavigationStatus.objects.get_or_create(
                code=code,
                defaults={'description': desc}
            )
        
        # Create test vessels with positions
        vessel_types = ['Cargo', 'Tanker', 'Container', 'Passenger', 'Fishing']
        
        for i in range(5):
            mmsi = f'36700{str(i).zfill(4)}'
            vessel, created = Vessel.objects.get_or_create(
                mmsi=mmsi,
                defaults={
                    'vessel_name': f'Test Vessel {i+1}',
                    'vessel_type_text': random.choice(vessel_types),
                    'length': random.randint(50, 300),
                    'width': random.randint(10, 50),
                    'is_active': True
                }
            )
            
            if created:
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=33.7 + (random.random() - 0.5) * 0.2,
                    longitude=-118.2 + (random.random() - 0.5) * 0.2,
                    speed_over_ground=random.randint(0, 25),
                    course_over_ground=random.randint(0, 359),
                    navigation_status=NavigationStatus.objects.get(code=0),
                    ais_timestamp=timezone.now()
                )
        
        self.stdout.write(self.style.SUCCESS('Test data created successfully!'))