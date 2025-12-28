# server/core/mock_data_generator.py

from django.utils import timezone
from datetime import datetime, timedelta
import random
from .models import Port, Voyage, Vessel

class MockDataGenerator:
    """
    Generate realistic mock data for Ports and Voyages
    Creates 15 ports and 15 voyages with proper relationships
    """
    
    # Major world ports with realistic coordinates and countries
    PORTS_DATA = [
        {
            'name': 'Port of Singapore',
            'location': 'Singapore Strait',
            'country': 'Singapore',
            'latitude': 1.2644,
            'longitude': 103.8220,
            'congestion_score': 3.5,
            'avg_wait_time': 4.2,
            'arrivals': 2850,
            'departures': 2820
        },
        {
            'name': 'Port of Shanghai',
            'location': 'Yangtze River Delta',
            'country': 'China',
            'latitude': 31.2304,
            'longitude': 121.4737,
            'congestion_score': 6.8,
            'avg_wait_time': 12.5,
            'arrivals': 3200,
            'departures': 3180
        },
        {
            'name': 'Port of Rotterdam',
            'location': 'Rhine-Meuse Delta',
            'country': 'Netherlands',
            'latitude': 51.9225,
            'longitude': 4.4792,
            'congestion_score': 4.2,
            'avg_wait_time': 6.8,
            'arrivals': 2100,
            'departures': 2090
        },
        {
            'name': 'Port of Antwerp',
            'location': 'Scheldt River',
            'country': 'Belgium',
            'latitude': 51.2993,
            'longitude': 4.4668,
            'congestion_score': 5.1,
            'avg_wait_time': 8.3,
            'arrivals': 1850,
            'departures': 1840
        },
        {
            'name': 'Port of Hamburg',
            'location': 'Elbe River',
            'country': 'Germany',
            'latitude': 53.5511,
            'longitude': 9.9937,
            'congestion_score': 4.7,
            'avg_wait_time': 7.5,
            'arrivals': 1650,
            'departures': 1640
        },
        {
            'name': 'Port of Los Angeles',
            'location': 'San Pedro Bay',
            'country': 'USA',
            'latitude': 33.7373,
            'longitude': -118.2700,
            'congestion_score': 7.2,
            'avg_wait_time': 15.4,
            'arrivals': 2400,
            'departures': 2380
        },
        {
            'name': 'Port of Long Beach',
            'location': 'San Pedro Bay',
            'country': 'USA',
            'latitude': 33.7701,
            'longitude': -118.1937,
            'congestion_score': 6.9,
            'avg_wait_time': 14.2,
            'arrivals': 2200,
            'departures': 2185
        },
        {
            'name': 'Port of Hong Kong',
            'location': 'Victoria Harbour',
            'country': 'Hong Kong',
            'latitude': 22.3193,
            'longitude': 114.1694,
            'congestion_score': 5.8,
            'avg_wait_time': 9.7,
            'arrivals': 2650,
            'departures': 2635
        },
        {
            'name': 'Port of Busan',
            'location': 'Korean Strait',
            'country': 'South Korea',
            'latitude': 35.1796,
            'longitude': 129.0756,
            'congestion_score': 4.9,
            'avg_wait_time': 7.8,
            'arrivals': 1950,
            'departures': 1940
        },
        {
            'name': 'Port of Dubai',
            'location': 'Jebel Ali',
            'country': 'UAE',
            'latitude': 25.0657,
            'longitude': 55.1371,
            'congestion_score': 5.3,
            'avg_wait_time': 8.9,
            'arrivals': 2300,
            'departures': 2285
        },
        {
            'name': 'Port of Piraeus',
            'location': 'Saronic Gulf',
            'country': 'Greece',
            'latitude': 37.9473,
            'longitude': 23.6473,
            'congestion_score': 4.1,
            'avg_wait_time': 6.2,
            'arrivals': 1450,
            'departures': 1440
        },
        {
            'name': 'Port of Yokohama',
            'location': 'Tokyo Bay',
            'country': 'Japan',
            'latitude': 35.4437,
            'longitude': 139.6380,
            'congestion_score': 3.8,
            'avg_wait_time': 5.5,
            'arrivals': 1550,
            'departures': 1545
        },
        {
            'name': 'Port of Felixstowe',
            'location': 'River Orwell',
            'country': 'UK',
            'latitude': 51.9543,
            'longitude': 1.3518,
            'congestion_score': 5.6,
            'avg_wait_time': 9.3,
            'arrivals': 1350,
            'departures': 1340
        },
        {
            'name': 'Port of Colombo',
            'location': 'Kelani River',
            'country': 'Sri Lanka',
            'latitude': 6.9271,
            'longitude': 79.8612,
            'congestion_score': 4.4,
            'avg_wait_time': 7.1,
            'arrivals': 1250,
            'departures': 1245
        },
        {
            'name': 'Port of Santos',
            'location': 'Santos Bay',
            'country': 'Brazil',
            'latitude': -23.9608,
            'longitude': -46.3339,
            'congestion_score': 6.3,
            'avg_wait_time': 11.2,
            'arrivals': 1750,
            'departures': 1740
        }
    ]
    
    @staticmethod
    def generate_ports():
        """Generate 15 mock ports with realistic data"""
        ports = []
        
        for port_data in MockDataGenerator.PORTS_DATA:
            port, created = Port.objects.get_or_create(
                name=port_data['name'],
                defaults={
                    'location': port_data['location'],
                    'country': port_data['country'],
                    'congestion_score': port_data['congestion_score'],
                    'avg_wait_time': port_data['avg_wait_time'],
                    'arrivals': port_data['arrivals'],
                    'departures': port_data['departures'],
                    'last_update': timezone.now()
                }
            )
            
            if created:
                print(f"✅ Created port: {port.name}")
            else:
                # Update existing port
                port.location = port_data['location']
                port.country = port_data['country']
                port.congestion_score = port_data['congestion_score']
                port.avg_wait_time = port_data['avg_wait_time']
                port.arrivals = port_data['arrivals']
                port.departures = port_data['departures']
                port.last_update = timezone.now()
                port.save()
                print(f"🔄 Updated port: {port.name}")
            
            ports.append(port)
        
        return ports
    
    @staticmethod
    def generate_voyages(num_voyages=15):
        """
        Generate realistic voyages between ports
        Creates voyages with proper departure/arrival times and statuses
        """
        # Get all ports
        ports = list(Port.objects.all())
        if len(ports) < 2:
            print("❌ Need at least 2 ports to create voyages")
            return []
        
        # Get all vessels
        vessels = list(Vessel.objects.all())
        if len(vessels) == 0:
            print("❌ No vessels found. Please create vessels first.")
            return []
        
        voyages = []
        statuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
        status_weights = [0.15, 0.35, 0.45, 0.05]  # More completed, fewer cancelled
        
        # Generate voyage routes (common shipping routes)
        common_routes = [
            ('Port of Singapore', 'Port of Rotterdam'),
            ('Port of Shanghai', 'Port of Los Angeles'),
            ('Port of Hong Kong', 'Port of Hamburg'),
            ('Port of Dubai', 'Port of Felixstowe'),
            ('Port of Busan', 'Port of Long Beach'),
            ('Port of Rotterdam', 'Port of Singapore'),
            ('Port of Los Angeles', 'Port of Shanghai'),
            ('Port of Hamburg', 'Port of Hong Kong'),
            ('Port of Yokohama', 'Port of Santos'),
            ('Port of Piraeus', 'Port of Colombo'),
            ('Port of Antwerp', 'Port of Dubai'),
            ('Port of Santos', 'Port of Antwerp'),
            ('Port of Colombo', 'Port of Yokohama'),
            ('Port of Felixstowe', 'Port of Piraeus'),
            ('Port of Long Beach', 'Port of Busan'),
        ]
        
        for i, (port_from_name, port_to_name) in enumerate(common_routes[:num_voyages]):
            try:
                port_from = Port.objects.get(name=port_from_name)
                port_to = Port.objects.get(name=port_to_name)
            except Port.DoesNotExist:
                continue
            
            # Randomly select a vessel
            vessel = random.choice(vessels)
            
            # Generate realistic dates
            # Voyages from past month to next month
            days_offset = random.randint(-30, 30)
            departure_time = timezone.now() + timedelta(days=days_offset)
            
            # Travel duration: 10-30 days depending on distance
            travel_days = random.randint(10, 30)
            arrival_time = departure_time + timedelta(days=travel_days)
            
            # Determine status based on dates
            now = timezone.now()
            if departure_time > now:
                status = 'scheduled'
            elif departure_time <= now < arrival_time:
                status = 'in_progress'
            else:
                # Random status for completed voyages
                status = random.choices(
                    ['completed', 'cancelled'],
                    weights=[0.95, 0.05]
                )[0]
            
            voyage, created = Voyage.objects.get_or_create(
                vessel=vessel,
                port_from=port_from,
                port_to=port_to,
                departure_time=departure_time,
                defaults={
                    'arrival_time': arrival_time,
                    'status': status
                }
            )
            
            if created:
                print(f"✅ Created voyage: {vessel.name} from {port_from.name} to {port_to.name} ({status})")
            else:
                print(f"🔄 Voyage already exists: {vessel.name} from {port_from.name} to {port_to.name}")
            
            voyages.append(voyage)
        
        return voyages
    
    @staticmethod
    def generate_all_mock_data():
        """Generate all mock data: ports and voyages"""
        print("\n" + "="*60)
        print("🚢 GENERATING MOCK PORT AND VOYAGE DATA")
        print("="*60 + "\n")
        
        # Generate ports
        print("📍 Generating 15 Ports...")
        ports = MockDataGenerator.generate_ports()
        print(f"\n✅ Generated {len(ports)} ports\n")
        
        # Generate voyages
        print("🛳️  Generating 15 Voyages...")
        voyages = MockDataGenerator.generate_voyages(15)
        print(f"\n✅ Generated {len(voyages)} voyages\n")
        
        # Summary
        print("="*60)
        print("📊 MOCK DATA GENERATION SUMMARY")
        print("="*60)
        print(f"Total Ports: {Port.objects.count()}")
        print(f"Total Voyages: {Voyage.objects.count()}")
        print(f"Total Vessels: {Vessel.objects.count()}")
        print("="*60 + "\n")
        
        return {
            'ports': ports,
            'voyages': voyages,
            'summary': {
                'total_ports': Port.objects.count(),
                'total_voyages': Voyage.objects.count(),
                'total_vessels': Vessel.objects.count()
            }
        }