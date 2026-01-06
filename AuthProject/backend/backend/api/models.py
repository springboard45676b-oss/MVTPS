from django.db import models

class Vessel(models.Model):
    # Core Identification
    name = models.CharField(max_length=100)
    imo = models.CharField(max_length=20, unique=True)  # IMO is unique per ship
    mmsi = models.CharField(max_length=20, blank=True, null=True)
    
    # Metadata
    vessel_type = models.CharField(max_length=50)  # e.g., "Container Ship"
    flag = models.CharField(max_length=50)         # e.g., "Panama"
    operator = models.CharField(max_length=100, blank=True, null=True) # e.g., "Maersk"
    cargo = models.CharField(max_length=100, blank=True, null=True)    # e.g., "Electronics"
    
    # Live Tracking Data
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    speed = models.FloatField(default=0.0)         # Speed in knots
    course = models.FloatField(default=0.0)        # Heading in degrees
    
    # Voyage Info
    destination = models.CharField(max_length=100, default="Unknown")
    eta = models.CharField(max_length=50, blank=True, null=True)       # Estimated Time of Arrival
    status = models.CharField(max_length=50, default="In Transit")     # e.g., "Moored", "Underway"
    last_update = models.DateTimeField(auto_now=True) # Automatically updates timestamp

    def __str__(self):
        return f"{self.name} ({self.imo})"

class Notification(models.Model):
    title = models.CharField(max_length=100)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=[('alert', 'Alert'), ('info', 'Info')])
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    # Optional: Link notification to a specific vessel
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.type}: {self.title}"