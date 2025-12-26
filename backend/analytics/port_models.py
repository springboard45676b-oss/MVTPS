# Add to MVTPS/backend/analytics/models.py

from django.db import models

class Country(models.Model):
    """Country/Economy model for port statistics"""
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    region = models.CharField(max_length=100, blank=True)
    
    class Meta:
        verbose_name_plural = "Countries"
    
    def __str__(self):
        return self.name

class ShipType(models.Model):
    """Ship type categories"""
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class PortCallStatistic(models.Model):
    """Port call statistics from UNCTAD data"""
    year = models.IntegerField()
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    ship_type = models.ForeignKey(ShipType, on_delete=models.CASCADE)
    port_calls = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['year', 'country', 'ship_type']
        indexes = [
            models.Index(fields=['year', 'country']),
            models.Index(fields=['year', 'ship_type']),
        ]
    
    def __str__(self):
        return f"{self.country.name} - {self.ship_type.name} ({self.year}): {self.port_calls:,}"

class PortCongestionMetric(models.Model):
    """Derived metrics for port congestion analysis"""
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    year = models.IntegerField()
    total_port_calls = models.IntegerField()
    congestion_index = models.FloatField(help_text="Calculated congestion index (0-100)")
    efficiency_score = models.FloatField(help_text="Port efficiency score (0-100)")
    wait_time_avg = models.FloatField(help_text="Average wait time in hours", null=True, blank=True)
    
    # Ship type breakdown
    container_calls = models.IntegerField(default=0)
    bulk_calls = models.IntegerField(default=0)
    passenger_calls = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['country', 'year']
    
    def __str__(self):
        return f"{self.country.name} ({self.year}) - Congestion: {self.congestion_index:.1f}%"