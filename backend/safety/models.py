from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from vessels.models import Vessel

class WeatherAlert(models.Model):
    """
    Weather alerts and conditions from NOAA data
    """
    ALERT_TYPES = [
        ('storm', 'Storm Warning'),
        ('hurricane', 'Hurricane'),
        ('fog', 'Dense Fog'),
        ('high_winds', 'High Winds'),
        ('rough_seas', 'Rough Seas'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    radius = models.FloatField(help_text="Affected radius in nautical miles")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.severity}"

class PiracyZone(models.Model):
    """
    High-risk piracy zones and security alerts
    """
    RISK_LEVELS = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical Risk'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    boundary_coordinates = models.JSONField(help_text="GeoJSON polygon coordinates")
    is_active = models.BooleanField(default=True)
    last_incident = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.risk_level}"

class Incident(models.Model):
    """
    Maritime incidents and accidents
    """
    INCIDENT_TYPES = [
        ('collision', 'Collision'),
        ('grounding', 'Grounding'),
        ('fire', 'Fire'),
        ('piracy', 'Piracy'),
        ('mechanical', 'Mechanical Failure'),
        ('weather', 'Weather Damage'),
        ('pollution', 'Pollution'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    vessel = models.ForeignKey(Vessel, on_delete=models.SET_NULL, null=True, blank=True)
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    severity = models.CharField(max_length=20, choices=WeatherAlert.SEVERITY_LEVELS)
    casualties = models.PositiveIntegerField(default=0)
    damage_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    incident_date = models.DateTimeField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-incident_date']
    
    def __str__(self):
        return f"{self.title} - {self.incident_date}"