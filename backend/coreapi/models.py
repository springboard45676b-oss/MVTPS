from django.db import models # CITE: 4.4
heading = models.FloatField(default=0)

class Vessel(models.Model):
    name = models.CharField(max_length=100)
    imo_number = models.CharField(max_length=20, unique=True)
    type = models.CharField(max_length=50)
    flag = models.CharField(max_length=50, blank=True)
    cargo_type = models.CharField(max_length=100, null=True, blank=True)
    
    # THESE NAMES MUST MATCH THE FRONTEND
    last_position_lat = models.FloatField(null=True)
    last_position_lon = models.FloatField(null=True)
    last_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Port(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    congestion_score = models.FloatField(default=0.0)
    avg_wait_time = models.FloatField(default=0.0)

    def __str__(self):
        return self.name

class VoyageHistory(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='history')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # FIX: Access the name through the vessel relationship
        return f"{self.vessel.name} - {self.latitude}, {self.longitude}"