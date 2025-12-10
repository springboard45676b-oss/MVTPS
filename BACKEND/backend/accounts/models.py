from django.db import models
from django.contrib.auth.models import User

ROLE_CHOICES = [
    ('operator', 'Operator'),
    ('admin', 'Admin'),
    ('analyst', 'Analyst'),
]


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operator')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    


    # =======================================
    # Models for Vessel, Port, Voyage, Event, and Notification
from django.core.validators import MinValueValidator, MaxValueValidator

# ============================================
# VESSEL MODEL
# ============================================
class Vessel(models.Model):
    """
    Stores vessel information and real-time position data
    """
    VESSEL_TYPES = [
        ('cargo', 'Cargo Ship'),
        ('tanker', 'Tanker'),
        ('passenger', 'Passenger Ship'),
        ('fishing', 'Fishing Vessel'),
        ('military', 'Military Vessel'),
        ('other', 'Other'),
    ]
    
    imo_number = models.CharField(
        max_length=10, 
        unique=True,
        help_text="International Maritime Organization number (unique identifier)"
    )
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=VESSEL_TYPES)
    flag = models.CharField(
        max_length=100,
        help_text="Flag country of the vessel"
    )
    cargo_type = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Type of cargo being transported"
    )
    operator = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        help_text="Vessel operator/company name"
    )
    
    # Real-time position data
    last_position_lat = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        help_text="Last known latitude"
    )
    last_position_lon = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        help_text="Last known longitude"
    )
    last_update = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last position update"
    )
    
    class Meta:
        db_table = 'vessels'
        ordering = ['-last_update']
        verbose_name = 'Vessel'
        verbose_name_plural = 'Vessels'
        indexes = [
            models.Index(fields=['imo_number']),
            models.Index(fields=['type']),
            models.Index(fields=['-last_update']),
        ]
    
    def __str__(self):
        return f"{self.name} (IMO: {self.imo_number})"


# ============================================
# PORT MODEL
# ============================================
class Port(models.Model):
    """
    Stores port information and congestion analytics
    """
    name = models.CharField(max_length=200)
    location = models.CharField(
        max_length=200,
        help_text="City or geographical location"
    )
    country = models.CharField(max_length=100)
    
    # Analytics fields
    congestion_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Congestion score (0-100, higher means more congested)"
    )
    avg_wait_time = models.FloatField(
        default=0.0,
        help_text="Average wait time in hours"
    )
    arrivals = models.IntegerField(
        default=0,
        help_text="Number of vessel arrivals (current period)"
    )
    departures = models.IntegerField(
        default=0,
        help_text="Number of vessel departures (current period)"
    )
    last_update = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp for analytics"
    )
    
    class Meta:
        db_table = 'ports'
        ordering = ['name']
        verbose_name = 'Port'
        verbose_name_plural = 'Ports'
        indexes = [
            models.Index(fields=['country']),
            models.Index(fields=['-congestion_score']),
        ]
    
    def __str__(self):
        return f"{self.name}, {self.country}"


# ============================================
# VOYAGE MODEL
# ============================================
class Voyage(models.Model):
    """
    Stores voyage/trip information between ports
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('delayed', 'Delayed'),
        ('cancelled', 'Cancelled'),
    ]
    
    vessel = models.ForeignKey(
        Vessel, 
        on_delete=models.CASCADE,
        related_name='voyages',
        help_text="Vessel making this voyage"
    )
    port_from = models.ForeignKey(
        Port, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='departures_from',
        help_text="Origin port"
    )
    port_to = models.ForeignKey(
        Port, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='arrivals_to',
        help_text="Destination port"
    )
    
    departure_time = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Actual or scheduled departure time"
    )
    arrival_time = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Actual or estimated arrival time"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='scheduled'
    )
    
    class Meta:
        db_table = 'voyages'
        ordering = ['-departure_time']
        verbose_name = 'Voyage'
        verbose_name_plural = 'Voyages'
        indexes = [
            models.Index(fields=['vessel', '-departure_time']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.vessel.name}: {self.port_from} → {self.port_to}"


# ============================================
# EVENT MODEL
# ============================================
class Event(models.Model):
    """
    Stores safety events (weather, piracy, accidents, etc.)
    """
    EVENT_TYPES = [
        ('weather', 'Weather Alert'),
        ('piracy', 'Piracy Risk'),
        ('accident', 'Accident'),
        ('congestion', 'Port Congestion'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other'),
    ]
    
    vessel = models.ForeignKey(
        Vessel, 
        on_delete=models.CASCADE,
        related_name='events',
        help_text="Related vessel (if applicable)"
    )
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    location = models.CharField(
        max_length=200,
        help_text="Location description or coordinates"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(
        help_text="Detailed description of the event"
    )
    
    class Meta:
        db_table = 'events'
        ordering = ['-timestamp']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.vessel.name} at {self.location}"


# ============================================
# NOTIFICATION MODEL
# ============================================
class Notification(models.Model):
    """
    Stores user notifications for events and alerts
    """
    NOTIFICATION_TYPES = [
        ('alert', 'Alert'),
        ('warning', 'Warning'),
        ('info', 'Information'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User receiving this notification"
    )
    vessel = models.ForeignKey(
        Vessel, 
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Related vessel (optional)"
    )
    event = models.ForeignKey(
        Event, 
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Related event (optional)"
    )
    
    message = models.TextField(help_text="Notification message")
    type = models.CharField(
        max_length=20, 
        choices=NOTIFICATION_TYPES, 
        default='info'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(
        default=False,
        help_text="Whether user has read this notification"
    )
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-timestamp']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['is_read']),
        ]
    
    def __str__(self):
        return f"{self.type} for {self.user.username}: {self.message[:50]}"