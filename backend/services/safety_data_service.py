from datetime import datetime, timedelta
from django.utils import timezone
from safety.models import WeatherAlert, PiracyZone, MaritimeAccident

class SafetyDataService:
    """Service to generate mock safety data for testing"""
    
    @staticmethod
    def generate_weather_alerts():
        """Generate mock weather alerts"""
        alerts = [
            {
                'storm_type': 'Tropical Cyclone',
                'severity': 'high',
                'affected_area': 'Bay of Bengal',
                'latitude': 15.0,
                'longitude': 88.0,
                'radius_km': 250,
                'wind_speed': 85,
                'description': 'Severe tropical cyclone with sustained winds of 85 knots',
                'start_time': timezone.now(),
                'is_active': True
            },
            {
                'storm_type': 'Hurricane',
                'severity': 'critical',
                'affected_area': 'Gulf of Mexico',
                'latitude': 25.5,
                'longitude': -90.0,
                'radius_km': 400,
                'wind_speed': 120,
                'description': 'Category 4 hurricane approaching coastal areas',
                'start_time': timezone.now() - timedelta(hours=6),
                'is_active': True
            },
            {
                'storm_type': 'Storm',
                'severity': 'medium',
                'affected_area': 'North Atlantic',
                'latitude': 45.0,
                'longitude': -30.0,
                'radius_km': 150,
                'wind_speed': 45,
                'description': 'Moderate storm with rough seas',
                'start_time': timezone.now() - timedelta(hours=12),
                'is_active': True
            }
        ]
        
        created = []
        for alert_data in alerts:
            alert, _ = WeatherAlert.objects.get_or_create(
                storm_type=alert_data['storm_type'],
                affected_area=alert_data['affected_area'],
                defaults=alert_data
            )
            created.append(alert)
        
        return created
    
    @staticmethod
    def generate_piracy_zones():
        """Generate mock piracy zones"""
        zones = [
            {
                'zone_name': 'Gulf of Aden',
                'risk_level': 'high',
                'description': 'High piracy activity near Somali coast',
                'coordinates': [
                    [12.0, 43.0], [12.0, 51.0], [15.0, 51.0], [15.0, 43.0], [12.0, 43.0]
                ],
                'incident_count': 45,
                'last_incident_date': timezone.now().date() - timedelta(days=15),
                'is_active': True
            },
            {
                'zone_name': 'Strait of Malacca',
                'risk_level': 'medium',
                'description': 'Moderate piracy risk in narrow shipping lane',
                'coordinates': [
                    [1.0, 100.0], [1.0, 104.0], [6.0, 104.0], [6.0, 100.0], [1.0, 100.0]
                ],
                'incident_count': 28,
                'last_incident_date': timezone.now().date() - timedelta(days=30),
                'is_active': True
            },
            {
                'zone_name': 'Gulf of Guinea',
                'risk_level': 'high',
                'description': 'Significant piracy and armed robbery incidents',
                'coordinates': [
                    [-5.0, -5.0], [-5.0, 10.0], [5.0, 10.0], [5.0, -5.0], [-5.0, -5.0]
                ],
                'incident_count': 62,
                'last_incident_date': timezone.now().date() - timedelta(days=8),
                'is_active': True
            },
            {
                'zone_name': 'South China Sea',
                'risk_level': 'low',
                'description': 'Low to moderate risk area',
                'coordinates': [
                    [5.0, 105.0], [5.0, 120.0], [20.0, 120.0], [20.0, 105.0], [5.0, 105.0]
                ],
                'incident_count': 12,
                'last_incident_date': timezone.now().date() - timedelta(days=90),
                'is_active': True
            }
        ]
        
        created = []
        for zone_data in zones:
            zone, _ = PiracyZone.objects.get_or_create(
                zone_name=zone_data['zone_name'],
                defaults=zone_data
            )
            created.append(zone)
        
        return created
    
    @staticmethod
    def generate_maritime_accidents():
        """Generate mock maritime accident data"""
        accidents = [
            {
                'accident_type': 'collision',
                'severity': 'severe',
                'vessel_name': 'MV Ocean Star',
                'vessel_imo': 'IMO9234567',
                'latitude': 35.5,
                'longitude': 139.7,
                'accident_date': timezone.now() - timedelta(days=45),
                'description': 'Collision with cargo vessel in dense fog',
                'casualties': 3,
                'environmental_impact': False
            },
            {
                'accident_type': 'grounding',
                'severity': 'moderate',
                'vessel_name': 'SS Pacific Trader',
                'vessel_imo': 'IMO9345678',
                'latitude': 1.3,
                'longitude': 103.8,
                'accident_date': timezone.now() - timedelta(days=120),
                'description': 'Vessel ran aground due to navigation error',
                'casualties': 0,
                'environmental_impact': True
            },
            {
                'accident_type': 'fire',
                'severity': 'catastrophic',
                'vessel_name': 'MV Flame Runner',
                'vessel_imo': 'IMO9456789',
                'latitude': 25.2,
                'longitude': -80.3,
                'accident_date': timezone.now() - timedelta(days=200),
                'description': 'Engine room fire spread to cargo hold',
                'casualties': 12,
                'environmental_impact': True
            },
            {
                'accident_type': 'sinking',
                'severity': 'catastrophic',
                'vessel_name': 'SS Deep Blue',
                'vessel_imo': 'IMO9567890',
                'latitude': 40.7,
                'longitude': -74.0,
                'accident_date': timezone.now() - timedelta(days=365),
                'description': 'Vessel sank in severe storm conditions',
                'casualties': 8,
                'environmental_impact': True
            },
            {
                'accident_type': 'piracy',
                'severity': 'severe',
                'vessel_name': 'MV Merchant Hope',
                'vessel_imo': 'IMO9678901',
                'latitude': 12.5,
                'longitude': 45.0,
                'accident_date': timezone.now() - timedelta(days=90),
                'description': 'Armed piracy attack, crew held hostage',
                'casualties': 2,
                'environmental_impact': False
            }
        ]
        
        created = []
        for accident_data in accidents:
            accident, _ = MaritimeAccident.objects.get_or_create(
                vessel_imo=accident_data['vessel_imo'],
                accident_date=accident_data['accident_date'],
                defaults=accident_data
            )
            created.append(accident)
        
        return created
    
    @staticmethod
    def populate_all():
        """Populate all safety data"""
        weather = SafetyDataService.generate_weather_alerts()
        piracy = SafetyDataService.generate_piracy_zones()
        accidents = SafetyDataService.generate_maritime_accidents()
        
        return {
            'weather_alerts': len(weather),
            'piracy_zones': len(piracy),
            'accidents': len(accidents)
        }
