from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Operator', 'Operator'),
        ('Analyst', 'Analyst'),
        ('Admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Operator')
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Port(models.Model):
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name


class Vessel(models.Model):
    mmsi = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    vessel_type = models.CharField(max_length=100, blank=True)
    flag = models.CharField(max_length=50, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.mmsi})"


class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    origin = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='voyage_origins')
    destination = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name='voyage_destinations')
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.vessel.name} : {self.origin} -> {self.destination}"


class Event(models.Model):
    EVENT_TYPES = (
        ('ACCIDENT','Accident'),
        ('PIRACY','Piracy'),
        ('WEATHER','Weather'),
        ('CONGESTION','Congestion'),
    )
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    vessel = models.ForeignKey(Vessel, on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.event_type} @ {self.timestamp}"


class Notification(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} -> {self.user.username}"
