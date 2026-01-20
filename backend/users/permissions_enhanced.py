from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)

class BaseRolePermission(BasePermission):
    """Base class for role-based permissions with logging"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            logger.warning(f"Unauthenticated access attempt to {view.__class__.__name__}")
            return False
        
        if not hasattr(request.user, 'role'):
            logger.error(f"User {request.user.username} missing role attribute")
            return False
            
        return self.check_role_permission(request, view)
    
    def check_role_permission(self, request, view):
        """Override in subclasses"""
        return False

class IsOperatorOrAbove(BaseRolePermission):
    """Permission for Operator, Analyst, and Admin roles"""
    
    def check_role_permission(self, request, view):
        allowed_roles = ['operator', 'analyst', 'admin']
        has_permission = request.user.role in allowed_roles
        
        if not has_permission:
            logger.warning(f"Access denied: User {request.user.username} with role {request.user.role} attempted to access {view.__class__.__name__}")
        
        return has_permission

class IsAnalystOrAbove(BaseRolePermission):
    """Permission for Analyst and Admin roles only"""
    
    def check_role_permission(self, request, view):
        allowed_roles = ['analyst', 'admin']
        has_permission = request.user.role in allowed_roles
        
        if not has_permission:
            logger.warning(f"Analyst+ access denied: User {request.user.username} with role {request.user.role} attempted to access {view.__class__.__name__}")
        
        return has_permission

class IsAdminOnly(BaseRolePermission):
    """Permission for Admin role only"""
    
    def check_role_permission(self, request, view):
        has_permission = request.user.role == 'admin'
        
        if not has_permission:
            logger.warning(f"Admin access denied: User {request.user.username} with role {request.user.role} attempted to access {view.__class__.__name__}")
        
        return has_permission

class IsOwnerOrAdminOnly(BasePermission):
    """Allow access to object owner or admin only"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin can access everything
        if request.user.role == 'admin':
            return True
        
        # Check if user owns the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False

class ReadOnlyOrAdminWrite(BasePermission):
    """Read-only for non-admins, full access for admins"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions for authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.role in ['operator', 'analyst', 'admin']
        
        # Write permissions only for admins
        return request.user.role == 'admin'

# Method-level permission decorator
def require_role(allowed_roles):
    """Decorator to require specific roles for view methods"""
    def decorator(func):
        def wrapper(self, request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            
            if request.user.role not in allowed_roles:
                logger.warning(f"Role access denied: User {request.user.username} with role {request.user.role} attempted to access {func.__name__}")
                raise PermissionDenied(f"Required role: {' or '.join(allowed_roles)}")
            
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator