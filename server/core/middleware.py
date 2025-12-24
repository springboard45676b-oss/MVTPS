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