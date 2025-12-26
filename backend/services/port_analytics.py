import requests
from django.conf import settings
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class UNCTADMaritimeAPI:
    """
    Integration with UNCTAD maritime and port statistics
    """
    def __init__(self):
        self.base_url = "https://unctadstat-api.unctad.org/bulkdownload"
        self.port_stats_url = "https://unctadstat.unctad.org/wds/TableViewer/tableView.aspx"
        
    def get_port_performance_data(self, port_code):
        """
        Fetch port performance indicators from UNCTAD
        Note: UNCTAD data is typically annual/quarterly, not real-time
        """
        try:
            # UNCTAD Port Performance indicators
            params = {
                'ReportId': 'US.SeaTransport',
                'IF_Language': 'eng',
                'Country': port_code[:2],  # Country code from UNLOCODE
            }
            
            response = requests.get(self.port_stats_url, params=params, timeout=30)
            if response.status_code == 200:
                return self._parse_unctad_data(response.text, port_code)
            return None
        except Exception as e:
            logger.error(f"UNCTAD API error: {e}")
            return None
    
    def _parse_unctad_data(self, data, port_code):
        """Parse UNCTAD response data"""
        # This would parse actual UNCTAD XML/JSON response
        # For now, return mock structure based on UNCTAD indicators
        return {
            'port_code': port_code,
            'container_throughput': 2500000,  # TEU per year
            'port_efficiency_index': 3.2,    # 1-5 scale
            'average_turnaround_time': 18.5,  # hours
            'berth_productivity': 85.2,       # moves per hour
            'port_connectivity_index': 78.5,  # UNCTAD connectivity index
            'last_updated': datetime.now().isoformat()
        }

class PortCongestionAnalyzer:
    """
    Analyze port congestion using multiple data sources
    """
    
    def __init__(self):
        self.unctad_api = UNCTADMaritimeAPI()
    
    def calculate_congestion_level(self, current_vessels, berths, waiting_vessels=0):
        """Calculate congestion level based on vessel count and berth capacity"""
        if berths == 0:
            return 'critical'
        
        utilization = (current_vessels + waiting_vessels) / berths
        
        if utilization <= 0.5:
            return 'low'
        elif utilization <= 0.8:
            return 'medium'
        elif utilization <= 1.2:
            return 'high'
        else:
            return 'critical'
    
    def calculate_wait_time_prediction(self, port, current_vessels, historical_data=None):
        """Predict wait time based on current congestion and historical patterns"""
        base_wait_time = 2.0  # Base 2 hours
        
        # Factor in current congestion
        congestion_multiplier = {
            'low': 1.0,
            'medium': 1.5,
            'high': 2.5,
            'critical': 4.0
        }
        
        congestion_level = self.calculate_congestion_level(
            current_vessels, port.berths
        )
        
        predicted_wait = base_wait_time * congestion_multiplier.get(congestion_level, 1.0)
        
        # Factor in port efficiency
        efficiency_factor = port.port_efficiency_index / 3.0  # Normalize to ~1.0
        predicted_wait = predicted_wait / max(efficiency_factor, 0.5)
        
        return round(predicted_wait, 1)
    
    def detect_congestion_alerts(self, port_congestion_data):
        """Detect and generate congestion alerts"""
        alerts = []
        
        for congestion in port_congestion_data:
            # High congestion alert
            if congestion.congestion_level == 'high':
                alerts.append({
                    'type': 'congestion_warning',
                    'port': congestion.port.name,
                    'level': 'high',
                    'message': f"High congestion at {congestion.port.name}: {congestion.current_vessels} vessels, {congestion.average_wait_time:.1f}h avg wait",
                    'timestamp': congestion.timestamp
                })
            
            # Critical congestion alert
            elif congestion.congestion_level == 'critical':
                alerts.append({
                    'type': 'congestion_critical',
                    'port': congestion.port.name,
                    'level': 'critical',
                    'message': f"CRITICAL congestion at {congestion.port.name}: {congestion.current_vessels} vessels, {congestion.average_wait_time:.1f}h avg wait",
                    'timestamp': congestion.timestamp
                })
            
            # Efficiency drop alert
            if congestion.throughput_efficiency < 0.7:
                alerts.append({
                    'type': 'efficiency_drop',
                    'port': congestion.port.name,
                    'level': 'medium',
                    'message': f"Port efficiency drop at {congestion.port.name}: {congestion.throughput_efficiency:.1%} of expected throughput",
                    'timestamp': congestion.timestamp
                })
        
        return alerts
    
    def generate_port_analytics(self, port):
        """Generate comprehensive port analytics"""
        latest_congestion = port.congestion_data.first()
        
        if not latest_congestion:
            return None
        
        # Get UNCTAD performance data
        unctad_data = self.unctad_api.get_port_performance_data(port.code)
        
        # Calculate 24h statistics
        movements_24h = port.vessel_movements.filter(
            actual_time__gte=datetime.now() - timedelta(hours=24)
        )
        
        arrivals_24h = movements_24h.filter(movement_type='arrival').count()
        departures_24h = movements_24h.filter(movement_type='departure').count()
        
        # Calculate average wait time
        recent_arrivals = port.vessel_movements.filter(
            movement_type='arrival',
            actual_time__gte=datetime.now() - timedelta(days=7),
            wait_time_hours__gt=0
        )
        
        avg_wait_time = recent_arrivals.aggregate(
            avg_wait=models.Avg('wait_time_hours')
        )['avg_wait'] or 0
        
        return {
            'port_name': port.name,
            'port_code': port.code,
            'current_congestion': {
                'level': latest_congestion.congestion_level,
                'vessels_in_port': latest_congestion.current_vessels,
                'waiting_vessels': latest_congestion.waiting_vessels,
                'utilization_percentage': port.congestion_percentage,
                'average_wait_time': latest_congestion.average_wait_time
            },
            'throughput_24h': {
                'arrivals': arrivals_24h,
                'departures': departures_24h,
                'net_change': arrivals_24h - departures_24h,
                'efficiency': latest_congestion.throughput_efficiency
            },
            'performance_indicators': {
                'berth_capacity': port.berths,
                'annual_throughput': port.annual_throughput,
                'efficiency_index': port.port_efficiency_index,
                'connectivity_index': unctad_data.get('port_connectivity_index', 0) if unctad_data else 0
            },
            'predictions': {
                'estimated_wait_time': self.calculate_wait_time_prediction(
                    port, latest_congestion.current_vessels
                ),
                'congestion_trend': self._analyze_congestion_trend(port)
            },
            'last_updated': latest_congestion.timestamp
        }
    
    def _analyze_congestion_trend(self, port):
        """Analyze congestion trend over last 24 hours"""
        recent_data = port.congestion_data.filter(
            timestamp__gte=datetime.now() - timedelta(hours=24)
        ).order_by('timestamp')
        
        if recent_data.count() < 2:
            return 'stable'
        
        first_reading = recent_data.first()
        last_reading = recent_data.last()
        
        vessel_change = last_reading.current_vessels - first_reading.current_vessels
        
        if vessel_change > 5:
            return 'increasing'
        elif vessel_change < -5:
            return 'decreasing'
        else:
            return 'stable'