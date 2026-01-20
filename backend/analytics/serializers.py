from rest_framework import serializers
from .models import DashboardMetrics, VoyageAnalytics, PortPerformance, RiskAssessment

class DashboardMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardMetrics
        fields = ['date', 'total_vessels', 'active_voyages', 'completed_voyages', 
                 'active_alerts', 'port_congestion_avg', 'efficiency_score', 'created_at']

class VoyageAnalyticsSerializer(serializers.ModelSerializer):
    voyage_id = serializers.CharField(source='voyage.voyage_id', read_only=True)
    vessel_name = serializers.CharField(source='voyage.vessel.vessel_name', read_only=True)
    
    class Meta:
        model = VoyageAnalytics
        fields = ['voyage_id', 'vessel_name', 'planned_duration', 'actual_duration', 
                 'delay_hours', 'fuel_consumption', 'average_speed', 'weather_delays', 
                 'port_delays', 'efficiency_score', 'created_at', 'updated_at']

class PortPerformanceSerializer(serializers.ModelSerializer):
    port_name = serializers.CharField(source='port.name', read_only=True)
    port_code = serializers.CharField(source='port.code', read_only=True)
    
    class Meta:
        model = PortPerformance
        fields = ['port_name', 'port_code', 'date', 'arrivals', 'departures', 
                 'average_turnaround_time', 'peak_congestion_level', 'throughput_tons', 
                 'efficiency_rating', 'created_at']

class RiskAssessmentSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.vessel_name', read_only=True)
    vessel_mmsi = serializers.CharField(source='vessel.mmsi', read_only=True)
    assessed_by_name = serializers.CharField(source='assessed_by.username', read_only=True)
    
    class Meta:
        model = RiskAssessment
        fields = ['id', 'vessel_name', 'vessel_mmsi', 'risk_category', 'risk_level', 
                 'risk_score', 'description', 'mitigation_measures', 'assessed_by_name', 
                 'assessment_date', 'is_active']