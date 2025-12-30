from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from authentication.models import User
from vessels.models import Vessel
from notifications.services import notification_service

class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of sample notifications to create',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Get users and vessels
        users = list(User.objects.all())
        vessels = list(Vessel.objects.all())
        
        if not users:
            self.stdout.write(
                self.style.ERROR('No users found. Please create users first.')
            )
            return
        
        if not vessels:
            self.stdout.write(
                self.style.ERROR('No vessels found. Please add vessels first.')
            )
            return
        
        notification_types = [
            ('position_update', 'Position Update'),
            ('status_change', 'Status Change'),
            ('port_arrival', 'Port Arrival'),
            ('port_departure', 'Port Departure'),
            ('speed_change', 'Speed Change'),
            ('course_change', 'Course Change'),
            ('emergency', 'Emergency Alert'),
            ('maintenance', 'Maintenance Alert'),
            ('weather_warning', 'Weather Warning'),
        ]
        
        priorities = ['low', 'medium', 'high', 'critical']
        
        sample_messages = {
            'position_update': [
                "Vessel has moved {distance} km from previous position.",
                "Position updated: Current speed {speed} knots.",
                "Vessel location changed significantly."
            ],
            'status_change': [
                "Vessel status changed from '{old_status}' to '{new_status}'",
                "Status update: Vessel is now {status}",
                "Important status change detected"
            ],
            'port_arrival': [
                "Vessel has arrived at {port} port",
                "Arrival confirmed at {port}",
                "Vessel docked at {port} successfully"
            ],
            'port_departure': [
                "Vessel has departed from {port} port",
                "Departure confirmed from {port}",
                "Vessel left {port} and is underway"
            ],
            'speed_change': [
                "Speed changed from {old_speed} to {new_speed} knots",
                "Significant speed change detected",
                "Vessel speed alert: {speed} knots"
            ],
            'course_change': [
                "Course changed from {old_course}° to {new_course}°",
                "Navigation update: New heading {course}°",
                "Course correction detected"
            ],
            'emergency': [
                "🚨 EMERGENCY: Distress signal received",
                "🚨 URGENT: Emergency situation reported",
                "🚨 CRITICAL: Immediate assistance required"
            ],
            'maintenance': [
                "Scheduled maintenance reminder",
                "Maintenance alert: Engine inspection due",
                "Equipment maintenance required"
            ],
            'weather_warning': [
                "⚠️ Weather warning: Storm approaching",
                "⚠️ Severe weather alert in your area",
                "⚠️ Navigation warning: High winds expected"
            ]
        }
        
        ports = ['Singapore', 'Rotterdam', 'Shanghai', 'Los Angeles', 'Hamburg', 'Antwerp']
        statuses = ['At anchor', 'Underway', 'Moored', 'In port', 'Emergency']
        
        created_count = 0
        
        for i in range(count):
            user = random.choice(users)
            vessel = random.choice(vessels)
            notification_type, type_name = random.choice(notification_types)
            priority = random.choice(priorities)
            
            # Make emergency notifications more likely to be critical
            if notification_type == 'emergency':
                priority = random.choice(['high', 'critical', 'critical'])
            elif notification_type in ['weather_warning', 'maintenance']:
                priority = random.choice(['medium', 'high'])
            
            # Generate title and message
            title = f"{vessel.name} - {type_name}"
            messages = sample_messages[notification_type]
            message = random.choice(messages)
            
            # Add dynamic data based on notification type
            data = {}
            if notification_type == 'position_update':
                distance = round(random.uniform(1, 50), 1)
                speed = round(random.uniform(0, 25), 1)
                message = message.format(distance=distance, speed=speed)
                data = {
                    'distance_moved': distance,
                    'speed': speed,
                    'latitude': round(random.uniform(-90, 90), 6),
                    'longitude': round(random.uniform(-180, 180), 6)
                }
            elif notification_type == 'status_change':
                old_status = random.choice(statuses)
                new_status = random.choice([s for s in statuses if s != old_status])
                message = message.format(old_status=old_status, new_status=new_status, status=new_status)
                data = {'old_status': old_status, 'new_status': new_status}
            elif notification_type in ['port_arrival', 'port_departure']:
                port = random.choice(ports)
                message = message.format(port=port)
                data = {'port_name': port}
            elif notification_type == 'speed_change':
                old_speed = round(random.uniform(0, 20), 1)
                new_speed = round(random.uniform(0, 25), 1)
                message = message.format(old_speed=old_speed, new_speed=new_speed, speed=new_speed)
                data = {'old_speed': old_speed, 'new_speed': new_speed}
            elif notification_type == 'course_change':
                old_course = random.randint(0, 359)
                new_course = random.randint(0, 359)
                message = message.format(old_course=old_course, new_course=new_course, course=new_course)
                data = {'old_course': old_course, 'new_course': new_course}
            
            # Create notification
            notification = notification_service.create_notification(
                user=user,
                vessel=vessel,
                notification_type=notification_type,
                title=title,
                message=message,
                priority=priority,
                data=data
            )
            
            if notification:
                created_count += 1
                
                # Randomly mark some as read
                if random.random() < 0.3:  # 30% chance to be read
                    notification.is_read = True
                    notification.read_at = timezone.now() - timedelta(
                        minutes=random.randint(1, 1440)
                    )
                    notification.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} sample notifications'
            )
        )
        
        # Show summary
        from notifications.models import Notification
        total = Notification.objects.count()
        unread = Notification.objects.filter(is_read=False).count()
        
        self.stdout.write(f'Total notifications in database: {total}')
        self.stdout.write(f'Unread notifications: {unread}')