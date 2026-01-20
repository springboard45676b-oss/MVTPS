from django.db.models import Q
from safety.models import Alert, WeatherAlert, PiracyZone, MaritimeAccident

class WeatherAlertService:
    """Service layer for weather alert business logic"""
    
    @staticmethod
    def get_active_weather_alerts():
        """Get all active weather alerts"""
        return WeatherAlert.objects.filter(is_active=True)
    
    @staticmethod
    def get_active_alerts_ordered():
        """Get active weather alerts ordered by severity and date"""
        return WeatherAlert.objects.filter(is_active=True).order_by('-severity', '-created_at')

class PiracyZoneService:
    """Service layer for piracy zone business logic"""
    
    @staticmethod
    def get_active_piracy_zones():
        """Get all active piracy zones"""
        return PiracyZone.objects.filter(is_active=True)
    
    @staticmethod
    def get_high_risk_zones():
        """Get high-risk piracy zones"""
        return PiracyZone.objects.filter(is_active=True, risk_level='high')

class MaritimeAccidentService:
    """Service layer for maritime accident business logic"""
    
    @staticmethod
    def get_all_accidents():
        """Get all maritime accidents"""
        return MaritimeAccident.objects.all()
    
    @staticmethod
    def get_filtered_accidents(start_date=None, end_date=None):
        """Get maritime accidents filtered by date range"""
        queryset = MaritimeAccident.objects.all()
        
        if start_date:
            queryset = queryset.filter(accident_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(accident_date__lte=end_date)
        
        return queryset.order_by('-accident_date')

class AlertService:
    """Service layer for general alert business logic"""
    
    @staticmethod
    def get_all_alerts():
        """Get all alerts"""
        return Alert.objects.all().order_by('-created_at')
    
    @staticmethod
    def get_active_alerts():
        """Get active alerts only"""
        return Alert.objects.filter(status='active').order_by('-created_at')
    
    @staticmethod
    def get_alerts_summary():
        """Get alert summary statistics"""
        from django.db.models import Count
        
        total_alerts = Alert.objects.count()
        active_alerts = Alert.objects.filter(status='active').count()
        critical_alerts = Alert.objects.filter(severity='critical', status='active').count()
        
        alerts_by_type = Alert.objects.values('alert_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'total_alerts': total_alerts,
            'active_alerts': active_alerts,
            'critical_alerts': critical_alerts,
            'alerts_by_type': list(alerts_by_type)
        }