from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.auth.validators import UnicodeUsernameValidator

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('role', User.ROLE_ADMIN)
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser):
    """
    Custom User model matching the ERD schema exactly:
    - id (auto, primary key)
    - username (varchar, unique)
    - email (varchar, unique)
    - password (varchar, handled by AbstractBaseUser)
    - role (varchar)
    - created_at (datetime)
    """
    ROLE_OPERATOR = "operator"
    ROLE_ANALYST = "analyst"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = (
        (ROLE_OPERATOR, "Operator"),
        (ROLE_ANALYST, "Analyst"),
        (ROLE_ADMIN, "Admin"),
    )

    # Schema fields only - matching ERD exactly
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[UnicodeUsernameValidator()],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    
    email = models.EmailField(_('email address'), unique=True)
    # password field is inherited from AbstractBaseUser
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_OPERATOR, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_column='created_at')

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

    class Meta:
        db_table = 'core_user'
        verbose_name = _('user')
        verbose_name_plural = _('users')
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.username

    def clean(self):
        super().clean()
        if not self.username:
            raise ValidationError({'username': _('Username is required.')})
        if not self.email:
            raise ValidationError({'email': _('Email is required.')})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def is_staff(self):
        """Required for Django admin - returns True for admin role"""
        return self.role == self.ROLE_ADMIN
    
    @property
    def is_superuser(self):
        """Required for Django admin - returns True for admin role"""
        return self.role == self.ROLE_ADMIN
    
    @property
    def is_active(self):
        """Always return True - users are active by default"""
        return True
    
    def has_perm(self, perm, obj=None):
        """Required for Django admin - admins have all permissions"""
        return self.role == self.ROLE_ADMIN
    
    def has_module_perms(self, app_label):
        """Required for Django admin - admins have all module permissions"""
        return self.role == self.ROLE_ADMIN


class Vessel(models.Model):
    """
    Vessel model matching ERD schema exactly:
    - id, imo_number, name, type, flag, cargo_type, operator, destination, last_position_lat, last_position_lon, last_update
    """
    imo_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    flag = models.CharField(max_length=100)
    cargo_type = models.CharField(max_length=100)
    operator = models.CharField(max_length=255)
    destination = models.CharField(max_length=255, null=True, blank=True)
    last_position_lat = models.FloatField(null=True, blank=True)
    last_position_lon = models.FloatField(null=True, blank=True)
    last_update = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_vessel'

    def __str__(self):
        return f"{self.name} ({self.imo_number})"


# Add these fields to your Port model in server/core/models.py

class Port(models.Model):
    """
    Port model matching ERD schema with coordinates:
    - id, name, location, country, congestion_score, avg_wait_time, arrivals, departures, last_update
    - latitude, longitude (NEW FIELDS for map visualization)
    """
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    congestion_score = models.FloatField(default=0.0)
    avg_wait_time = models.FloatField(default=0.0)
    arrivals = models.IntegerField(default=0)
    departures = models.IntegerField(default=0)
    last_update = models.DateTimeField(auto_now=True)
    
    # NEW FIELDS for geographic coordinates
    latitude = models.FloatField(null=True, blank=True, help_text='Port latitude coordinate')
    longitude = models.FloatField(null=True, blank=True, help_text='Port longitude coordinate')

    class Meta:
        db_table = 'core_port'

    def __str__(self):
        return f"{self.name}, {self.country}"


class Voyage(models.Model):
    """
    Voyage model matching ERD schema with wait time calculation fields:
    - id, vessel_id, port_from, port_to, departure_time, arrival_time, status
    - entry_time (NEW) - When vessel enters the destination port
    - berthing_time (NEW) - When vessel docks at the destination port
    
    Wait Time Calculation: berthing_time - entry_time (in hours)
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages', db_column='vessel_id')
    port_from = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='voyages_from', db_column='port_from')
    port_to = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='voyages_to', db_column='port_to')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # NEW FIELDS for wait time calculation
    entry_time = models.DateTimeField(
        null=True, 
        blank=True, 
        help_text='When vessel enters the destination port'
    )
    berthing_time = models.DateTimeField(
        null=True, 
        blank=True, 
        help_text='When vessel docks at the destination port'
    )

    class Meta:
        ordering = ['-departure_time']
        db_table = 'core_voyage'

    def __str__(self):
        return f"{self.vessel.name} from {self.port_from} to {self.port_to}"
    
    @property
    def wait_time_hours(self):
        """
        Calculate wait time in hours: berthing_time - entry_time
        Returns None if times are not set
        """
        if self.entry_time and self.berthing_time:
            delta = self.berthing_time - self.entry_time
            return round(delta.total_seconds() / 3600, 2)
        return None
    
    def __str__(self):
        wait_time = f" (Wait: {self.wait_time_hours}h)" if self.wait_time_hours else ""
        return f"{self.vessel.name} from {self.port_from} to {self.port_to}{wait_time}"


class Event(models.Model):
    """
    Event model matching ERD schema exactly:
    - id, vessel_id, event_type, location, timestamp, details
    """
    EVENT_TYPES = [
        ('arrival', 'Arrival'),
        ('departure', 'Departure'),
        ('maintenance', 'Maintenance'),
        ('inspection', 'Inspection'),
        ('incident', 'Incident'),
        ('other', 'Other'),
    ]

    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='events', db_column='vessel_id')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    location = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now)
    details = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
        db_table = 'core_event'

    def __str__(self):
        return f"{self.get_event_type_display()} - {self.vessel.name} at {self.timestamp}"


class Notification(models.Model):
    """
    Notification model matching ERD schema with new fields:
    - id, user_id, vessel_id, event_id, message, type, timestamp
    - is_read (NEW) - Boolean for read status
    - event_type (NEW) - varchar for position_update, arrival, departure
    """
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('alert', 'Alert'),
        ('update', 'Update'),
    ]

    EVENT_TYPES = [
        ('position_update', 'Position Update'),
        ('arrival', 'Arrival'),
        ('departure', 'Departure'),
        ('unknown', 'Unknown'),
    ]

    # EXACT SCHEMA FROM ERD
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', db_column='user_id')
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='notifications', db_column='vessel_id')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='notifications', db_column='event_id', null=True, blank=True)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info', db_column='type')
    timestamp = models.DateTimeField(auto_now_add=True, db_column='timestamp')
    
    # NEW FIELDS
    is_read = models.BooleanField(default=False, db_column='is_read')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='unknown', db_column='event_type')

    class Meta:
        ordering = ['-timestamp']
        db_table = 'core_notification'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['is_read', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.get_type_display()} - {self.user.username}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save()


class VesselPosition(models.Model):
    """
    Real-time vessel position history from MarineTraffic/AIS Hub APIs
    Stores historical position data for tracking vessel movements
    """
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='positions', db_column='vessel_id')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    course = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()
    source = models.CharField(max_length=20, choices=[('marinetraffic', 'MarineTraffic'), ('aishub', 'AIS Hub')], default='marinetraffic')
    
    class Meta:
        ordering = ['-timestamp']
        db_table = 'core_vessel_position'
        indexes = [
            models.Index(fields=['vessel', '-timestamp']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.vessel.name} - {self.timestamp}"


class APIKey(models.Model):
    """
    Store API keys for MarineTraffic and AIS Hub services
    """
    SERVICE_CHOICES = [
        ('marinetraffic', 'MarineTraffic'),
        ('aishub', 'AIS Hub'),
    ]
    
    service = models.CharField(max_length=20, choices=SERVICE_CHOICES, unique=True)
    api_key = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'core_api_key'

    def __str__(self):
        return f"{self.service} - {'Active' if self.is_active else 'Inactive'}"


class VesselSubscription(models.Model):
    """
    User subscription to vessel alerts and status updates
    Allows users to enable/disable alerts for specific vessels
    """
    ALERT_TYPES = [
        ('position_update', 'Position Update'),
        ('departure', 'Departure'),
        ('arrival', 'Arrival'),
        ('speed_change', 'Speed Change'),
        ('course_change', 'Course Change'),
        ('all', 'All Events'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vessel_subscriptions', db_column='user_id')
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='subscriptions', db_column='vessel_id')
    is_active = models.BooleanField(default=True)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES, default='all')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'core_vessel_subscription'
        unique_together = ('user', 'vessel')
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['vessel', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} subscribed to {self.vessel.name}"


class VesselAlert(models.Model):
    """
    Alert records for subscribed vessels
    Logs alerts that have been sent to users
    """
    ALERT_STATUS = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('read', 'Read'),
        ('dismissed', 'Dismissed'),
    ]
    
    subscription = models.ForeignKey(VesselSubscription, on_delete=models.CASCADE, related_name='alerts', db_column='subscription_id')
    alert_type = models.CharField(max_length=20, choices=[
        ('position_update', 'Position Update'),
        ('departure', 'Departure'),
        ('arrival', 'Arrival'),
        ('speed_change', 'Speed Change'),
        ('course_change', 'Course Change'),
    ])
    message = models.TextField()
    status = models.CharField(max_length=20, choices=ALERT_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'core_vessel_alert'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subscription', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.alert_type} - {self.subscription.vessel.name}"