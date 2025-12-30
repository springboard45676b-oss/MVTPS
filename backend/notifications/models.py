from django.db import models
from authentication.models import User
from vessels.models import Vessel

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('position_update', 'Position Update'),
        ('status_change', 'Status Change'),
        ('port_arrival', 'Port Arrival'),
        ('port_departure', 'Port Departure'),
        ('speed_change', 'Speed Change'),
        ('course_change', 'Course Change'),
        ('emergency', 'Emergency Alert'),
        ('maintenance', 'Maintenance Alert'),
        ('weather_warning', 'Weather Warning'),
        ('subscription', 'Subscription Update'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Additional data as JSON
    data = models.JSONField(default=dict, blank=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['vessel', 'notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class NotificationPreference(models.Model):
    """User preferences for different types of notifications"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email notifications
    email_position_updates = models.BooleanField(default=False)
    email_status_changes = models.BooleanField(default=True)
    email_port_activities = models.BooleanField(default=True)
    email_emergencies = models.BooleanField(default=True)
    email_weather_warnings = models.BooleanField(default=True)
    
    # In-app notifications
    app_position_updates = models.BooleanField(default=True)
    app_status_changes = models.BooleanField(default=True)
    app_port_activities = models.BooleanField(default=True)
    app_emergencies = models.BooleanField(default=True)
    app_weather_warnings = models.BooleanField(default=True)
    
    # Notification frequency
    position_update_frequency = models.IntegerField(default=60)  # minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Notification Preferences"