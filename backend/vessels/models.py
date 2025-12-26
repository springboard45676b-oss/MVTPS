from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from ports.models import Port

class Vessel(models.Model):
    """
    Vessel information with AIS data integration
    """
    VESSEL_TYPES = [
        ('cargo', 'Cargo Ship'),
        ('tanker', 'Tanker'),
        ('container', 'Container Ship'),
        ('passenger', 'Passenger Ship'),
        ('fishing', 'Fishing Vessel'),
        ('bulk_carrier', 'Bulk Carrier'),
        ('ro_ro', 'RoRo Ship'),
        ('offshore', 'Offshore Vessel'),
    ]
    
    CARGO_TYPES = [
        ('general', 'General Cargo'),
        ('crude_oil', 'Crude Oil'),
        ('lng', 'LNG'),
        ('containers', 'Containers'),
        ('bulk', 'Bulk Cargo'),
        ('chemicals', 'Chemicals'),
        ('passengers', 'Passengers'),
    ]
    
    name = models.CharField(max_length=100)
    imo = models.CharField(max_length=20, unique=True, help_text="International Maritime Organization number")
    mmsi = models.CharField(max_length=20, unique=True, help_text="Maritime Mobile Service Identity")
    vessel_type = models.CharField(max_length=20, choices=VESSEL_TYPES)
    cargo_type = models.CharField(max_length=20, choices=CARGO_TYPES, blank=True)
    flag = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField(help_text="Capacity in tons or TEU")
    length = models.FloatField(help_text="Length in meters")
    width = models.FloatField(help_text="Width in meters")
    current_port = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} (IMO: {self.imo})"

class VesselPosition(models.Model):
    """
    Real-time vessel position data from AIS
    """
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='positions')
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    speed = models.FloatField(help_text="Speed in knots")
    course = models.FloatField(help_text="Course in degrees")
    heading = models.FloatField(help_text="Heading in degrees", null=True, blank=True)
    status = models.CharField(max_length=50, default='Under way using engine')
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        get_latest_by = 'timestamp'
    
    def __str__(self):
        return f"{self.vessel.name} - {self.timestamp}"

class Voyage(models.Model):
    """
    Vessel voyage information and tracking
    """
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('delayed', 'Delayed'),
    ]
    
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='voyages')
    origin = models.ForeignKey(Port, related_name="voyages_from", on_delete=models.CASCADE)
    destination = models.ForeignKey(Port, related_name="voyages_to", on_delete=models.CASCADE)
    departure_date = models.DateTimeField()
    estimated_arrival = models.DateTimeField()
    actual_arrival = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    distance = models.FloatField(help_text="Distance in nautical miles", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-departure_date']
    
    def __str__(self):
        return f"{self.vessel.name}: {self.origin.code} → {self.destination.code}"