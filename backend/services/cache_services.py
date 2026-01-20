from django.core.cache import cache
from django.utils import timezone
import hashlib
import json

class CacheService:
    """Centralized caching service"""
    
    # Cache TTL constants
    VESSEL_DATA_TTL = 300      # 5 minutes
    WEATHER_DATA_TTL = 600     # 10 minutes
    PORT_DATA_TTL = 3600       # 1 hour
    ANALYTICS_TTL = 1800       # 30 minutes
    MOCK_DATA_TTL = 120        # 2 minutes
    
    @staticmethod
    def generate_cache_key(prefix, *args, **kwargs):
        """Generate a consistent cache key"""
        key_data = f"{prefix}_{args}_{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    @staticmethod
    def get_or_set(key, callable_func, ttl, *args, **kwargs):
        """Get from cache or set if not exists"""
        cached_data = cache.get(key)
        
        if cached_data is not None:
            return cached_data
        
        # Generate new data
        fresh_data = callable_func(*args, **kwargs)
        
        # Add timestamp
        if isinstance(fresh_data, dict):
            fresh_data['cached_at'] = timezone.now().isoformat()
        
        cache.set(key, fresh_data, ttl)
        return fresh_data
    
    @staticmethod
    def invalidate_pattern(pattern):
        """Invalidate cache keys matching pattern"""
        # Note: This is a simplified implementation
        # In production, consider using Redis pattern deletion
        pass
    
    @staticmethod
    def get_cache_stats():
        """Get cache statistics"""
        # This would return cache hit/miss stats in a real implementation
        return {
            'cache_backend': 'locmem',
            'timestamp': timezone.now().isoformat()
        }

class VesselCacheService(CacheService):
    """Vessel-specific caching service"""
    
    @staticmethod
    def get_vessels_cache_key(vessel_type=None, flag=None, is_active=True):
        """Generate cache key for vessel queries"""
        return CacheService.generate_cache_key(
            'vessels', 
            vessel_type=vessel_type, 
            flag=flag, 
            is_active=is_active
        )
    
    @staticmethod
    def get_live_tracking_cache_key():
        """Generate cache key for live tracking data"""
        return CacheService.generate_cache_key('live_tracking')

class AnalyticsCacheService(CacheService):
    """Analytics-specific caching service"""
    
    @staticmethod
    def get_dashboard_cache_key(dashboard_type, user_id=None):
        """Generate cache key for dashboard data"""
        return CacheService.generate_cache_key(
            f'dashboard_{dashboard_type}',
            user_id=user_id
        )

class PortCacheService(CacheService):
    """Port-specific caching service"""
    
    @staticmethod
    def get_congestion_cache_key():
        """Generate cache key for port congestion data"""
        return CacheService.generate_cache_key('port_congestion')
    
    @staticmethod
    def get_alerts_cache_key(wait_threshold, vessel_threshold):
        """Generate cache key for port alerts"""
        return CacheService.generate_cache_key(
            'port_alerts',
            wait_threshold=wait_threshold,
            vessel_threshold=vessel_threshold
        )