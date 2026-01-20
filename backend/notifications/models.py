from django.db import models
from django.utils import timezone

class Notification(models.Model):
    """
    Real-time notifications for maritime events
    """
    NOTIFICATION_TYPES = [
        ('ais_event', 'AIS Event'),
        ('speed_alert', 'Speed Alert'),
        ('congestion', 'Port Congestion'),
        ('safety_alert', 'Safety Alert'),
        ('vessel_status', 'Vessel Status'),
        ('system', 'System Notification'),
    ]
    
    SEVERITY_LEVELS = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    # Core fields
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='info')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Relationships - using string references to avoid circular imports
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    vessel = models.ForeignKey('vessels.Vessel', on_delete=models.CASCADE, null=True, blank=True)
    port = models.ForeignKey('ports.Port', on_delete=models.CASCADE, null=True, blank=True)
    
    # Metadata
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
            models.Index(fields=['notification_type', 'severity']),
            models.Index(fields=['vessel', '-created_at']),
            models.Index(fields=['port', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

class NotificationService:
    """
    Service for creating and managing notifications
    """
    
    @staticmethod
    def create_ais_event_notification(vessel, event_type, data=None):
        """Create notification for AIS events"""
        severity_map = {
            'speed_violation': 'error',
            'navigation_change': 'warning',
            'signal_lost': 'error',
            'signal_restored': 'info'
        }
        
        title_map = {
            'speed_violation': f'Speed Violation - {vessel.vessel_name}',
            'navigation_change': f'Navigation Status Changed - {vessel.vessel_name}',
            'signal_lost': f'AIS Signal Lost - {vessel.vessel_name}',
            'signal_restored': f'AIS Signal Restored - {vessel.vessel_name}'
        }
        
        message_map = {
            'speed_violation': f'Vessel {vessel.vessel_name} (MMSI: {vessel.mmsi}) is exceeding speed limits',
            'navigation_change': f'Vessel {vessel.vessel_name} changed navigation status',
            'signal_lost': f'Vessel {vessel.vessel_name} has not transmitted AIS data recently',
            'signal_restored': f'Vessel {vessel.vessel_name} AIS transmission restored'
        }
        
        return Notification.objects.create(
            notification_type='ais_event',
            severity=severity_map.get(event_type, 'info'),
            title=title_map.get(event_type, f'AIS Event - {vessel.vessel_name}'),
            message=message_map.get(event_type, f'AIS event for vessel {vessel.vessel_name}'),
            vessel=vessel,
            data=data or {}
        )
    
    @staticmethod
    def create_congestion_notification(port, vessel_count, severity='warning'):
        """Create notification for port congestion"""
        return Notification.objects.create(
            notification_type='congestion',
            severity=severity,
            title=f'Port Congestion Alert - {port.name}',
            message=f'Port {port.name} has {vessel_count} vessels in area. Traffic management recommended.',
            port=port,
            data={'vessel_count': vessel_count}
        )
    
    @staticmethod
    def create_safety_alert_notification(alert_type, vessel=None, port=None, message='', severity='warning', data=None):
        """Create notification for safety alerts"""
        return Notification.objects.create(
            notification_type='safety_alert',
            severity=severity,
            title=f'Safety Alert - {alert_type.replace("_", " ").title()}',
            message=message,
            vessel=vessel,
            port=port,
            data=data or {}
        )
    
    @staticmethod
    def create_system_notification(title, message, severity='info', data=None):
        """Create system-wide notification"""
        return Notification.objects.create(
            notification_type='system',
            severity=severity,
            title=title,
            message=message,
            data=data or {}
        )
