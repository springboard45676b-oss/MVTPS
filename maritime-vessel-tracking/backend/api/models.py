"""
Database Models for Maritime Vessel Tracking Platform.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Custom User model with role-based access."""
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('analyst', 'Analyst'),
        ('operator', 'Operator'),
        ('insurer', 'Insurer'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operator')
    company = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Vessel(models.Model):
    """Vessel information and real-time tracking data."""
    
    TYPE_CHOICES = [
        ('cargo', 'Cargo Ship'),
        ('tanker', 'Tanker'),
        ('passenger', 'Passenger Ship'),
        ('fishing', 'Fishing Vessel'),
        ('military', 'Military'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('sailing', 'Sailing'),
        ('anchored', 'Anchored'),
        ('docked', 'Docked'),
        ('maintenance', 'Under Maintenance'),
    ]
    
    imo_number = models.CharField(max_length=20, unique=True)
    mmsi = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    vessel_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    flag = models.CharField(max_length=100)
    flag_code = models.CharField(max_length=5, blank=True)
    cargo_type = models.CharField(max_length=100, blank=True)
    
    # Dimensions
    length = models.FloatField(null=True, blank=True)
    width = models.FloatField(null=True, blank=True)
    draft = models.FloatField(null=True, blank=True)
    gross_tonnage = models.FloatField(null=True, blank=True)
    
    # Real-time position
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    speed = models.FloatField(default=0)  # in knots
    heading = models.FloatField(default=0)  # in degrees
    course = models.FloatField(default=0)  # in degrees
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sailing')
    destination = models.CharField(max_length=200, blank=True)
    eta = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    last_update = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vessels'
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} (IMO: {self.imo_number})"


class Port(models.Model):
    """Port information and analytics."""
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    country = models.CharField(max_length=100)
    country_code = models.CharField(max_length=5)
    
    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Analytics
    congestion_score = models.IntegerField(default=0)  # 0-100
    avg_wait_time = models.FloatField(default=0)  # in hours
    arrivals_today = models.IntegerField(default=0)
    departures_today = models.IntegerField(default=0)
    vessels_in_port = models.IntegerField(default=0)
    
    # Metadata
    last_update = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ports'
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name}, {self.country}"


class Voyage(models.Model):
    """Voyage history and tracking."""
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_transit', 'In Transit'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    voyage_id = models.CharField(max_length=50, unique=True)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    
    # Route
    port_from = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='departures')
    port_to = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='arrivals')
    
    # Timing
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    distance_nm = models.FloatField(null=True, blank=True)  # nautical miles
    
    # Cargo
    cargo_description = models.TextField(blank=True)
    cargo_weight = models.FloatField(null=True, blank=True)  # in tons
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'voyages'
        ordering = ['-departure_time']
        
    def __str__(self):
        return f"{self.voyage_id}: {self.vessel.name}"


class VoyageWaypoint(models.Model):
    """Waypoints for voyage route tracking and replay."""
    
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, related_name='waypoints')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(default=0)
    heading = models.FloatField(default=0)
    timestamp = models.DateTimeField()
    
    class Meta:
        db_table = 'voyage_waypoints'
        ordering = ['timestamp']


class SafetyZone(models.Model):
    """Safety and risk zones (piracy, weather, etc.)."""
    
    ZONE_TYPE_CHOICES = [
        ('piracy', 'Piracy Risk'),
        ('weather', 'Weather Warning'),
        ('restricted', 'Restricted Area'),
        ('conflict', 'Conflict Zone'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    name = models.CharField(max_length=200)
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    
    # Location (center point and radius)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius_km = models.FloatField()  # radius in kilometers
    
    # Details
    description = models.TextField(blank=True)
    advisory = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'safety_zones'
        
    def __str__(self):
        return f"{self.name} ({self.get_zone_type_display()})"


class Event(models.Model):
    """Events and incidents for vessels and ports."""
    
    EVENT_TYPE_CHOICES = [
        ('arrival', 'Port Arrival'),
        ('departure', 'Port Departure'),
        ('incident', 'Incident'),
        ('weather', 'Weather Event'),
        ('piracy', 'Piracy Attempt'),
        ('maintenance', 'Maintenance'),
        ('inspection', 'Inspection'),
        ('alert', 'Alert'),
    ]
    
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, null=True, blank=True, related_name='events')
    port = models.ForeignKey(Port, on_delete=models.CASCADE, null=True, blank=True, related_name='events')
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, null=True, blank=True, related_name='events')
    
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Timing
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Severity
    is_critical = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'events'
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.title} ({self.get_event_type_display()})"


class Notification(models.Model):
    """User notifications."""
    
    TYPE_CHOICES = [
        ('alert', 'Alert'),
        ('warning', 'Warning'),
        ('info', 'Information'),
        ('success', 'Success'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.user.username}"


class APISource(models.Model):
    """External API source management."""
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    base_url = models.URLField()
    api_key = models.CharField(max_length=200, blank=True)
    
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_interval = models.IntegerField(default=300)  # in seconds
    
    # Status
    status = models.CharField(max_length=50, default='connected')
    error_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'api_sources'
        
    def __str__(self):
        return self.name


class SystemLog(models.Model):
    """System logs for auditing and debugging."""
    
    LEVEL_CHOICES = [
        ('debug', 'DEBUG'),
        ('info', 'INFO'),
        ('warning', 'WARNING'),
        ('error', 'ERROR'),
        ('critical', 'CRITICAL'),
    ]
    
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    module = models.CharField(max_length=100)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'system_logs'
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"[{self.level}] {self.message[:50]}"