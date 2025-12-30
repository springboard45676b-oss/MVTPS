from django.db import models

class SafetyZone(models.Model):
    ZONE_TYPES = [
        ('piracy', 'Piracy Risk'),
        ('storm', 'Storm Warning'),
        ('accident', 'Accident Zone'),
        ('restricted', 'Restricted Area'),
    ]
    
    name = models.CharField(max_length=100)
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPES)
    description = models.TextField()
    risk_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ])
    # Polygon coordinates stored as JSON
    coordinates = models.JSONField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.zone_type})"

class WeatherData(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    wind_speed = models.FloatField()
    wind_direction = models.FloatField()
    wave_height = models.FloatField(null=True, blank=True)
    visibility = models.FloatField(null=True, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Weather at ({self.latitude}, {self.longitude}) - {self.timestamp}"