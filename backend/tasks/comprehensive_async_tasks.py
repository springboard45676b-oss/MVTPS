from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Weather Data Tasks
@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def fetch_weather_data_comprehensive_task(self, lat, lng, include_forecast=False):
    """Comprehensive weather data ingestion task"""
    try:
        from services.external_apis import OpenWeatherAPI
        
        api = OpenWeatherAPI()
        weather_data = api.get_marine_weather(lat, lng)
        
        if include_forecast:
            forecast_data = api.get_weather_forecast(lat, lng)
            weather_data['forecast'] = forecast_data
        
        # Cache weather data for 10 minutes
        cache_key = f"weather_comprehensive_{lat}_{lng}"
        cache.set(cache_key, weather_data, 600)
        
        logger.info(f"Fetched comprehensive weather data for {lat}, {lng}")
        return {
            'success': True,
            'cache_key': cache_key,
            'timestamp': timezone.now().isoformat(),
            'includes_forecast': include_forecast
        }
        
    except Exception as exc:
        logger.error(f"Comprehensive weather fetch failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, max_retries=2)
def sync_port_analytics_data_task(self):
    """Port analytics data synchronization task"""
    try:
        from services.port_analytics import PortCongestionAnalyzer
        from ports.models import Port
        
        analyzer = PortCongestionAnalyzer()
        synced_ports = 0
        
        for port in Port.objects.filter(is_active=True):
            analytics_data = analyzer.generate_port_analytics(port)
            if analytics_data:
                # Cache port analytics for 1 hour
                cache_key = f"port_analytics_{port.code}"
                cache.set(cache_key, analytics_data, 3600)
                synced_ports += 1
        
        # Cache sync status
        cache.set('port_analytics_last_sync', {
            'timestamp': timezone.now().isoformat(),
            'synced_ports': synced_ports,
            'success': True
        }, 3600)
        
        logger.info(f"Synced analytics for {synced_ports} ports")
        return {
            'success': True,
            'synced_ports': synced_ports,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Port analytics sync failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def generate_safety_alerts_task(self):
    """Safety alert generation task"""
    try:
        from safety.services import SafetyAlertService
        from safety.models import Alert
        
        service = SafetyAlertService()
        alerts_generated = 0
        
        # Generate weather-based alerts
        weather_alerts = service.generate_weather_alerts()
        alerts_generated += len(weather_alerts)
        
        # Generate collision risk alerts
        collision_alerts = service.generate_collision_alerts()
        alerts_generated += len(collision_alerts)
        
        # Generate port congestion alerts
        congestion_alerts = service.generate_congestion_alerts()
        alerts_generated += len(congestion_alerts)
        
        # Cache alert summary
        cache.set('safety_alerts_summary', {
            'timestamp': timezone.now().isoformat(),
            'alerts_generated': alerts_generated,
            'weather_alerts': len(weather_alerts),
            'collision_alerts': len(collision_alerts),
            'congestion_alerts': len(congestion_alerts)
        }, 300)  # Cache for 5 minutes
        
        logger.info(f"Generated {alerts_generated} safety alerts")
        return {
            'success': True,
            'alerts_generated': alerts_generated,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Safety alert generation failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, max_retries=2)
def refresh_analytics_dashboard_task(self):
    """Analytics dashboard data refresh task"""
    try:
        from analytics.models import DashboardMetrics
        from vessels.models import Vessel
        from voyage_history.models import VoyageReplay
        from safety.models import Alert
        from ports.models import PortCongestion
        from django.db.models import Count, Avg
        
        # Calculate current metrics
        today = timezone.now().date()
        
        total_vessels = Vessel.objects.filter(is_active=True).count()
        active_voyages = VoyageReplay.objects.filter(status='active').count()
        completed_voyages = VoyageReplay.objects.filter(
            end_time__date=today
        ).count()
        active_alerts = Alert.objects.filter(status='active').count()
        
        # Port congestion average
        port_congestion_avg = PortCongestion.objects.filter(
            timestamp__date=today
        ).aggregate(avg=Avg('average_wait_time'))['avg'] or 0
        
        # Calculate efficiency score (simplified)
        efficiency_score = min(100, max(0, 100 - (port_congestion_avg * 2)))
        
        # Create or update dashboard metrics
        metrics, created = DashboardMetrics.objects.get_or_create(
            date=today,
            defaults={
                'total_vessels': total_vessels,
                'active_voyages': active_voyages,
                'completed_voyages': completed_voyages,
                'active_alerts': active_alerts,
                'port_congestion_avg': port_congestion_avg,
                'efficiency_score': efficiency_score
            }
        )
        
        if not created:
            metrics.total_vessels = total_vessels
            metrics.active_voyages = active_voyages
            metrics.completed_voyages = completed_voyages
            metrics.active_alerts = active_alerts
            metrics.port_congestion_avg = port_congestion_avg
            metrics.efficiency_score = efficiency_score
            metrics.save()
        
        # Cache dashboard data
        dashboard_data = {
            'total_vessels': total_vessels,
            'active_voyages': active_voyages,
            'completed_voyages': completed_voyages,
            'active_alerts': active_alerts,
            'port_congestion_avg': round(port_congestion_avg, 2),
            'efficiency_score': round(efficiency_score, 2),
            'last_updated': timezone.now().isoformat()
        }
        
        cache.set('dashboard_metrics', dashboard_data, 1800)  # Cache for 30 minutes
        
        logger.info(f"Refreshed dashboard analytics for {today}")
        return {
            'success': True,
            'metrics': dashboard_data,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Analytics dashboard refresh failed: {exc}")
        raise self.retry(exc=exc)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def cleanup_expired_cache_task(self):
    """Cleanup expired cache entries task"""
    try:
        from django.core.cache import cache
        
        # This is a placeholder - Django cache handles expiration automatically
        # But we can log cache statistics if needed
        
        logger.info("Cache cleanup task completed")
        return {
            'success': True,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Cache cleanup failed: {exc}")
        raise self.retry(exc=exc)

# Batch processing tasks
@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, max_retries=2)
def batch_vessel_data_processing_task(self, vessel_ids):
    """Batch process vessel data for multiple vessels"""
    try:
        from vessels.models import Vessel, VesselPosition
        
        processed_count = 0
        for vessel_id in vessel_ids:
            try:
                vessel = Vessel.objects.get(id=vessel_id)
                # Process latest positions, calculate analytics, etc.
                latest_positions = VesselPosition.objects.filter(
                    vessel=vessel
                ).order_by('-ais_timestamp')[:10]
                
                # Cache vessel analytics
                cache_key = f"vessel_analytics_{vessel.mmsi}"
                cache.set(cache_key, {
                    'vessel_id': vessel.id,
                    'mmsi': vessel.mmsi,
                    'latest_positions_count': len(latest_positions),
                    'last_updated': timezone.now().isoformat()
                }, 1800)
                
                processed_count += 1
                
            except Vessel.DoesNotExist:
                logger.warning(f"Vessel {vessel_id} not found")
                continue
        
        logger.info(f"Batch processed {processed_count} vessels")
        return {
            'success': True,
            'processed_count': processed_count,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Batch vessel processing failed: {exc}")
        raise self.retry(exc=exc)