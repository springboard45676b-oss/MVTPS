"""
Port Serializers
Handles port information, congestion tracking, and statistics
"""

from rest_framework import serializers
from ..models import Port, Voyage


class PortSerializer(serializers.ModelSerializer):
    """Port serializer with congestion data"""
    
    congestion_level = serializers.SerializerMethodField()
    status_indicator = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = (
            'id',
            'name',
            'location',
            'country',
            'latitude',
            'longitude',
            'congestion_score',
            'congestion_level',
            'avg_wait_time',
            'arrivals',
            'departures',
            'last_update',
            'status_indicator'
        )
        read_only_fields = ('id', 'last_update')
    
    def get_congestion_level(self, obj):
        if obj.congestion_score < 3:
            return 'low'
        elif obj.congestion_score < 6:
            return 'moderate'
        elif obj.congestion_score < 8:
            return 'high'
        else:
            return 'critical'
    
    def get_status_indicator(self, obj):
        level = self.get_congestion_level(obj)
        indicators = {
            'low': 'green',
            'moderate': 'yellow',
            'high': 'orange',
            'critical': 'red'
        }
        return indicators.get(level, 'gray')


class PortDetailedSerializer(serializers.ModelSerializer):
    """Detailed port serializer with statistics and recent activity"""
    
    congestion_level = serializers.SerializerMethodField()
    status_indicator = serializers.SerializerMethodField()
    total_traffic = serializers.SerializerMethodField()
    turnover_rate = serializers.SerializerMethodField()
    recent_arrivals = serializers.SerializerMethodField()
    recent_departures = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = Port
        fields = (
            'id',
            'name',
            'location',
            'country',
            'latitude',
            'longitude',
            'congestion_score',
            'congestion_level',
            'avg_wait_time',
            'arrivals',
            'departures',
            'total_traffic',
            'turnover_rate',
            'last_update',
            'status_indicator',
            'statistics',
            'recent_arrivals',
            'recent_departures'
        )
        read_only_fields = ('id', 'last_update')
    
    def get_congestion_level(self, obj):
        if obj.congestion_score < 3:
            return 'low'
        elif obj.congestion_score < 6:
            return 'moderate'
        elif obj.congestion_score < 8:
            return 'high'
        else:
            return 'critical'
    
    def get_status_indicator(self, obj):
        level = self.get_congestion_level(obj)
        indicators = {
            'low': 'green',
            'moderate': 'yellow',
            'high': 'orange',
            'critical': 'red'
        }
        return indicators.get(level, 'gray')
    
    def get_total_traffic(self, obj):
        return obj.arrivals + obj.departures
    
    def get_turnover_rate(self, obj):
        if obj.arrivals == 0:
            return 0
        return round((obj.departures / obj.arrivals) * 100, 2)
    
    def get_statistics(self, obj):
        completed_arrivals = Voyage.objects.filter(
            port_to=obj,
            status='completed'
        )
        
        wait_times = []
        for voyage in completed_arrivals:
            if voyage.wait_time_hours is not None:
                wait_times.append(voyage.wait_time_hours)
        
        return {
            'congestion': {
                'score': round(obj.congestion_score, 2),
                'level': self.get_congestion_level(obj),
                'avg_wait_time_hours': round(obj.avg_wait_time, 2)
            },
            'traffic': {
                'total': {
                    'arrivals': obj.arrivals,
                    'departures': obj.departures
                },
                'current_activity': {
                    'incoming_vessels': Voyage.objects.filter(
                        port_to=obj,
                        status='in_progress'
                    ).count(),
                    'outgoing_vessels': Voyage.objects.filter(
                        port_from=obj,
                        status='in_progress'
                    ).count()
                }
            },
            'performance': {
                'completed_arrivals': completed_arrivals.count(),
                'turnover_rate': round((obj.departures / obj.arrivals * 100) if obj.arrivals > 0 else 0, 2),
                'avg_wait_time_hours': round(obj.avg_wait_time, 2)
            }
        }
    
    def get_recent_arrivals(self, obj):
        from django.utils import timezone
        
        recent_voyages = Voyage.objects.filter(
            port_to=obj,
            arrival_time__lte=timezone.now(),
            status='completed'
        ).select_related('vessel').order_by('-arrival_time')[:5]
        
        return [{
            'vessel_name': v.vessel.name,
            'vessel_imo': v.vessel.imo_number,
            'arrival_time': v.arrival_time.isoformat(),
            'from_port': v.port_from.name,
            'wait_time_hours': v.wait_time_hours
        } for v in recent_voyages]
    
    def get_recent_departures(self, obj):
        from django.utils import timezone
        
        recent_voyages = Voyage.objects.filter(
            port_from=obj,
            departure_time__lte=timezone.now()
        ).select_related('vessel').order_by('-departure_time')[:5]
        
        return [{
            'vessel_name': v.vessel.name,
            'vessel_imo': v.vessel.imo_number,
            'departure_time': v.departure_time.isoformat(),
            'to_port': v.port_to.name,
            'status': v.status
        } for v in recent_voyages]