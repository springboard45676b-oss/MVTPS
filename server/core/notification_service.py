# server/core/notification_service.py
"""
Enhanced Notification Service with Safety Monitoring
Combines existing WebSocket notifications with new safety features:
- Weather alerts (from database)
- Piracy risk monitoring
- Port congestion alerts
"""

from .models import (
    Notification, VesselSubscription, Vessel, User, Event,
    PiracyZone, Port, WeatherAlert
)
from django.utils import timezone
from django.db.models import Q
import logging
from math import radians, sin, cos, sqrt, atan2

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Service for sending real-time notifications via WebSocket
    Now includes safety monitoring for weather, piracy, and port congestion
    
    NOTE: WebSocket functionality requires channels to be installed and Daphne server to be running
    For development without channels, this will just save notifications to the database
    """
    
    channel_layer = None
    
    # Notification type constants
    TYPE_INFO = 'info'
    TYPE_WARNING = 'warning'
    TYPE_ALERT = 'alert'
    TYPE_UPDATE = 'update'
    
    # Event type constants
    EVENT_POSITION = 'position_update'
    EVENT_ARRIVAL = 'arrival'
    EVENT_DEPARTURE = 'departure'
    EVENT_WEATHER = 'weather_alert'
    EVENT_PIRACY = 'piracy_risk'
    EVENT_CONGESTION = 'port_congestion'
    
    @staticmethod
    def _get_channel_layer():
        """Lazily import and return channel layer if available"""
        if NotificationService.channel_layer is not None:
            return NotificationService.channel_layer
        
        try:
            from channels.layers import get_channel_layer # type: ignore
            NotificationService.channel_layer = get_channel_layer()
            return NotificationService.channel_layer
        except ImportError:
            return None
    
    @staticmethod
    def _map_alert_type_to_event_type(alert_type):
        """
        Map alert types to Event model event types
        """
        mapping = {
            'position_update': 'other',
            'departure': 'departure',
            'arrival': 'arrival',
            'speed_change': 'other',
            'course_change': 'other',
            'weather_alert': 'incident',
            'piracy_risk': 'incident',
            'port_congestion': 'other',
        }
        return mapping.get(alert_type, 'other')
    
    @staticmethod
    def _map_alert_type_to_notification_event_type(alert_type):
        """
        Map alert types to Notification model event_type field
        """
        mapping = {
            'position_update': 'position_update',
            'departure': 'departure',
            'arrival': 'arrival',
            'speed_change': 'position_update',
            'course_change': 'position_update',
            'weather_alert': 'unknown',
            'piracy_risk': 'unknown',
            'port_congestion': 'unknown',
        }
        return mapping.get(alert_type, 'unknown')
    
    @staticmethod
    def send_notification(user_id, vessel_id, message, notification_type='info', alert_type='position_update', location=None):
        """
        Send notification to a user via WebSocket and save to database
        
        Args:
            user_id: ID of user to notify
            vessel_id: ID of vessel related to notification
            message: Notification message text
            notification_type: Type of notification (info, warning, alert, update)
            alert_type: Type of alert (position_update, departure, arrival, weather_alert, etc.)
            location: Location string for the event
        """
        try:
            # Get user and vessel objects
            user = User.objects.get(id=user_id)
            vessel = Vessel.objects.get(id=vessel_id)
            
            # Create Event first
            event_type = NotificationService._map_alert_type_to_event_type(alert_type)
            notification_event_type = NotificationService._map_alert_type_to_notification_event_type(alert_type)
            
            # Determine location
            if not location:
                if vessel.last_position_lat and vessel.last_position_lon:
                    location = f"{vessel.last_position_lat:.4f}°, {vessel.last_position_lon:.4f}°"
                else:
                    location = "Unknown"
            
            # Create Event record
            event = Event.objects.create(
                vessel=vessel,
                event_type=event_type,
                location=location,
                timestamp=timezone.now(),
                details=message
            )
            
            # Create notification in database with proper event_id and event_type
            notification = Notification.objects.create(
                user_id=user_id,
                vessel_id=vessel_id,
                event_id=event.id,
                message=message,
                type=notification_type,
                event_type=notification_event_type,
                timestamp=timezone.now(),
                is_read=False
            )
            
            # Try to send via WebSocket if channels is available
            channel_layer = NotificationService._get_channel_layer()
            if channel_layer:
                try:
                    from asgiref.sync import async_to_sync
                    
                    # Prepare notification data for WebSocket
                    notification_data = {
                        'type': 'notification.message',
                        'notification': {
                            'id': notification.id,
                            'user_id': user.id,
                            'vessel_id': vessel_id,
                            'vessel_name': vessel.name,
                            'event_id': event.id,
                            'event_type': notification_event_type,
                            'message': message,
                            'notification_type': notification_type,
                            'timestamp': notification.timestamp.isoformat(),
                            'is_read': False
                        }
                    }
                    
                    # Send to user's WebSocket group
                    user_group_name = f'user_{user_id}'
                    async_to_sync(channel_layer.group_send)(
                        user_group_name,
                        notification_data
                    )
                    logger.info(f"✅ WebSocket notification sent to {user.username} for {vessel.name}")
                except Exception as ws_error:
                    logger.warning(f"⚠️ WebSocket send skipped: {str(ws_error)}")
            else:
                logger.info(f"ℹ️ Notification saved to DB for {user.username} (WebSocket not available)")
            
            return notification
        
        except User.DoesNotExist:
            logger.error(f"❌ User {user_id} not found")
            return None
        except Vessel.DoesNotExist:
            logger.error(f"❌ Vessel {vessel_id} not found")
            return None
        except Exception as e:
            logger.error(f"❌ Error sending notification: {str(e)}")
            return None
    
    @staticmethod
    def notify_subscribed_users(vessel_id, alert_type, message, notification_type='alert', location=None):
        """
        Notify all users subscribed to a vessel
        
        Args:
            vessel_id: ID of vessel
            alert_type: Type of alert (position_update, departure, arrival, weather_alert, etc.)
            message: Alert message text
            notification_type: Type of notification (info, warning, alert, update)
            location: Location string for the event
        
        Returns:
            int: Number of notifications sent
        """
        try:
            # Get all active subscriptions for this vessel
            subscriptions = VesselSubscription.objects.filter(
                vessel_id=vessel_id,
                is_active=True
            ).filter(
                Q(alert_type='all') | Q(alert_type=alert_type)
            ).select_related('user', 'vessel')
            
            count = 0
            for subscription in subscriptions:
                NotificationService.send_notification(
                    user_id=subscription.user_id,
                    vessel_id=vessel_id,
                    message=message,
                    notification_type=notification_type,
                    alert_type=alert_type,
                    location=location
                )
                count += 1
            
            if count > 0:
                logger.info(f"✅ Notified {count} users about {alert_type} for vessel {vessel_id}")
            else:
                logger.info(f"ℹ️ No active subscriptions for vessel {vessel_id}")
            
            return count
        
        except Exception as e:
            logger.error(f"❌ Error notifying subscribed users: {str(e)}")
            return 0
    
    @staticmethod
    def notify_position_update(vessel_id, latitude, longitude, speed):
        """
        Notify subscribed users about vessel position update
        
        Args:
            vessel_id: ID of vessel
            latitude: New latitude
            longitude: New longitude
            speed: Vessel speed in knots
        """
        try:
            vessel = Vessel.objects.get(id=vessel_id)
            location = f"{latitude:.4f}°, {longitude:.4f}°"
            message = f"📍 {vessel.name} position updated: {location} | Speed: {speed:.1f} knots"
            
            NotificationService.notify_subscribed_users(
                vessel_id=vessel_id,
                alert_type='position_update',
                message=message,
                notification_type=NotificationService.TYPE_UPDATE,
                location=location
            )
        except Exception as e:
            logger.error(f"❌ Error in notify_position_update: {str(e)}")
    
    # ========================================
    # SAFETY MONITORING FEATURES
    # ========================================
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """
        Calculate distance between two coordinates in kilometers
        Using Haversine formula
        """
        R = 6371  # Earth radius in km
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c
    
    @staticmethod
    def check_weather_alerts(vessel):
        """
        Check for weather alerts near vessel position from database
        Returns: List of weather alerts with distance info
        """
        try:
            if not vessel.last_position_lat or not vessel.last_position_lon:
                return []
            
            # Get active weather alerts that haven't expired
            weather_alerts = WeatherAlert.objects.filter(
                is_active=True
            ).filter(
                Q(alert_expires__gt=timezone.now()) | Q(alert_expires__isnull=True)
            )
            
            nearby_alerts = []
            for alert in weather_alerts:
                distance = NotificationService.calculate_distance(
                    vessel.last_position_lat,
                    vessel.last_position_lon,
                    alert.latitude,
                    alert.longitude
                )
                
                # Check if vessel is within alert radius
                if distance <= alert.radius_km:
                    nearby_alerts.append({
                        'alert': alert,
                        'distance': distance
                    })
            
            return nearby_alerts
            
        except Exception as e:
            logger.error(f"Error checking weather alerts: {str(e)}")
            return []
    
    @staticmethod
    def check_piracy_risk(vessel):
        """
        Check if vessel is in or near a piracy zone
        Returns: List of nearby piracy zones with distance
        """
        try:
            if not vessel.last_position_lat or not vessel.last_position_lon:
                return []
            
            # Get active piracy zones
            piracy_zones = PiracyZone.objects.filter(is_active=True)
            
            nearby_zones = []
            for zone in piracy_zones:
                distance = NotificationService.calculate_distance(
                    vessel.last_position_lat,
                    vessel.last_position_lon,
                    zone.latitude,
                    zone.longitude
                )
                
                # Check if vessel is within zone radius
                if distance <= zone.radius_km:
                    nearby_zones.append({
                        'zone': zone,
                        'distance': distance
                    })
            
            return nearby_zones
            
        except Exception as e:
            logger.error(f"Error checking piracy risk: {str(e)}")
            return []
    
    @staticmethod
    def check_port_congestion(vessel):
        """
        Check if vessel is heading to a congested port
        Returns: Port object if congested, None otherwise
        """
        try:
            if not vessel.destination:
                return None
            
            # Find port by destination name (approximate match)
            ports = Port.objects.filter(
                name__icontains=vessel.destination.split(',')[0].strip()
            )
            
            for port in ports:
                # Check if port is highly congested (threshold: 7.0)
                if port.congestion_score >= 7.0:
                    return port
            
            return None
            
        except Exception as e:
            logger.error(f"Error checking port congestion: {str(e)}")
            return None
    
    @staticmethod
    def notify_weather_alert(vessel, alert_info):
        """
        Send weather alert notification to subscribed users
        """
        try:
            alert = alert_info['alert']
            distance = alert_info['distance']
            
            # Build message based on severity
            severity_emoji = {
                'extreme': '🌪️',
                'severe': '⚠️',
                'moderate': '🌧️',
                'minor': '☁️'
            }
            emoji = severity_emoji.get(alert.severity, '🌧️')
            
            message = (
                f"{emoji} WEATHER ALERT: {alert.get_weather_type_display()} "
                f"({alert.get_severity_display().upper()}) near {vessel.name} - "
                f"{distance:.1f} km away"
            )
            
            if alert.wind_speed_kmh:
                message += f" | Wind: {alert.wind_speed_kmh} km/h"
            if alert.wave_height_m:
                message += f" | Waves: {alert.wave_height_m}m"
            
            return NotificationService.notify_subscribed_users(
                vessel_id=vessel.id,
                alert_type='weather_alert',
                message=message,
                notification_type=NotificationService.TYPE_ALERT
            )
        except Exception as e:
            logger.error(f"Error sending weather alert: {str(e)}")
            return 0
    
    @staticmethod
    def notify_piracy_risk(vessel, zone_info):
        """
        Send piracy risk notification to subscribed users
        """
        try:
            zone = zone_info['zone']
            distance = zone_info['distance']
            
            message = (
                f"🏴‍☠️ PIRACY RISK: {vessel.name} is {distance:.1f} km from {zone.name} "
                f"({zone.risk_level.upper()} risk zone) - {zone.incidents_90_days} incidents in last 90 days"
            )
            
            return NotificationService.notify_subscribed_users(
                vessel_id=vessel.id,
                alert_type='piracy_risk',
                message=message,
                notification_type=NotificationService.TYPE_ALERT
            )
        except Exception as e:
            logger.error(f"Error sending piracy alert: {str(e)}")
            return 0
    
    @staticmethod
    def notify_port_congestion(vessel, port):
        """
        Send port congestion notification to subscribed users
        """
        try:
            message = (
                f"⚓ PORT CONGESTION: {vessel.name} heading to {port.name} - "
                f"High congestion (score: {port.congestion_score:.1f}, "
                f"avg wait time: {port.avg_wait_time:.1f}h)"
            )
            
            return NotificationService.notify_subscribed_users(
                vessel_id=vessel.id,
                alert_type='port_congestion',
                message=message,
                notification_type=NotificationService.TYPE_WARNING
            )
        except Exception as e:
            logger.error(f"Error sending congestion alert: {str(e)}")
            return 0
    
    @staticmethod
    def run_safety_checks_for_vessel(vessel):
        """
        Run all safety checks for a vessel and send appropriate notifications
        
        Returns: dict with check results
        """
        results = {
            'vessel_id': vessel.id,
            'vessel_name': vessel.name,
            'weather_alerts': 0,
            'piracy_alerts': 0,
            'congestion_alerts': 0,
            'total_notifications': 0
        }
        
        try:
            # Check weather alerts
            weather_alerts = NotificationService.check_weather_alerts(vessel)
            for alert_info in weather_alerts:
                count = NotificationService.notify_weather_alert(vessel, alert_info)
                results['weather_alerts'] += 1
                results['total_notifications'] += count
            
            # Check piracy risks
            piracy_zones = NotificationService.check_piracy_risk(vessel)
            for zone_info in piracy_zones:
                count = NotificationService.notify_piracy_risk(vessel, zone_info)
                results['piracy_alerts'] += 1
                results['total_notifications'] += count
            
            # Check port congestion
            congested_port = NotificationService.check_port_congestion(vessel)
            if congested_port:
                count = NotificationService.notify_port_congestion(vessel, congested_port)
                results['congestion_alerts'] += 1
                results['total_notifications'] += count
            
            if results['total_notifications'] > 0:
                logger.info(f"Safety checks completed for {vessel.name}: {results}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error running safety checks for {vessel.name}: {str(e)}")
            return results
    
    @staticmethod
    def run_safety_checks_for_all_vessels():
        """
        Run safety checks for all vessels with active subscriptions
        
        Returns: Summary of all checks
        """
        try:
            # Get all vessels that have active subscriptions
            subscribed_vessel_ids = VesselSubscription.objects.filter(
                is_active=True
            ).values_list('vessel_id', flat=True).distinct()
            
            vessels = Vessel.objects.filter(
                id__in=subscribed_vessel_ids,
                last_position_lat__isnull=False,
                last_position_lon__isnull=False
            )
            
            summary = {
                'total_vessels_checked': vessels.count(),
                'total_weather_alerts': 0,
                'total_piracy_alerts': 0,
                'total_congestion_alerts': 0,
                'total_notifications_sent': 0,
                'timestamp': timezone.now().isoformat()
            }
            
            for vessel in vessels:
                results = NotificationService.run_safety_checks_for_vessel(vessel)
                summary['total_weather_alerts'] += results['weather_alerts']
                summary['total_piracy_alerts'] += results['piracy_alerts']
                summary['total_congestion_alerts'] += results['congestion_alerts']
                summary['total_notifications_sent'] += results['total_notifications']
            
            logger.info(f"Completed safety checks for all vessels: {summary}")
            return summary
            
        except Exception as e:
            logger.error(f"Error running safety checks for all vessels: {str(e)}")
            return {
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }