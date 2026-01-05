# server/core/mock_data_generator.py - WITH ACCIDENT HISTORY

from django.utils import timezone
from datetime import datetime, timedelta
import random
from .models import Port, Voyage, Vessel, PiracyZone, Country

class MockDataGenerator:
    """
    Generate realistic mock data for Countries, Ports, Voyages, and Piracy Zones
    NOW INCLUDES: Accident history in piracy zones
    """
    
    COUNTRIES_DATA = [
        # Asia
        {'name': 'China', 'latitude': 31.2304, 'longitude': 121.4737, 'continent': 'Asia'},
        {'name': 'Japan', 'latitude': 35.6762, 'longitude': 139.6503, 'continent': 'Asia'},
        {'name': 'Singapore', 'latitude': 1.3521, 'longitude': 103.8198, 'continent': 'Asia'},
        {'name': 'South Korea', 'latitude': 35.1796, 'longitude': 129.0756, 'continent': 'Asia'},
        {'name': 'India', 'latitude': 18.9400, 'longitude': 72.8350, 'continent': 'Asia'},
        {'name': 'Hong Kong', 'latitude': 22.3193, 'longitude': 114.1694, 'continent': 'Asia'},
        
        # Europe
        {'name': 'Germany', 'latitude': 53.5511, 'longitude': 9.9937, 'continent': 'Europe'},
        {'name': 'Greece', 'latitude': 37.9838, 'longitude': 23.7275, 'continent': 'Europe'},
        {'name': 'Netherlands', 'latitude': 51.9225, 'longitude': 4.4792, 'continent': 'Europe'},
        {'name': 'UK', 'latitude': 51.5074, 'longitude': -0.1278, 'continent': 'Europe'},
        {'name': 'Norway', 'latitude': 59.9139, 'longitude': 10.7522, 'continent': 'Europe'},
        {'name': 'Italy', 'latitude': 40.8518, 'longitude': 14.2681, 'continent': 'Europe'},
        {'name': 'France', 'latitude': 43.2965, 'longitude': 5.3698, 'continent': 'Europe'},
        {'name': 'Malta', 'latitude': 35.8989, 'longitude': 14.5146, 'continent': 'Europe'},
        {'name': 'Cyprus', 'latitude': 34.9171, 'longitude': 33.6240, 'continent': 'Europe'},
        {'name': 'Belgium', 'latitude': 51.2993, 'longitude': 4.4668, 'continent': 'Europe'},
        
        # Americas
        {'name': 'USA', 'latitude': 40.7128, 'longitude': -74.0060, 'continent': 'Americas'},
        {'name': 'Canada', 'latitude': 49.2827, 'longitude': -123.1207, 'continent': 'Americas'},
        {'name': 'Panama', 'latitude': 8.9824, 'longitude': -79.5199, 'continent': 'Americas'},
        {'name': 'Bahamas', 'latitude': 25.0343, 'longitude': -77.3963, 'continent': 'Americas'},
        {'name': 'Mexico', 'latitude': 19.4326, 'longitude': -99.1332, 'continent': 'Americas'},
        {'name': 'Brazil', 'latitude': -22.9068, 'longitude': -43.1729, 'continent': 'Americas'},
        
        # Africa
        {'name': 'Liberia', 'latitude': 6.3156, 'longitude': -10.8074, 'continent': 'Africa'},
        {'name': 'South Africa', 'latitude': -33.9249, 'longitude': 18.4241, 'continent': 'Africa'},
        {'name': 'Egypt', 'latitude': 30.0444, 'longitude': 31.2357, 'continent': 'Africa'},
        
        # Middle East
        {'name': 'UAE', 'latitude': 25.0657, 'longitude': 55.1371, 'continent': 'Middle East'},
        
        # Asia (additional)
        {'name': 'Sri Lanka', 'latitude': 6.9271, 'longitude': 79.8612, 'continent': 'Asia'},
        
        # Oceania
        {'name': 'Marshall Islands', 'latitude': 7.1315, 'longitude': 171.1845, 'continent': 'Oceania'},
        {'name': 'Australia', 'latitude': -33.8688, 'longitude': 151.2093, 'continent': 'Oceania'},
        {'name': 'New Zealand', 'latitude': -36.8485, 'longitude': 174.7633, 'continent': 'Oceania'},
    ]
    
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
    
    PIRACY_ZONES_DATA = [
        {
            'name': 'Strait of Malacca',
            'latitude': 2.5,
            'longitude': 101.5,
            'risk_level': 'high',
            'incidents_90_days': 12,
            'radius_km': 250,
            'description': 'Strategic chokepoint between Malaysia and Indonesia. Regular piracy incidents reported.',
            # ACCIDENT HISTORY
            'total_accidents': 34,
            'accident_types': {'collision': 18, 'grounding': 8, 'fire': 5, 'piracy_attack': 3},
            'casualties': 47,
            'vessels_lost': 2,
            'accident_description': 'Recent collision between cargo vessels in heavy fog'
        },
        {
            'name': 'Gulf of Aden',
            'latitude': 12.0,
            'longitude': 48.0,
            'risk_level': 'critical',
            'incidents_90_days': 28,
            'radius_km': 300,
            'description': 'Critical shipping lane between Red Sea and Arabian Sea. Highest piracy activity globally.',
            # ACCIDENT HISTORY
            'total_accidents': 67,
            'accident_types': {'piracy_attack': 35, 'collision': 15, 'equipment_failure': 10, 'fire': 7},
            'casualties': 124,
            'vessels_lost': 5,
            'accident_description': 'Armed piracy attack on oil tanker, crew held hostage'
        },
        {
            'name': 'Gulf of Guinea',
            'latitude': 3.0,
            'longitude': 10.0,
            'risk_level': 'high',
            'incidents_90_days': 18,
            'radius_km': 200,
            'description': 'West African waters off Nigeria and Ghana. Significant piracy and armed robbery.',
            # ACCIDENT HISTORY
            'total_accidents': 52,
            'accident_types': {'piracy_attack': 25, 'collision': 12, 'fire': 8, 'oil_spill': 7},
            'casualties': 89,
            'vessels_lost': 3,
            'accident_description': 'Oil spill from damaged tanker after piracy attack'
        },
        {
            'name': 'Sulu-Celebes Sea',
            'latitude': 6.0,
            'longitude': 121.0,
            'risk_level': 'moderate',
            'incidents_90_days': 8,
            'radius_km': 180,
            'description': 'Waters between Philippines, Malaysia, Indonesia. Piracy and kidnapping incidents.',
            # ACCIDENT HISTORY
            'total_accidents': 23,
            'accident_types': {'piracy_attack': 10, 'grounding': 7, 'collision': 4, 'equipment_failure': 2},
            'casualties': 31,
            'vessels_lost': 1,
            'accident_description': 'Kidnapping of crew members by armed group'
        },
        {
            'name': 'Bay of Bengal',
            'latitude': 10.0,
            'longitude': 88.0,
            'risk_level': 'moderate',
            'incidents_90_days': 6,
            'radius_km': 150,
            'description': 'Waters off Bangladesh, India, Myanmar. Armed robbery incidents increasing.',
            # ACCIDENT HISTORY
            'total_accidents': 28,
            'accident_types': {'collision': 12, 'grounding': 8, 'equipment_failure': 5, 'piracy_attack': 3},
            'casualties': 19,
            'vessels_lost': 0,
            'accident_description': 'Vessel grounding during monsoon season'
        },
        {
            'name': 'South China Sea',
            'latitude': 10.5,
            'longitude': 113.0,
            'risk_level': 'moderate',
            'incidents_90_days': 9,
            'radius_km': 200,
            'description': 'Disputed waters with regional tensions. Piracy and armed robbery regularly reported.',
            # ACCIDENT HISTORY
            'total_accidents': 41,
            'accident_types': {'collision': 20, 'piracy_attack': 10, 'grounding': 6, 'fire': 5},
            'casualties': 56,
            'vessels_lost': 2,
            'accident_description': 'Collision between fishing vessel and cargo ship'
        },
        {
            'name': 'West Indian Ocean',
            'latitude': -5.0,
            'longitude': 50.0,
            'risk_level': 'high',
            'incidents_90_days': 14,
            'radius_km': 250,
            'description': 'East African waters. Somali piracy activity extends to Mozambique Channel.',
            # ACCIDENT HISTORY
            'total_accidents': 38,
            'accident_types': {'piracy_attack': 18, 'equipment_failure': 10, 'collision': 7, 'fire': 3},
            'casualties': 72,
            'vessels_lost': 4,
            'accident_description': 'Engine failure stranded vessel in piracy-prone waters'
        },
        {
            'name': 'Gulf of Mexico',
            'latitude': 24.0,
            'longitude': -91.0,
            'risk_level': 'low',
            'incidents_90_days': 2,
            'radius_km': 100,
            'description': 'Oil and gas platform areas. Occasional theft and criminal activity.',
            # ACCIDENT HISTORY
            'total_accidents': 15,
            'accident_types': {'collision': 7, 'equipment_failure': 4, 'fire': 2, 'oil_spill': 2},
            'casualties': 8,
            'vessels_lost': 0,
            'accident_description': 'Minor collision near offshore oil platform'
        },
    ]
    
    @staticmethod
    def generate_countries():
        """Generate country location data"""
        countries = []
        
        for country_data in MockDataGenerator.COUNTRIES_DATA:
            country, created = Country.objects.get_or_create(
                name=country_data['name'],
                defaults={
                    'latitude': country_data['latitude'],
                    'longitude': country_data['longitude'],
                    'continent': country_data['continent']
                }
            )
            
            if created:
                print(f"✅ Created country: {country.name} ({country.continent})")
            else:
                print(f"ℹ️  Country already exists: {country.name}")
            
            countries.append(country)
        
        return countries
    
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
            else:
                print(f"ℹ️  Port already exists: {port.name}")
            
            ports.append(port)
        
        return ports
    
    @staticmethod
    def generate_piracy_zones():
        """Generate piracy zones with accident history"""
        piracy_zones = []
        now = timezone.now()
        
        for zone_data in MockDataGenerator.PIRACY_ZONES_DATA:
            # Random dates for incidents and accidents
            incident_days_ago = random.randint(1, 90)
            last_incident_date = (now - timedelta(days=incident_days_ago)).date()
            
            accident_days_ago = random.randint(1, 180)
            last_accident_date = (now - timedelta(days=accident_days_ago)).date()
            
            zone, created = PiracyZone.objects.update_or_create(
                name=zone_data['name'],
                defaults={
                    'latitude': zone_data['latitude'],
                    'longitude': zone_data['longitude'],
                    'risk_level': zone_data['risk_level'],
                    'incidents_90_days': zone_data['incidents_90_days'],
                    'radius_km': zone_data['radius_km'],
                    'description': zone_data['description'],
                    'last_incident_date': last_incident_date,
                    
                    # ACCIDENT HISTORY FIELDS
                    'total_accidents': zone_data.get('total_accidents', 0),
                    'accident_types': zone_data.get('accident_types', {}),
                    'casualties': zone_data.get('casualties', 0),
                    'vessels_lost': zone_data.get('vessels_lost', 0),
                    'last_accident_date': last_accident_date,
                    'accident_description': zone_data.get('accident_description', ''),
                    
                    'is_active': True,
                    'updated_at': now
                }
            )
            
            risk_icon = {
                'critical': '🚨',
                'high': '⚠️',
                'moderate': '⚡',
                'low': '📍'
            }
            icon = risk_icon.get(zone_data['risk_level'], '📍')
            
            if created:
                print(f"✅ Created piracy zone: {icon} {zone.name} ({zone.risk_level.upper()})")
            else:
                print(f"🔄 Updated piracy zone: {icon} {zone.name} ({zone.risk_level.upper()})")
            
            print(f"   Piracy: {zone.incidents_90_days} incidents | Accidents: {zone.total_accidents} | Casualties: {zone.casualties}")
            
            piracy_zones.append(zone)
        
        return piracy_zones
    
    @staticmethod
    def calculate_port_statistics():
        """Calculate port statistics"""
        ports = Port.objects.all()
        
        for port in ports:
            arrivals_count = Voyage.objects.filter(port_to=port).count()
            departures_count = Voyage.objects.filter(port_from=port).count()
            
            all_arrivals = Voyage.objects.filter(port_to=port)
            
            wait_times = []
            for voyage in all_arrivals:
                if voyage.entry_time and voyage.berthing_time:
                    wait_delta = voyage.berthing_time - voyage.entry_time
                    wait_hours = wait_delta.total_seconds() / 3600
                    if wait_hours > 0:
                        wait_times.append(wait_hours)
            
            if wait_times:
                avg_wait_time = sum(wait_times) / len(wait_times)
            else:
                avg_wait_time = random.uniform(8.0, 18.0)
            
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
        """Generate voyages with proper times"""
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
            
            rand = random.random()
            if rand < 0.4:
                status = 'completed'
            elif rand < 0.7:
                status = 'in_progress'
            else:
                status = 'scheduled'
            
            travel_days = random.randint(10, 30)
            wait_hours = random.uniform(6.0, 24.0)
            
            if status == 'scheduled':
                days_ahead = random.randint(1, 30)
                departure_time = now + timedelta(days=days_ahead)
                arrival_time = departure_time + timedelta(days=travel_days)
                entry_time = arrival_time - timedelta(hours=random.randint(12, 48))
                berthing_time = entry_time + timedelta(hours=wait_hours)
                
            elif status == 'in_progress':
                days_ago = random.randint(1, 15)
                departure_time = now - timedelta(days=days_ago)
                arrival_time = departure_time + timedelta(days=travel_days)
                entry_time = now - timedelta(hours=random.randint(1, 48))
                berthing_time = entry_time + timedelta(hours=wait_hours)
                
            else:
                days_ago = random.randint(1, 60)
                arrival_time = now - timedelta(days=days_ago)
                departure_time = arrival_time - timedelta(days=travel_days)
                berthing_time = arrival_time - timedelta(hours=random.randint(2, 12))
                entry_time = berthing_time - timedelta(hours=wait_hours)
            
            if entry_time and berthing_time and entry_time >= berthing_time:
                berthing_time = entry_time + timedelta(hours=wait_hours)
            
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
            
            wait = (berthing_time - entry_time).total_seconds() / 3600
            action = "✅ Created" if created else "🔄 Updated"
            print(f"{action} [{status.upper()}] {vessel.name}: {port_from.name} → {port_to.name}")
            print(f"   Wait: {wait:.1f}h")
            
            voyages.append(voyage)
        
        return voyages
    
    @staticmethod
    def generate_all_mock_data():
        """Generate all mock data"""
        print("\n" + "="*70)
        print("🚢 GENERATING COMPLETE MOCK DATA WITH ACCIDENT HISTORY")
        print("="*70 + "\n")
        
        print("🌍 Generating Countries...")
        countries = MockDataGenerator.generate_countries()
        print(f"✅ {len(countries)} countries\n")
        
        print("📍 Generating Ports...")
        ports = MockDataGenerator.generate_ports()
        print(f"✅ {len(ports)} ports\n")
        
        print("🚨 Generating Piracy Zones with Accident History...")
        piracy_zones = MockDataGenerator.generate_piracy_zones()
        print(f"✅ {len(piracy_zones)} piracy zones\n")
        
        print("🛳️  Generating Voyages...")
        voyages = MockDataGenerator.generate_voyages(15)
        print(f"✅ {len(voyages)} voyages\n")
        
        print("📊 Calculating Port Statistics...")
        MockDataGenerator.calculate_port_statistics()
        print("✅ Statistics calculated\n")
        
        print("="*70)
        print("📊 FINAL SUMMARY")
        print("="*70)
        print(f"Countries:     {Country.objects.count()}")
        print(f"Ports:         {Port.objects.count()}")
        print(f"Voyages:       {Voyage.objects.count()}")
        print(f"Vessels:       {Vessel.objects.count()}")
        print(f"Piracy Zones:  {PiracyZone.objects.count()}")
        print("="*70 + "\n")
        
        return {
            'countries': countries,
            'ports': ports,
            'voyages': voyages,
            'piracy_zones': piracy_zones
        }