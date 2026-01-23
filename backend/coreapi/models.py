from django.db import models
from django.contrib.auth.models import User

# Milestone 1: User Roles and Profiles [cite: 23, 24]
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[
        ('Operator', 'Operator'),
        ('Analyst', 'Analyst'),
        ('Admin', 'Admin')
    ], default='Operator')

# Milestone 2: Vessel Metadata & AIS tracking [cite: 28, 55]
class Vessel(models.Model):
    name = models.CharField(max_length=100)
    imo_number = models.CharField(max_length=20, unique=True)
    type = models.CharField(max_length=50) # e.g., Container, Tanker
    flag = models.CharField(max_length=50)
    cargo_type = models.CharField(max_length=100, blank=True)
    operator = models.CharField(max_length=100, blank=True)
    last_position_lat = models.FloatField()
    last_position_lon = models.FloatField()
    heading = models.IntegerField(default=0)
    last_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.imo_number})"

# Milestone 4: Historical Voyage Audit Module [cite: 17, 37, 54]
class VoyageHistory(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='history')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

# Milestone 3: Port Congestion Analytics [cite: 15, 33, 99]
class Port(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    congestion_score = models.FloatField(default=0.0)
    avg_wait_time = models.FloatField(default=0.0) # in hours
    arrivals = models.IntegerField(default=0)
    departures = models.IntegerField(default=0)
    last_update = models.DateTimeField(auto_now=True)

# Milestone 3 & 4: Safety Events & Notifications [cite: 16, 35, 113]
class AlertEvent(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, null=True, blank=True)
    event_type = models.CharField(max_length=50) # e.g., Storm, Piracy, Congestion
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius_km = models.FloatField(default=10.0)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField()

    def __str__(self):
        return f"{self.event_type} at {self.location}"