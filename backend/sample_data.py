#!/usr/bin/env python
"""
Sample data creation script for Maritime Platform
Run this after migrations to populate the database with test data
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, VesselPosition, VesselSubscription
from ports.models import Port, PortCongestion
from safety.models import SafetyZone, WeatherData
from analytics.models import Voyage, VoyageEvent
from authentication.models import User

def create_sample_data():
    print("Creating sample data...")
    
    # Create sample users
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@maritime.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        print("Created admin user (username: admin, password: admin123)")
    
    if not User.objects.filter(username='operator').exists():
        operator_user = User.objects.create_user(
            username='operator',
            email='operator@maritime.com',
            password='operator123',
            first_name='John',
            last_name='Operator',
            role='operator',
            company='Maritime Corp'
        )
        print("Created operator user (username: operator, password: operator123)")
    
    # Create sample ports
    ports_data = [
        {'name': 'Port of Los Angeles', 'code': 'USLAX', 'country': 'United States', 'lat': 33.7361, 'lng': -118.2922},
        {'name': 'Port of Shanghai', 'code': 'CNSHA', 'country': 'China', 'lat': 31.2304, 'lng': 121.4737},
        {'name': 'Port of Singapore', 'code': 'SGSIN', 'country': 'Singapore', 'lat': 1.2966, 'lng': 103.8006},
        {'name': 'Port of Rotterdam', 'code': 'NLRTM', 'country': 'Netherlands', 'lat': 51.9225, 'lng': 4.4792},
        {'name': 'Port of Hamburg', 'code': 'DEHAM', 'country': 'Germany', 'lat': 53.5511, 'lng': 9.9937},
    ]
    
    for port_data in ports_data:
        port, created = Port.objects.get_or_create(
            code=port_data['code'],
            defaults={
                'name': port_data['name'],
                'country': port_data['country'],
                'latitude': port_data['lat'],
                'longitude': port_data['lng']
            }
        )
        if created:
            print(f"Created port: {port.name}")
            
            # Add congestion data
            PortCongestion.objects.create(
                port=port,
                vessels_waiting=random.randint(5, 50),
                average_wait_time=random.uniform(2.0, 24.0),
                congestion_level=random.choice(['low', 'medium', 'high']),
                timestamp=datetime.now()
            )
    
    # Create sample vessels
    vessels_data = [
        {'name': 'Ever Given', 'mmsi': '353136000', 'type': 'container', 'flag': 'Panama'},
        {'name': 'MSC Gulsun', 'mmsi': '636019825', 'type': 'container', 'flag': 'Liberia'},
        {'name': 'Seawise Giant', 'mmsi': '477123456', 'type': 'tanker', 'flag': 'Singapore'},
        {'name': 'Queen Mary 2', 'mmsi': '310627000', 'type': 'passenger', 'flag': 'United Kingdom'},
        {'name': 'Maersk Alabama', 'mmsi': '367123456', 'type': 'cargo', 'flag': 'United States'},
    ]
    
    for vessel_data in vessels_data:
        vessel, created = Vessel.objects.get_or_create(
            mmsi=vessel_data['mmsi'],
            defaults={
                'name': vessel_data['name'],
                'vessel_type': vessel_data['type'],
                'flag': vessel_data['flag'],
                'length': random.uniform(200, 400),
                'width': random.uniform(30, 60),
                'gross_tonnage': random.randint(50000, 200000),
                'built_year': random.randint(2000, 2023)
            }
        )
        if created:
            print(f"Created vessel: {vessel.name}")
            
            # Add position data
            for i in range(5):
                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=random.uniform(-60, 60),
                    longitude=random.uniform(-180, 180),
                    speed=random.uniform(0, 25),
                    course=random.uniform(0, 360),
                    heading=random.uniform(0, 360),
                    status='underway',
                    timestamp=datetime.now() - timedelta(hours=i)
                )
    
    # Create sample safety zones
    safety_zones_data = [
        {
            'name': 'Gulf of Aden Piracy Zone',
            'type': 'piracy',
            'risk': 'high',
            'description': 'High risk piracy area in Gulf of Aden',
            'coords': [[12.0, 43.0], [12.0, 51.0], [18.0, 51.0], [18.0, 43.0]]
        },
        {
            'name': 'Hurricane Warning Zone',
            'type': 'storm',
            'risk': 'critical',
            'description': 'Active hurricane warning area',
            'coords': [[25.0, -80.0], [25.0, -75.0], [30.0, -75.0], [30.0, -80.0]]
        },
        {
            'name': 'Strait of Hormuz',
            'type': 'restricted',
            'risk': 'medium',
            'description': 'Restricted navigation area',
            'coords': [[25.5, 56.0], [25.5, 57.0], [26.5, 57.0], [26.5, 56.0]]
        }
    ]
    
    for zone_data in safety_zones_data:
        zone, created = SafetyZone.objects.get_or_create(
            name=zone_data['name'],
            defaults={
                'zone_type': zone_data['type'],
                'risk_level': zone_data['risk'],
                'description': zone_data['description'],
                'coordinates': zone_data['coords'],
                'active': True
            }
        )
        if created:
            print(f"Created safety zone: {zone.name}")
    
    # Create sample weather data
    for i in range(20):
        WeatherData.objects.create(
            latitude=random.uniform(-60, 60),
            longitude=random.uniform(-180, 180),
            wind_speed=random.uniform(0, 30),
            wind_direction=random.uniform(0, 360),
            wave_height=random.uniform(0.5, 8.0),
            visibility=random.uniform(1, 50),
            temperature=random.uniform(-10, 40),
            timestamp=datetime.now() - timedelta(hours=random.randint(0, 24))
        )
    
    # Create sample voyages
    vessels = Vessel.objects.all()
    ports = Port.objects.all()
    
    for vessel in vessels[:3]:  # Create voyages for first 3 vessels
        for i in range(2):
            origin = random.choice(ports)
            destination = random.choice(ports.exclude(id=origin.id))
            
            voyage = Voyage.objects.create(
                vessel=vessel,
                origin_port=origin,
                destination_port=destination,
                departure_time=datetime.now() - timedelta(days=random.randint(1, 30)),
                status=random.choice(['completed', 'in_progress', 'planned']),
                distance=random.uniform(500, 5000)
            )
            
            # Add voyage events
            for j in range(random.randint(1, 4)):
                VoyageEvent.objects.create(
                    voyage=voyage,
                    event_type=random.choice(['departure', 'arrival', 'port_call', 'anchor']),
                    description=f"Event {j+1} for voyage {voyage.id}",
                    latitude=random.uniform(-60, 60),
                    longitude=random.uniform(-180, 180),
                    timestamp=voyage.departure_time + timedelta(hours=j*6)
                )
    
    print("Sample data creation completed!")
    print("\nTest accounts created:")
    print("Admin: username=admin, password=admin123")
    print("Operator: username=operator, password=operator123")

if __name__ == '__main__':
    create_sample_data()