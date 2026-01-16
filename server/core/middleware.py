# core/middleware.py
from urllib.parse import parse_qs
from channels.db import database_sync_to_async # type: ignore
from channels.auth import AuthMiddlewareStack # type: ignore
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings

User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    """Get user by ID from database"""
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()
    except Exception:
        return AnonymousUser()


class TokenAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens
    from query parameters.
    """
    
    def __init__(self, inner):
        self.inner = inner
    
    async def __call__(self, scope, receive, send):
        """
        Process the scope and authenticate the user
        """
        close_old_connections()
        
        try:
            # Extract query string
            query_string = scope.get('query_string', b'').decode('utf8')
            
            # Parse query parameters
            query_params = parse_qs(query_string)
            
            # Get token from query string
            token_list = query_params.get('token', [])
            
            if not token_list:
                scope['user'] = AnonymousUser()
            else:
                token = token_list[0]
                
                try:
                    # Validate token format
                    UntypedToken(token)
                    
                    # Decode token
                    decoded_data = jwt_decode(
                        token,
                        settings.SECRET_KEY,
                        algorithms=['HS256']
                    )
                    
                    user_id = decoded_data.get('user_id')
                    
                    if user_id:
                        scope['user'] = await get_user(user_id)
                    else:
                        scope['user'] = AnonymousUser()
                
                except (InvalidToken, TokenError, Exception):
                    scope['user'] = AnonymousUser()
        
        except Exception:
            scope['user'] = AnonymousUser()
        
        # Call inner application with authenticated scope
        return await self.inner(scope, receive, send)


def TokenAuthMiddlewareStack(inner):
    """
    Wraps the TokenAuthMiddleware with Django's AuthMiddlewareStack
    for session and cookie support if needed.
    """
    return TokenAuthMiddleware(AuthMiddlewareStack(inner))

import time
import json
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from .models import UserAction

User = get_user_model()

class UserActionLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all user actions with response status codes
    """
    
    def process_request(self, request):
        request._start_time = time.time()
        return None
    
    def process_response(self, request, response):
        # Only log API requests
        if not request.path.startswith('/api/'):
            return response
        
        try:
            # Calculate duration
            duration_ms = None
            if hasattr(request, '_start_time'):
                duration_ms = int((time.time() - request._start_time) * 1000)
            
            # Get user info
            user = request.user if request.user.is_authenticated else None
            username = user.username if user else None
            
            # Determine action from endpoint
            action = self._get_action_from_path(request.path, request.method)
            
            # Get IP address
            ip_address = self._get_client_ip(request)
            
            # Extract request data (sanitized)
            request_data = self._sanitize_data(request)
            
            # Log the action
            UserAction.objects.create(
                user=user,
                username=username,
                action=action,
                status_code=response.status_code,
                endpoint=request.path,
                method=request.method,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                request_data=request_data,
                duration_ms=duration_ms,
            )
        except Exception as e:
            # Fail silently to not break the request
            print(f"Error logging user action: {e}")
        
        return response
    
    def _get_action_from_path(self, path, method):
        """Extract action name from URL path"""
        path_lower = path.lower()
        
        # Authentication
        if 'login' in path_lower:
            return 'login' if method == 'POST' else 'profile_view'
        if 'logout' in path_lower:
            return 'logout'
        if 'register' in path_lower:
            return 'register'
        if 'password' in path_lower:
            return 'password_change' if method in ['PUT', 'PATCH'] else 'password_reset'
        
        # User Profile
        if 'profile' in path_lower or 'user' in path_lower:
            if method == 'GET':
                return 'profile_view'
            elif method in ['PUT', 'PATCH']:
                return 'profile_edit'
            elif method == 'DELETE':
                return 'profile_delete'
        
        # Vessels
        if 'vessel' in path_lower:
            if method == 'GET':
                return 'vessel_list' if '/vessels/' in path or '/vessels' == path else 'vessel_view'
            elif method == 'POST':
                return 'vessel_create'
            elif method in ['PUT', 'PATCH']:
                return 'vessel_edit'
            elif method == 'DELETE':
                return 'vessel_delete'
        
        # Voyages
        if 'voyage' in path_lower:
            if method == 'GET':
                return 'voyage_list' if '/voyages/' in path or '/voyages' == path else 'voyage_view'
            elif method == 'POST':
                return 'voyage_create'
            elif method in ['PUT', 'PATCH']:
                return 'voyage_edit'
            elif method == 'DELETE':
                return 'voyage_delete'
        
        # Ports
        if 'port' in path_lower:
            if method == 'GET':
                return 'port_list' if '/ports/' in path or '/ports' == path else 'port_view'
            elif method in ['PUT', 'PATCH']:
                return 'port_edit'
        
        # Notifications
        if 'notification' in path_lower:
            if method == 'GET':
                return 'notification_list' if '/notifications/' in path else 'notification_view'
            elif 'mark' in path_lower or 'read' in path_lower:
                return 'notification_mark_read'
            elif method == 'DELETE':
                return 'notification_delete'
        
        # Subscriptions
        if 'subscription' in path_lower:
            if method == 'GET':
                return 'subscription_list'
            elif method == 'POST':
                return 'subscription_create'
            elif method == 'DELETE':
                return 'subscription_delete'
        
        # Alerts
        if 'alert' in path_lower:
            if method == 'GET':
                return 'alert_list' if '/alerts/' in path else 'alert_view'
            elif 'dismiss' in path_lower:
                return 'alert_dismiss'
        
        # Dashboard
        if 'dashboard' in path_lower:
            return 'dashboard_export' if method == 'GET' and 'export' in path_lower else 'dashboard_view'
        
        # Admin
        if 'admin' in path_lower:
            if 'log' in path_lower:
                return 'admin_logs_view'
            elif 'system' in path_lower:
                return 'admin_system_info'
            elif 'user' in path_lower:
                if method == 'GET':
                    return 'admin_user_list'
                elif method in ['PUT', 'PATCH']:
                    return 'admin_user_edit'
                elif method == 'DELETE':
                    return 'admin_user_delete'
        
        return 'unknown'
    
    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _sanitize_data(self, request):
        """Extract and sanitize request data"""
        try:
            if request.method == 'GET':
                return dict(request.GET) if request.GET else None
            
            # For POST/PUT/PATCH
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                # Remove sensitive fields
                sensitive_fields = ['password', 'token', 'secret', 'api_key']
                for field in sensitive_fields:
                    if field in data:
                        data[field] = '***REDACTED***'
                return data
        except:
            pass
        
        return None
