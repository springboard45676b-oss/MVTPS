from django.db import models
from authentication.models import User

class Vessel(models.Model):
    VESSEL_TYPES = [
        ('cargo', 'Cargo Ship'),
        ('tanker', 'Tanker'),
        ('container', 'Container Ship'),
        ('passenger', 'Passenger Ship'),
        ('fishing', 'Fishing Vessel'),
        ('military', 'Military Vessel'),
        ('other', 'Other'),
    ]
    
    mmsi = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    vessel_type = models.CharField(max_length=20, choices=VESSEL_TYPES)
    flag = models.CharField(max_length=50, blank=True)
    length = models.FloatField(null=True, blank=True)
    width = models.FloatField(null=True, blank=True)
    gross_tonnage = models.IntegerField(null=True, blank=True)
    built_year = models.IntegerField(null=True, blank=True)
    call_sign = models.CharField(max_length=20, blank=True)
    imo_number = models.CharField(max_length=20, blank=True)
    destination = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.mmsi})"

class VesselPosition(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='positions')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    course = models.FloatField(null=True, blank=True)
    heading = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.vessel.name} - {self.timestamp}"

class VesselSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'vessel']
    
    def __str__(self):
        return f"{self.user.username} -> {self.vessel.name}"

class LiveVesselSubscription(models.Model):
    """Subscription for live vessel tracking by MMSI"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='live_vessel_subscriptions')
    mmsi = models.CharField(max_length=20)
    vessel_name = models.CharField(max_length=100, blank=True)
    
    # Notification preferences
    position_updates = models.BooleanField(default=True)
    destination_alerts = models.BooleanField(default=True)
    status_changes = models.BooleanField(default=True)
    
    # Tracking settings
    update_frequency = models.IntegerField(default=5)  # minutes
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'mmsi']
    
    def __str__(self):
        return f"{self.user.username} -> {self.vessel_name or self.mmsi} (Live)"

class RealTimeDataSubscription(models.Model):
    """Subscription for real-time AIS data updates"""
    SUBSCRIPTION_TYPES = [
        ('global', 'Global Coverage'),
        ('region', 'Regional Coverage'),
        ('vessel_specific', 'Specific Vessels'),
    ]
    
    NOTIFICATION_TYPES = [
        ('position_update', 'Position Updates'),
        ('status_change', 'Status Changes'),
        ('port_arrival', 'Port Arrivals'),
        ('port_departure', 'Port Departures'),
        ('emergency', 'Emergency Alerts'),
        ('all', 'All Updates'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='realtime_subscriptions')
    subscription_type = models.CharField(max_length=20, choices=SUBSCRIPTION_TYPES, default='global')
    notification_types = models.JSONField(default=list)  # List of notification types
    
    # Regional bounds (for region type)
    min_latitude = models.FloatField(null=True, blank=True)
    max_latitude = models.FloatField(null=True, blank=True)
    min_longitude = models.FloatField(null=True, blank=True)
    max_longitude = models.FloatField(null=True, blank=True)
    
    # Specific vessels (for vessel_specific type)
    vessels = models.ManyToManyField(Vessel, blank=True)
    
    # Notification settings
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Update frequency (minutes)
    update_frequency = models.IntegerField(default=5)  # 5 minutes
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.subscription_type} subscription"
    
    def get_notification_types_display(self):
        """Get human-readable notification types"""
        type_map = dict(self.NOTIFICATION_TYPES)
        return [type_map.get(nt, nt) for nt in self.notification_types]

class Voyage(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='vessel_voyages')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    
    start_latitude = models.FloatField()
    start_longitude = models.FloatField()
    end_latitude = models.FloatField(null=True, blank=True)
    end_longitude = models.FloatField(null=True, blank=True)
    
    start_port = models.CharField(max_length=100, blank=True)
    end_port = models.CharField(max_length=100, blank=True)
    
    distance_km = models.FloatField(null=True, blank=True)
    duration_hours = models.FloatField(null=True, blank=True)
    average_speed = models.FloatField(null=True, blank=True)  # knots
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        end_info = f" to {self.end_port}" if self.end_port else " (ongoing)"
        return f"{self.vessel.name}: {self.start_port}{end_info}"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def duration_display(self):
        if self.duration_hours:
            days = int(self.duration_hours // 24)
            hours = int(self.duration_hours % 24)
            if days > 0:
                return f"{days}d {hours}h"
            return f"{hours}h"
        return "Ongoing"