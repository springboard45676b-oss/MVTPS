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