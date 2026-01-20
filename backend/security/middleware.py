# security/middleware.py - SECURITY HARDENING
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
import time
import logging
import hashlib

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    """Enhanced security middleware for API protection"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Pre-request security checks
        if not self.security_checks(request):
            return JsonResponse(
                {'error': 'Security check failed'}, 
                status=403
            )

        response = self.get_response(request)
        
        # Post-request security headers
        self.add_security_headers(response)
        
        return response

    def security_checks(self, request):
        """Perform security checks on incoming requests"""
        
        # Check for suspicious patterns
        if self.is_suspicious_request(request):
            logger.warning(f"Suspicious request from {self.get_client_ip(request)}: {request.path}")
            return False
        
        # Rate limiting
        if not self.check_rate_limit(request):
            logger.warning(f"Rate limit exceeded for {self.get_client_ip(request)}")
            return False
        
        return True

    def is_suspicious_request(self, request):
        """Detect suspicious request patterns"""
        suspicious_patterns = [
            'admin', 'wp-admin', 'phpmyadmin', '.env', 'config',
            'backup', 'sql', 'dump', '../', '..\\', 'script',
            'eval(', 'exec(', 'system(', 'shell_exec'
        ]
        
        path = request.path.lower()
        query = request.GET.urlencode().lower()
        
        for pattern in suspicious_patterns:
            if pattern in path or pattern in query:
                return True
        
        return False

    def check_rate_limit(self, request):
        """Implement rate limiting per IP"""
        if not getattr(settings, 'RATELIMIT_ENABLE', True):
            return True
        
        client_ip = self.get_client_ip(request)
        cache_key = f"rate_limit:{client_ip}"
        
        # Get current request count
        current_requests = cache.get(cache_key, 0)
        
        # Rate limits per endpoint type
        if request.path.startswith('/api/users/auth/'):
            limit = 5  # 5 auth requests per minute
            window = 60
        elif request.path.startswith('/api/admin/'):
            limit = 10  # 10 admin requests per minute
            window = 60
        else:
            limit = 100  # 100 general requests per minute
            window = 60
        
        if current_requests >= limit:
            return False
        
        # Increment counter
        cache.set(cache_key, current_requests + 1, window)
        return True

    def get_client_ip(self, request):
        """Get real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def add_security_headers(self, response):
        """Add security headers to response"""
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'