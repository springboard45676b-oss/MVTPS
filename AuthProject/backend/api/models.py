from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    OPERATOR = 'operator'
    ANALYST = 'analyst'
    ADMIN = 'admin'
    ROLE_CHOICES = [
        (OPERATOR, 'Operator'), 
        (ANALYST, 'Analyst'), 
        (ADMIN, 'Admin')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=OPERATOR)

class Vessel(models.Model):
    name = models.CharField(max_length=100)
    vessel_type = models.CharField(max_length=50)
    flag = models.CharField(max_length=50)
    
    # --- NEW FIELDS FOR MAP TRACKING (Milestone 2) ---
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, default="In Transit")

    def __str__(self): 
        return self.name

class Port(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    capacity = models.IntegerField(default=0)
    def __str__(self): return self.name

class Event(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title

class Wire(models.Model):
    cable_id = models.CharField(max_length=50)
    length_meters = models.FloatField()
    status = models.CharField(max_length=50, default="Active")
    def __str__(self): return self.cable_id

# --- PASTE THIS AT THE BOTTOM OF api/models.py ---

class Voyage(models.Model):
    # This links the voyage to a specific Vessel
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    port_from = models.CharField(max_length=100)
    port_to = models.CharField(max_length=100)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=[('Scheduled', 'Scheduled'), ('In Transit', 'In Transit'), ('Arrived', 'Arrived'), ('Delayed', 'Delayed')],
        default='Scheduled'
    )

    def __str__(self):
        return f"{self.vessel.name}: {self.port_from} -> {self.port_to}"
class VesselLog(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='logs')
    lat = models.FloatField()
    lon = models.FloatField()
    speed = models.FloatField()
    heading = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Compliance check (e.g., did it enter a piracy zone? was it speeding?)
    violation_status = models.CharField(max_length=50, default="Normal") 

    def __str__(self):
        return f"{self.vessel.name} @ {self.timestamp}"