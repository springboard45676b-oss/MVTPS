from django.db import models
from vessels.models import Vessel, Voyage
from ports.models import Port
from users.models import User

class DashboardMetrics(models.Model):
    """
    Aggregated metrics for dashboard display
    """
    date = models.DateField()
    total_vessels = models.PositiveIntegerField(default=0)
    active_voyages = models.PositiveIntegerField(default=0)
    completed_voyages = models.PositiveIntegerField(default=0)
    active_alerts = models.PositiveIntegerField(default=0)
    port_congestion_avg = models.FloatField(default=0.0)
    efficiency_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['date']
    
    def __str__(self):
        return f"Metrics for {self.date}"

class VoyageAnalytics(models.Model):
    """
    Voyage performance analytics and insights
    """
    voyage = models.OneToOneField(Voyage, on_delete=models.CASCADE, related_name='analytics')
    planned_duration = models.FloatField(help_text="Planned duration in hours")
    actual_duration = models.FloatField(help_text="Actual duration in hours", null=True, blank=True)
    delay_hours = models.FloatField(default=0.0)
    fuel_consumption = models.FloatField(help_text="Fuel consumption in tons", null=True, blank=True)
    average_speed = models.FloatField(help_text="Average speed in knots", null=True, blank=True)
    weather_delays = models.FloatField(default=0.0, help_text="Weather-related delays in hours")
    port_delays = models.FloatField(default=0.0, help_text="Port-related delays in hours")
    efficiency_score = models.FloatField(default=0.0, help_text="Overall efficiency score 0-100")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Analytics for {self.voyage}"

class PortPerformance(models.Model):
    """
    Port performance metrics and analytics
    """
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='performance_metrics')
    date = models.DateField()
    arrivals = models.PositiveIntegerField(default=0)
    departures = models.PositiveIntegerField(default=0)
    average_turnaround_time = models.FloatField(help_text="Average turnaround time in hours")
    peak_congestion_level = models.CharField(max_length=20, default='low')
    throughput_tons = models.FloatField(default=0.0)
    efficiency_rating = models.FloatField(default=0.0, help_text="Efficiency rating 0-100")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = ['port', 'date']
    
    def __str__(self):
        return f"{self.port.name} performance - {self.date}"

class RiskAssessment(models.Model):
    """
    Risk assessment for vessels, routes, and operations
    """
    RISK_CATEGORIES = [
        ('weather', 'Weather Risk'),
        ('piracy', 'Piracy Risk'),
        ('mechanical', 'Mechanical Risk'),
        ('route', 'Route Risk'),
        ('cargo', 'Cargo Risk'),
    ]
    
    RISK_LEVELS = [
        ('very_low', 'Very Low'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ]
    
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name='risk_assessments')
    voyage = models.ForeignKey(Voyage, on_delete=models.CASCADE, null=True, blank=True)
    risk_category = models.CharField(max_length=20, choices=RISK_CATEGORIES)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    risk_score = models.FloatField(help_text="Risk score 0-100")
    description = models.TextField()
    mitigation_measures = models.TextField(blank=True)
    assessed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assessment_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-assessment_date']
    
    def __str__(self):
        return f"{self.vessel.name} - {self.risk_category} ({self.risk_level})"