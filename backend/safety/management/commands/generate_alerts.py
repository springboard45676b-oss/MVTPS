from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from safety.models import Alert
from vessels.models import Vessel
from ports.models import Port

class Command(BaseCommand):
    help = 'Generate mock safety alerts'

    def handle(self, *args, **kwargs):
        Alert.objects.all().delete()
        
        vessels = list(Vessel.objects.all()[:5])
        ports = list(Port.objects.all()[:3])
        
        alerts = [
            {
                'alert_type': 'speed',
                'severity': 'high',
                'status': 'active',
                'title': 'Excessive Speed Detected',
                'message': 'Vessel exceeding safe speed limit in congested area',
                'vessel': vessels[0] if vessels else None,
            },
            {
                'alert_type': 'ais_silence',
                'severity': 'critical',
                'status': 'active',
                'title': 'AIS Signal Lost',
                'message': 'No AIS transmission received for over 2 hours',
                'vessel': vessels[1] if len(vessels) > 1 else None,
            },
            {
                'alert_type': 'congestion',
                'severity': 'medium',
                'status': 'acknowledged',
                'title': 'Port Congestion Alert',
                'message': 'High vessel density detected near port',
                'port': ports[0] if ports else None,
            },
            {
                'alert_type': 'weather',
                'severity': 'high',
                'status': 'active',
                'title': 'Storm Warning',
                'message': 'Tropical storm approaching shipping lane',
            },
            {
                'alert_type': 'collision',
                'severity': 'critical',
                'status': 'active',
                'title': 'Collision Risk',
                'message': 'Two vessels on collision course',
                'vessel': vessels[2] if len(vessels) > 2 else None,
            },
        ]
        
        for alert_data in alerts:
            Alert.objects.create(**alert_data)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(alerts)} alerts'))
