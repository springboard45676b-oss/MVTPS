from django.db import models

class Port(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    country = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class PortCongestion(models.Model):
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='congestion_data')
    vessels_waiting = models.IntegerField()
    average_wait_time = models.FloatField()  # in hours
    congestion_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ])
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.port.name} - {self.congestion_level} ({self.timestamp})"