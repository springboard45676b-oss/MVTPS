from django.db import models

class Vessel(models.Model):
    VESSEL_TYPES = (
        ('cargo', 'Cargo Ship'),
        ('container', 'Container Ship'),
        ('tanker', 'Tanker'),
        ('bulk', 'Bulk Carrier'),
        ('passenger', 'Passenger Ship'),
        ('fishing', 'Fishing Vessel'),
        ('other', 'Other'),
    )
    
    imo_number = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    vessel_type = models.CharField(max_length=20, choices=VESSEL_TYPES)
    flag = models.CharField(max_length=50)
    gross_tonnage = models.IntegerField(null=True, blank=True)
    length = models.FloatField(null=True, blank=True)
    beam = models.FloatField(null=True, blank=True)
    built_year = models.IntegerField(null=True, blank=True)
    owner = models.CharField(max_length=100, blank=True)
    operator = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.imo_number})"

class VesselPosition(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='positions')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    course = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.vessel.name} - {self.timestamp}"