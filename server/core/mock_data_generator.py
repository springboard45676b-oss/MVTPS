# server/core/mock_data_generator.py - COMPLETELY FIXED

from django.utils import timezone
from datetime import datetime, timedelta
import random
from .models import Port, Voyage, Vessel

class MockDataGenerator:
    """
    Generate realistic mock data for Ports and Voyages
    CRITICAL FIX: Ensures NO NULL values in entry_time and berthing_time
    """
    
    PORTS_DATA = [
        {
            'name': 'Port of Singapore',
            'location': 'Singapore Strait',
            'country': 'Singapore',
            'latitude': 1.2644,
            'longitude': 103.8220,
        },
        {
            'name': 'Port of Shanghai',
            'location': 'Yangtze River Delta',
            'country': 'China',
            'latitude': 31.2304,
            'longitude': 121.4737,
        },
        {
            'name': 'Port of Rotterdam',
            'location': 'Rhine-Meuse Delta',
            'country': 'Netherlands',
            'latitude': 51.9225,
            'longitude': 4.4792,
        },
        {
            'name': 'Port of Antwerp',
            'location': 'Scheldt River',
            'country': 'Belgium',
            'latitude': 51.2993,
            'longitude': 4.4668,
        },
        {
            'name': 'Port of Hamburg',
            'location': 'Elbe River',
            'country': 'Germany',
            'latitude': 53.5511,
            'longitude': 9.9937,
        },
        {
            'name': 'Port of Los Angeles',
            'location': 'San Pedro Bay',
            'country': 'USA',
            'latitude': 33.7373,
            'longitude': -118.2700,
        },
        {
            'name': 'Port of Long Beach',
            'location': 'San Pedro Bay',
            'country': 'USA',
            'latitude': 33.7701,
            'longitude': -118.1937,
        },
        {
            'name': 'Port of Hong Kong',
            'location': 'Victoria Harbour',
            'country': 'Hong Kong',
            'latitude': 22.3193,
            'longitude': 114.1694,
        },
        {
            'name': 'Port of Busan',
            'location': 'Korean Strait',
            'country': 'South Korea',
            'latitude': 35.1796,
            'longitude': 129.0756,
        },
        {
            'name': 'Port of Dubai',
            'location': 'Jebel Ali',
            'country': 'UAE',
            'latitude': 25.0657,
            'longitude': 55.1371,
        },
        {
            'name': 'Port of Piraeus',
            'location': 'Saronic Gulf',
            'country': 'Greece',
            'latitude': 37.9473,
            'longitude': 23.6473,
        },
        {
            'name': 'Port of Yokohama',
            'location': 'Tokyo Bay',
            'country': 'Japan',
            'latitude': 35.4437,
            'longitude': 139.6380,
        },
        {
            'name': 'Port of Felixstowe',
            'location': 'River Orwell',
            'country': 'UK',
            'latitude': 51.9543,
            'longitude': 1.3518,
        },
        {
            'name': 'Port of Colombo',
            'location': 'Kelani River',
            'country': 'Sri Lanka',
            'latitude': 6.9271,
            'longitude': 79.8612,
        },
        {
            'name': 'Port of Santos',
            'location': 'Santos Bay',
            'country': 'Brazil',
            'latitude': -23.9608,
            'longitude': -46.3339,
        }
    ]
    
    @staticmethod
    def generate_ports():
        """Generate 15 mock ports"""
        ports = []
        
        for port_data in MockDataGenerator.PORTS_DATA:
            port, created = Port.objects.get_or_create(
                name=port_data['name'],
                defaults={
                    'location': port_data['location'],
                    'country': port_data['country'],
                    'latitude': port_data['latitude'],
                    'longitude': port_data['longitude'],
                    'congestion_score': 0.0,
                    'avg_wait_time': 0.0,
                    'arrivals': 0,
                    'departures': 0,
                    'last_update': timezone.now()
                }
            )
            
            if created:
                print(f"✅ Created port: {port.name}")
            
            ports.append(port)
        
        return ports
    
    @staticmethod
    def calculate_port_statistics():
        """Calculate port statistics - Now includes ALL voyages with times"""
        ports = Port.objects.all()
        
        for port in ports:
            arrivals_count = Voyage.objects.filter(port_to=port).count()
            departures_count = Voyage.objects.filter(port_from=port).count()
            
            # Get wait times from ALL voyages that have entry and berthing times
            # Not just completed - this gives more realistic port metrics
            all_arrivals = Voyage.objects.filter(port_to=port)
            
            wait_times = []
            for voyage in all_arrivals:
                if voyage.entry_time and voyage.berthing_time:
                    wait_delta = voyage.berthing_time - voyage.entry_time
                    wait_hours = wait_delta.total_seconds() / 3600
                    if wait_hours > 0:  # Only count positive wait times
                        wait_times.append(wait_hours)
            
            if wait_times:
                avg_wait_time = sum(wait_times) / len(wait_times)
            else:
                # If no wait times available, set a default based on port size
                avg_wait_time = random.uniform(8.0, 18.0)
            
            # Congestion score: 0-10 scale based on wait time
            # 0h = 0, 30h+ = 10
            congestion_score = min((avg_wait_time / 30.0) * 10.0, 10.0)
            
            port.arrivals = arrivals_count
            port.departures = departures_count
            port.avg_wait_time = round(avg_wait_time, 2)
            port.congestion_score = round(congestion_score, 2)
            port.last_update = timezone.now()
            port.save()
            
            print(f"📊 {port.name}: Arrivals={arrivals_count}, Avg Wait={avg_wait_time:.2f}h, Congestion={congestion_score:.2f}")
    
    @staticmethod
    def generate_voyages(num_voyages=15):
        """
        Generate voyages with GUARANTEED NO NULL VALUES
        CRITICAL FIX: Always set entry_time and berthing_time for ALL voyages
        """
        ports = list(Port.objects.all())
        if len(ports) < 2:
            print("❌ Need at least 2 ports")
            return []
        
        vessels = list(Vessel.objects.all())
        if len(vessels) == 0:
            print("❌ No vessels found")
            return []
        
        voyages = []
        now = timezone.now()
        
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
            
            vessel = random.choice(vessels)
            
            # Distribute statuses more evenly: 40% completed, 30% in_progress, 30% scheduled
            rand = random.random()
            if rand < 0.4:
                status = 'completed'
            elif rand < 0.7:
                status = 'in_progress'
            else:
                status = 'scheduled'
            
            # Generate times based on status
            travel_days = random.randint(10, 30)
            wait_hours = random.uniform(6.0, 24.0)  # Increased range for more variety
            
            if status == 'scheduled':
                # SCHEDULED: Future departure
                days_ahead = random.randint(1, 30)
                departure_time = now + timedelta(days=days_ahead)
                arrival_time = departure_time + timedelta(days=travel_days)
                
                # Set planned times for scheduled voyages
                entry_time = arrival_time - timedelta(hours=random.randint(12, 48))
                berthing_time = entry_time + timedelta(hours=wait_hours)
                
            elif status == 'in_progress':
                # IN PROGRESS: Past departure, future arrival
                days_ago = random.randint(1, 15)
                departure_time = now - timedelta(days=days_ago)
                arrival_time = departure_time + timedelta(days=travel_days)
                
                # Already entered port, currently waiting
                entry_time = now - timedelta(hours=random.randint(1, 48))
                berthing_time = entry_time + timedelta(hours=wait_hours)
                
            else:  # completed
                # COMPLETED: Both departure and arrival in the past
                days_ago = random.randint(1, 60)
                arrival_time = now - timedelta(days=days_ago)
                departure_time = arrival_time - timedelta(days=travel_days)
                
                # CRITICAL: Calculate backwards from arrival to ensure logical times
                berthing_time = arrival_time - timedelta(hours=random.randint(2, 12))
                entry_time = berthing_time - timedelta(hours=wait_hours)
            
            # Double check: entry_time must be before berthing_time
            if entry_time and berthing_time and entry_time >= berthing_time:
                berthing_time = entry_time + timedelta(hours=wait_hours)
            
            # Create or update voyage
            voyage, created = Voyage.objects.update_or_create(
                vessel=vessel,
                port_from=port_from,
                port_to=port_to,
                departure_time=departure_time,
                defaults={
                    'arrival_time': arrival_time,
                    'entry_time': entry_time,
                    'berthing_time': berthing_time,
                    'status': status
                }
            )
            
            if created or True:  # Always log for verification
                wait = (berthing_time - entry_time).total_seconds() / 3600
                print(f"✅ [{status.upper()}] {vessel.name}: {port_from.name} → {port_to.name}")
                print(f"   Entry: {entry_time.strftime('%Y-%m-%d %H:%M')} | Berthing: {berthing_time.strftime('%Y-%m-%d %H:%M')} | Wait: {wait:.1f}h")
            
            voyages.append(voyage)
        
        return voyages
    
    @staticmethod
    def fix_existing_null_values():
        """
        Fix any existing voyages with NULL entry_time or berthing_time
        """
        print("\n🔧 FIXING EXISTING NULL VALUES...")
        
        voyages_with_nulls = Voyage.objects.filter(
            entry_time__isnull=True
        ) | Voyage.objects.filter(
            berthing_time__isnull=True
        )
        
        fixed_count = 0
        for voyage in voyages_with_nulls:
            wait_hours = random.uniform(6.0, 24.0)
            
            # Calculate times based on status and arrival_time
            if voyage.status == 'completed' and voyage.arrival_time:
                # For completed: work backwards from arrival
                berthing_time = voyage.arrival_time - timedelta(hours=random.randint(2, 12))
                entry_time = berthing_time - timedelta(hours=wait_hours)
            elif voyage.status == 'in_progress':
                # For in progress: entry is recent, berthing is soon
                now = timezone.now()
                entry_time = now - timedelta(hours=random.randint(1, 48))
                berthing_time = entry_time + timedelta(hours=wait_hours)
            else:
                # For scheduled: use future times based on arrival
                if voyage.arrival_time:
                    entry_time = voyage.arrival_time - timedelta(hours=random.randint(12, 48))
                    berthing_time = entry_time + timedelta(hours=wait_hours)
                else:
                    # Fallback to departure time
                    entry_time = voyage.departure_time + timedelta(days=random.randint(10, 25))
                    berthing_time = entry_time + timedelta(hours=wait_hours)
            
            voyage.entry_time = entry_time
            voyage.berthing_time = berthing_time
            voyage.save()
            
            fixed_count += 1
            wait_calc = (berthing_time - entry_time).total_seconds() / 3600
            print(f"   ✓ Fixed: {voyage.vessel.name} [{voyage.status}] - Wait: {wait_calc:.1f}h")
        
        print(f"✅ Fixed {fixed_count} voyages with NULL values\n")
        return fixed_count
    
    @staticmethod
    def generate_all_mock_data():
        """Generate all mock data"""
        print("\n" + "="*70)
        print("🚢 GENERATING MOCK DATA - ZERO NULL VALUES GUARANTEED")
        print("="*70 + "\n")
        
        print("📍 Generating Ports...")
        ports = MockDataGenerator.generate_ports()
        print(f"✅ {len(ports)} ports created\n")
        
        print("🛳️  Generating Voyages...")
        voyages = MockDataGenerator.generate_voyages(15)
        print(f"✅ {len(voyages)} voyages created\n")
        
        print("🔧 Fixing any existing NULL values...")
        fixed = MockDataGenerator.fix_existing_null_values()
        
        print("📊 Calculating Statistics...")
        MockDataGenerator.calculate_port_statistics()
        print("✅ Statistics calculated\n")
        
        # VERIFICATION
        print("="*70)
        print("✅ VERIFICATION - Checking for NULL values")
        print("="*70)
        
        all_voyages = Voyage.objects.all()
        null_entry = all_voyages.filter(entry_time__isnull=True).count()
        null_berthing = all_voyages.filter(berthing_time__isnull=True).count()
        
        print(f"\nTotal Voyages: {all_voyages.count()}")
        print(f"Voyages with NULL entry_time: {null_entry}")
        print(f"Voyages with NULL berthing_time: {null_berthing}")
        
        if null_entry == 0 and null_berthing == 0:
            print("\n🎉 SUCCESS! NO NULL VALUES FOUND!")
        else:
            print(f"\n⚠️  WARNING: {null_entry + null_berthing} NULL values still exist")
            print("Running fix again...")
            MockDataGenerator.fix_existing_null_values()
        
        # Show sample data
        print("\n" + "="*70)
        print("📋 SAMPLE VOYAGE DATA")
        print("="*70)
        for v in Voyage.objects.all()[:5]:
            if v.entry_time and v.berthing_time:
                wait = (v.berthing_time - v.entry_time).total_seconds() / 3600
                print(f"\n{v.vessel.name} [{v.status}]")
                print(f"  Entry:    {v.entry_time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"  Berthing: {v.berthing_time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"  Wait:     {wait:.2f} hours")
            else:
                print(f"\n❌ {v.vessel.name}: STILL HAS NULL VALUES!")
        
        print("\n" + "="*70)
        print(f"Total Ports: {Port.objects.count()}")
        print(f"Total Voyages: {Voyage.objects.count()}")
        print(f"Total Vessels: {Vessel.objects.count()}")
        print("="*70 + "\n")
        
        return {
            'ports': ports,
            'voyages': voyages,
            'fixed_count': fixed,
            'summary': {
                'total_ports': Port.objects.count(),
                'total_voyages': Voyage.objects.count(),
                'total_vessels': Vessel.objects.count(),
                'null_values': null_entry + null_berthing
            }
        }