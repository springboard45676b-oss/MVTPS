from django.db import models

class VoyageReplay(models.Model):
    """Historical voyage data for replay"""
    vessel = models.ForeignKey('vessels.Vessel', on_delete=models.CASCADE, related_name='replay_voyages')
    voyage_id = models.CharField(max_length=50, unique=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    origin_port = models.ForeignKey('ports.Port', on_delete=models.SET_NULL, null=True, related_name='origin_voyages')
    destination_port = models.ForeignKey('ports.Port', on_delete=models.SET_NULL, null=True, related_name='destination_voyages')
    status = models.CharField(max_length=20, default='completed')
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.vessel.vessel_name} - {self.voyage_id}"

class VoyagePosition(models.Model):
    """Position points for voyage replay"""
    voyage = models.ForeignKey(VoyageReplay, on_delete=models.CASCADE, related_name='positions')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField()
    course = models.FloatField()
    timestamp = models.DateTimeField()
    
    class Meta:
        ordering = ['timestamp']
        indexes = [models.Index(fields=['voyage', 'timestamp'])]

class ComplianceViolation(models.Model):
    """Compliance violations detected during voyage"""
    VIOLATION_TYPES = [
        ('route_deviation', 'Route Deviation'),
        ('excessive_wait', 'Excessive Wait Time'),
        ('unauthorized_port', 'Unauthorized Port Call'),
        ('speed_violation', 'Speed Violation'),
    ]
    
    voyage = models.ForeignKey(VoyageReplay, on_delete=models.CASCADE, related_name='violations')
    violation_type = models.CharField(max_length=30, choices=VIOLATION_TYPES)
    severity = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')])
    description = models.TextField()
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    timestamp = models.DateTimeField()
    
    class Meta:
        ordering = ['-timestamp']