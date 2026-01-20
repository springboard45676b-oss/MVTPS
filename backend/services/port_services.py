from django.db.models import Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta
from ports.models import Port, PortCongestion, UNCTADPortData, VesselMovement

class PortService:
    """Service layer for port-related business logic"""
    
    @staticmethod
    def get_active_ports():
        """Get all active ports"""
        return Port.objects.filter(is_active=True)
    
    @staticmethod
    def get_port_congestion_data():
        """Get port congestion data for all active ports"""
        ports_data = []
        ports = Port.objects.filter(is_active=True)
        
        for port in ports:
            latest_congestion = port.congestion_data.first()
            if latest_congestion:
                ports_data.append({
                    'id': port.id,
                    'port_name': port.name,
                    'port_code': port.code,
                    'country': port.country,
                    'latitude': port.latitude,
                    'longitude': port.longitude,
                    'congestion_level': latest_congestion.congestion_level,
                    'current_vessels': latest_congestion.current_vessels,
                    'waiting_vessels': latest_congestion.waiting_vessels,
                    'average_wait_time': latest_congestion.average_wait_time,
                    'arrivals_24h': latest_congestion.arrivals_24h,
                    'departures_24h': latest_congestion.departures_24h,
                    'timestamp': latest_congestion.timestamp
                })
        
        return ports_data
    
    @staticmethod
    def get_congestion_alerts(wait_threshold=24.0, vessel_threshold=10):
        """Get congestion alerts based on thresholds"""
        alerts = []
        ports = Port.objects.filter(is_active=True)
        
        for port in ports:
            latest = port.congestion_data.first()
            if latest:
                # High wait time alert
                if latest.average_wait_time > wait_threshold:
                    alerts.append({
                        'port_name': port.name,
                        'port_code': port.code,
                        'alert_type': 'high_wait_time',
                        'severity': 'high' if latest.average_wait_time > 48 else 'medium',
                        'message': f'Average wait time: {latest.average_wait_time:.1f} hours',
                        'current_value': latest.average_wait_time,
                        'threshold': wait_threshold,
                        'timestamp': latest.timestamp
                    })
                
                # Vessel congestion alert
                if latest.waiting_vessels > vessel_threshold:
                    alerts.append({
                        'port_name': port.name,
                        'port_code': port.code,
                        'alert_type': 'vessel_congestion',
                        'severity': 'high' if latest.waiting_vessels > 20 else 'medium',
                        'message': f'{latest.waiting_vessels} vessels waiting',
                        'current_value': latest.waiting_vessels,
                        'threshold': vessel_threshold,
                        'timestamp': latest.timestamp
                    })
        
        return alerts
    
    @staticmethod
    def get_unctad_statistics():
        """Get UNCTAD port statistics"""
        return UNCTADPortData.objects.select_related('port').all()

class PortCongestionService:
    """Service layer for port congestion analytics"""
    
    @staticmethod
    def get_all_congestion_data():
        """Get all port congestion data"""
        return PortCongestion.objects.all()