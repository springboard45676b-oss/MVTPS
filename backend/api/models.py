from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('operator', 'Operator'),
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operator')
    company = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class Port(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    country = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Vessel(models.Model):
    VESSEL_TYPES = [
        ('cargo', 'Cargo Ship'),
        ('tanker', 'Tanker'),
        ('container', 'Container Ship'),
        ('passenger', 'Passenger Ship'),
        ('fishing', 'Fishing Vessel'),
    ]
    
    name = models.CharField(max_length=100)
    imo = models.CharField(max_length=20, unique=True)
    vessel_type = models.CharField(max_length=20, choices=VESSEL_TYPES)
    flag = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    current_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.name

class Voyage(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE)
    origin = models.ForeignKey(Port, related_name="voyages_from", on_delete=models.CASCADE)
    destination = models.ForeignKey(Port, related_name="voyages_to", on_delete=models.CASCADE)
    departure_date = models.DateTimeField()
    estimated_arrival = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    
    def __str__(self):
        return f"{self.vessel.name}: {self.origin.code} → {self.destination.code}"

class Event(models.Model):
    EVENT_TYPES = [
        ('weather', 'Weather Alert'),
        ('maintenance', 'Maintenance'),
        ('incident', 'Incident'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.username}"