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
    flag = models.CharField(max_length=50)
    length = models.FloatField(null=True, blank=True)
    width = models.FloatField(null=True, blank=True)
    gross_tonnage = models.IntegerField(null=True, blank=True)
    built_year = models.IntegerField(null=True, blank=True)
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