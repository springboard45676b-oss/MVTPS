#!/usr/bin/env python3
"""
Create sample voyage data for analytics
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from analytics.models import Voyage, VoyageEvent
from vessels.models import Vessel
from ports.models import Port
from django.utils import timezone

def create_sample_voyages():
    print("🚢 Creating Sample Voyage Data")
    print("=" * 40)
    
    # Get all vessels
    vessels = list(Vessel.objects.all())
    if not vessels:
        print("❌ No vessels found. Please add vessels first.")
        return
    
    # Create some sample ports if they don't exist
    ports_data = [
        {'name': 'Port of Singapore', 'code': 'SGSIN', 'country': 'Singapore', 'latitude': 1.2966, 'longitude': 103.7764},
        {'name': 'Port of Rotterdam', 'code': 'NLRTM', 'country': 'Netherlands', 'latitude': 51.9225, 'longitude': 4.47917},
        {'name': 'Port of Shanghai', 'code': 'CNSHA', 'country': 'China', 'latitude': 31.2304, 'longitude': 121.4737},
        {'name': 'Port of Los Angeles', 'code': 'USLAX', 'country': 'USA', 'latitude': 33.7361, 'longitude': -118.2922},
        {'name': 'Port of Hamburg', 'code': 'DEHAM', 'country': 'Germany', 'latitude': 53.5511, 'longitude': 9.9937},
        {'name': 'Port of Antwerp', 'code': 'BEANR', 'country': 'Belgium', 'latitude': 51.2194, 'longitude': 4.4025},
    ]
    
    ports = []
    for port_data in ports_data:
        port, created = Port.objects.get_or_create(
            code=port_data['code'],
            defaults=port_data
        )
        ports.append(port)
        if created:
            print(f"✅ Created port: {port.name}")
    
    # Create sample voyages
    voyage_statuses = ['completed', 'in_progress', 'cancelled', 'planned']
    
    created_voyages = 0
    for i in range(25):  # Create 25 sample voyages
        vessel = random.choice(vessels)
        origin_port = random.choice(ports)
        destination_port = random.choice([p for p in ports if p != origin_port])
        status = random.choice(voyage_statuses)
        
        # Generate realistic dates
        if status == 'completed':
            departure_time = timezone.now() - timedelta(days=random.randint(1, 30))
            arrival_time = departure_time + timedelta(days=random.randint(3, 15))
        elif status == 'in_progress':
            departure_time = timezone.now() - timedelta(days=random.randint(1, 10))
            arrival_time = None
        else:
            departure_time = timezone.now() + timedelta(days=random.randint(1, 30))
            arrival_time = None
        
        # Calculate distance (simplified)
        distance = random.uniform(500, 8000)  # nautical miles
        
        voyage = Voyage.objects.create(
            vessel=vessel,
            origin_port=origin_port,
            destination_port=destination_port,
            departure_time=departure_time,
            arrival_time=arrival_time,
            status=status,
            distance=distance
        )
        
        # Create some voyage events
        event_types = ['departure', 'arrival', 'port_call', 'weather_delay', 'maintenance']
        for j in range(random.randint(1, 4)):
            event_time = departure_time + timedelta(days=random.randint(0, 7))
            if arrival_time and event_time > arrival_time:
                event_time = arrival_time - timedelta(hours=random.randint(1, 12))
            
            VoyageEvent.objects.create(
                voyage=voyage,
                event_type=random.choice(event_types),
                description=f"Sample event for voyage {voyage.id}",
                latitude=random.uniform(-90, 90),
                longitude=random.uniform(-180, 180),
                timestamp=event_time
            )
        
        created_voyages += 1
    
    print(f"✅ Created {created_voyages} sample voyages")
    print(f"✅ Created {VoyageEvent.objects.count()} voyage events")
    
    # Print summary
    print("\n📊 Voyage Summary:")
    for status, _ in Voyage.STATUS_CHOICES:
        count = Voyage.objects.filter(status=status).count()
        print(f"   {status}: {count} voyages")
    
    print("\n🎉 Sample voyage data created successfully!")

if __name__ == "__main__":
    create_sample_voyages()