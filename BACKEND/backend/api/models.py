from django.db import models


class Vessel(models.Model):
    """
    Core vessel table (as per project ER diagram)
    """
    imo_number = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50)          # Tanker, Cargo, Container
    flag = models.CharField(max_length=100)
    cargo_type = models.CharField(max_length=100, null=True, blank=True)
    operator = models.CharField(max_length=200, null=True, blank=True)

    # live position snapshot
    last_position_lat = models.FloatField(null=True, blank=True)
    last_position_lon = models.FloatField(null=True, blank=True)
    last_course = models.FloatField(null=True, blank=True)  # ✅ ADD
    last_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.imo_number})"
    # Additional fields can be added as needed.
    def get_normalized_cargo(self):
        cargo_map = {
            "ISO_T1": "Chemical Tanker",
            "ISO_T2": "Oil Products Tanker",
            "ISO_T3": "Crude Oil Tanker",
            "Container": "Containerized Cargo",
            "Bulk": "Dry Bulk Cargo",
            "LNG": "Liquefied Natural Gas",
            "Vehicles": "Ro-Ro (Vehicles)",
        }
        return cargo_map.get(self.cargo_type, self.cargo_type or "Unknown")
    


class VesselPosition(models.Model):
    """
    Historical AIS positions
    """
    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name="positions"
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    course = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.vessel.name} @ {self.timestamp}"


