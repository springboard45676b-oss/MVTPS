"""
Management command to seed the database with initial data.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from api.models import (
    User, Vessel, Port, Voyage, VoyageWaypoint,
    SafetyZone, Event, Notification, APISource
)


class Command(BaseCommand):
    help = 'Seed the database with initial maritime data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create admin user
        if not User.objects.filter(email='admin@maritime.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@maritime.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        
        # Create sample users
        users_data = [
            {'username': 'analyst1', 'email': 'sarah@maritime.com', 'role': 'analyst', 'first_name': 'Sarah', 'last_name': 'Analyst'},
            {'username': 'operator1', 'email': 'mike@maritime.com', 'role': 'operator', 'first_name': 'Mike', 'last_name': 'Operator'},
            {'username': 'insurer1', 'email': 'emily@insurance.com', 'role': 'insurer', 'first_name': 'Emily', 'last_name': 'Insurer'},
        ]
        
        for data in users_data:
            if not User.objects.filter(email=data['email']).exists():
                User.objects.create_user(password='password123', **data)
        
        self.stdout.write(self.style.SUCCESS('Created sample users'))
        
        # Create vessels
        vessels_data = [
            {'imo_number': '9876543', 'mmsi': '123456789', 'name': 'MV Pacific Star', 'vessel_type': 'cargo', 'flag': 'Panama', 'flag_code': 'PA', 'latitude': 51.9, 'longitude': 4.5, 'speed': 14.5, 'heading': 245, 'status': 'sailing', 'destination': 'Rotterdam'},
            {'imo_number': '9876544', 'mmsi': '123456790', 'name': 'SS Atlantic Glory', 'vessel_type': 'tanker', 'flag': 'Liberia', 'flag_code': 'LR', 'latitude': 40.7, 'longitude': -74.0, 'speed': 12.3, 'heading': 90, 'status': 'anchored', 'destination': 'New York'},
            {'imo_number': '9876545', 'mmsi': '123456791', 'name': 'MV Ocean Dream', 'vessel_type': 'passenger', 'flag': 'Singapore', 'flag_code': 'SG', 'latitude': 1.3, 'longitude': 103.8, 'speed': 18.2, 'heading': 180, 'status': 'sailing', 'destination': 'Singapore'},
            {'imo_number': '9876546', 'mmsi': '123456792', 'name': 'SS Northern Light', 'vessel_type': 'cargo', 'flag': 'Marshall Islands', 'flag_code': 'MH', 'latitude': 35.6, 'longitude': 139.7, 'speed': 15.8, 'heading': 270, 'status': 'sailing', 'destination': 'Tokyo'},
            {'imo_number': '9876547', 'mmsi': '123456793', 'name': 'MV Trade Wind', 'vessel_type': 'cargo', 'flag': 'Panama', 'flag_code': 'PA', 'latitude': 22.3, 'longitude': 114.2, 'speed': 11.4, 'heading': 45, 'status': 'docked', 'destination': 'Hong Kong'},
            {'imo_number': '9876548', 'mmsi': '123456794', 'name': 'SS Blue Horizon', 'vessel_type': 'tanker', 'flag': 'Greece', 'flag_code': 'GR', 'latitude': 37.9, 'longitude': 23.7, 'speed': 13.7, 'heading': 135, 'status': 'sailing', 'destination': 'Athens'},
            {'imo_number': '9876549', 'mmsi': '123456795', 'name': 'MV Coral Sea', 'vessel_type': 'cargo', 'flag': 'Japan', 'flag_code': 'JP', 'latitude': -33.9, 'longitude': 151.2, 'speed': 16.1, 'heading': 320, 'status': 'sailing', 'destination': 'Sydney'},
            {'imo_number': '9876550', 'mmsi': '123456796', 'name': 'SS Gulf Star', 'vessel_type': 'tanker', 'flag': 'UAE', 'flag_code': 'AE', 'latitude': 25.2, 'longitude': 55.3, 'speed': 0, 'heading': 0, 'status': 'docked', 'destination': 'Dubai'},
            {'imo_number': '9876551', 'mmsi': '123456797', 'name': 'MV Arctic Explorer', 'vessel_type': 'cargo', 'flag': 'Norway', 'flag_code': 'NO', 'latitude': 59.9, 'longitude': 10.7, 'speed': 10.5, 'heading': 200, 'status': 'sailing', 'destination': 'Oslo'},
            {'imo_number': '9876552', 'mmsi': '123456798', 'name': 'SS Mediterranean', 'vessel_type': 'passenger', 'flag': 'Italy', 'flag_code': 'IT', 'latitude': 41.9, 'longitude': 12.5, 'speed': 20.3, 'heading': 95, 'status': 'sailing', 'destination': 'Rome'},
        ]
        
        for data in vessels_data:
            Vessel.objects.update_or_create(imo_number=data['imo_number'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS('Created vessels'))
        
        # Create ports
        ports_data = [
            {'code': 'NLRTM', 'name': 'Port of Rotterdam', 'country': 'Netherlands', 'country_code': 'NL', 'latitude': 51.9, 'longitude': 4.5, 'congestion_score': 85, 'avg_wait_time': 18, 'arrivals_today': 45, 'departures_today': 42, 'vessels_in_port': 128},
            {'code': 'SGSIN', 'name': 'Port of Singapore', 'country': 'Singapore', 'country_code': 'SG', 'latitude': 1.3, 'longitude': 103.8, 'congestion_score': 72, 'avg_wait_time': 12, 'arrivals_today': 68, 'departures_today': 71, 'vessels_in_port': 215},
            {'code': 'CNSHA', 'name': 'Port of Shanghai', 'country': 'China', 'country_code': 'CN', 'latitude': 31.2, 'longitude': 121.5, 'congestion_score': 91, 'avg_wait_time': 24, 'arrivals_today': 89, 'departures_today': 85, 'vessels_in_port': 342},
            {'code': 'USLAX', 'name': 'Port of Los Angeles', 'country': 'USA', 'country_code': 'US', 'latitude': 33.7, 'longitude': -118.3, 'congestion_score': 65, 'avg_wait_time': 8, 'arrivals_today': 34, 'departures_today': 38, 'vessels_in_port': 87},
            {'code': 'DEHAM', 'name': 'Port of Hamburg', 'country': 'Germany', 'country_code': 'DE', 'latitude': 53.5, 'longitude': 10.0, 'congestion_score': 45, 'avg_wait_time': 6, 'arrivals_today': 28, 'departures_today': 25, 'vessels_in_port': 64},
            {'code': 'BEANR', 'name': 'Port of Antwerp', 'country': 'Belgium', 'country_code': 'BE', 'latitude': 51.2, 'longitude': 4.4, 'congestion_score': 58, 'avg_wait_time': 10, 'arrivals_today': 31, 'departures_today': 29, 'vessels_in_port': 76},
            {'code': 'AEDXB', 'name': 'Port of Dubai', 'country': 'UAE', 'country_code': 'AE', 'latitude': 25.2, 'longitude': 55.3, 'congestion_score': 42, 'avg_wait_time': 5, 'arrivals_today': 22, 'departures_today': 24, 'vessels_in_port': 54},
            {'code': 'HKHKG', 'name': 'Port of Hong Kong', 'country': 'Hong Kong', 'country_code': 'HK', 'latitude': 22.3, 'longitude': 114.2, 'congestion_score': 78, 'avg_wait_time': 14, 'arrivals_today': 52, 'departures_today': 48, 'vessels_in_port': 156},
        ]
        
        for data in ports_data:
            Port.objects.update_or_create(code=data['code'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS('Created ports'))
        
        # Create safety zones
        safety_zones_data = [
            {'name': 'Gulf of Aden', 'zone_type': 'piracy', 'severity': 'high', 'latitude': 12.5, 'longitude': 47.0, 'radius_km': 500, 'description': 'High piracy risk area', 'advisory': 'Armed escort recommended'},
            {'name': 'Gulf of Guinea', 'zone_type': 'piracy', 'severity': 'high', 'latitude': 5.0, 'longitude': 3.0, 'radius_km': 400, 'description': 'Piracy and armed robbery risk', 'advisory': 'Maintain vigilance'},
            {'name': 'North Atlantic Storm', 'zone_type': 'weather', 'severity': 'medium', 'latitude': 45.0, 'longitude': -30.0, 'radius_km': 800, 'description': 'Severe storm system', 'advisory': 'Avoid area if possible'},
            {'name': 'South China Sea', 'zone_type': 'weather', 'severity': 'low', 'latitude': 15.0, 'longitude': 115.0, 'radius_km': 600, 'description': 'Monsoon season activity', 'advisory': 'Monitor weather updates'},
        ]
        
        for data in safety_zones_data:
            SafetyZone.objects.update_or_create(name=data['name'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS('Created safety zones'))
        
        # Create voyages
        ports = list(Port.objects.all())
        vessels = list(Vessel.objects.all())
        
        if ports and vessels:
            voyages_data = [
                {'voyage_id': 'VYG-001', 'vessel': vessels[0], 'port_from': ports[0], 'port_to': ports[1], 'status': 'in_transit'},
                {'voyage_id': 'VYG-002', 'vessel': vessels[1], 'port_from': ports[3], 'port_to': ports[4], 'status': 'completed'},
                {'voyage_id': 'VYG-003', 'vessel': vessels[2], 'port_from': ports[6], 'port_to': ports[1], 'status': 'completed'},
                {'voyage_id': 'VYG-004', 'vessel': vessels[3], 'port_from': ports[2], 'port_to': ports[3], 'status': 'in_transit'},
                {'voyage_id': 'VYG-005', 'vessel': vessels[4], 'port_from': ports[2], 'port_to': ports[7], 'status': 'scheduled'},
            ]
            
            for i, data in enumerate(voyages_data):
                departure = timezone.now() - timedelta(days=random.randint(1, 30))
                arrival = departure + timedelta(days=random.randint(5, 20))
                Voyage.objects.update_or_create(
                    voyage_id=data['voyage_id'],
                    defaults={
                        **data,
                        'departure_time': departure,
                        'arrival_time': arrival if data['status'] == 'completed' else None,
                        'estimated_arrival': arrival,
                    }
                )
            
            self.stdout.write(self.style.SUCCESS('Created voyages'))
        
        # Create events
        events_data = [
            {'event_type': 'arrival', 'title': 'MV Pacific Star arrived at Rotterdam', 'description': 'Successfully docked at Berth 12', 'is_critical': False},
            {'event_type': 'weather', 'title': 'Storm Warning - North Atlantic', 'description': 'Severe storm system moving east', 'is_critical': True},
            {'event_type': 'piracy', 'title': 'Piracy Alert - Gulf of Aden', 'description': 'Multiple suspicious vessels detected', 'is_critical': True},
            {'event_type': 'inspection', 'title': 'Cargo inspection completed', 'description': 'SS Atlantic Glory passed inspection', 'is_critical': False},
            {'event_type': 'maintenance', 'title': 'Scheduled maintenance', 'description': 'MV Trade Wind entering dry dock', 'is_critical': False},
        ]
        
        for data in events_data:
            vessel = random.choice(vessels) if vessels else None
            Event.objects.create(
                vessel=vessel,
                timestamp=timezone.now() - timedelta(hours=random.randint(1, 48)),
                **data
            )
        
        self.stdout.write(self.style.SUCCESS('Created events'))
        
        # Create API sources
        api_sources_data = [
            {'name': 'MarineTraffic API', 'description': 'Vessel tracking & AIS data', 'base_url': 'https://api.marinetraffic.com/v1', 'status': 'connected'},
            {'name': 'NOAA Weather API', 'description': 'Weather & ocean conditions', 'base_url': 'https://api.weather.gov', 'status': 'connected'},
            {'name': 'UNCTAD Maritime Data', 'description': 'Port & trade analytics', 'base_url': 'https://unctadstat.unctad.org/api', 'status': 'rate_limited'},
        ]
        
        for data in api_sources_data:
            APISource.objects.update_or_create(name=data['name'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS('Created API sources'))
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))