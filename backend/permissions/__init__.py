from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

class RoleBasedPermission(BasePermission):
    """
    Base class for role-based permissions with detailed error messages
    """
    required_roles = []
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        if user_role in self.required_roles:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class IsOperatorOrAbove(RoleBasedPermission):
    """
    Permission for Operator, Analyst, and Admin roles
    Basic vessel tracking and monitoring access
    """
    required_roles = ['operator', 'analyst', 'admin']

class IsAnalystOrAbove(RoleBasedPermission):
    """
    Permission for Analyst and Admin roles only
    Advanced analytics and reporting access
    """
    required_roles = ['analyst', 'admin']

class IsAdminOnly(RoleBasedPermission):
    """
    Permission for Admin role only
    System administration and configuration access
    """
    required_roles = ['admin']

class IsOperatorOnly(RoleBasedPermission):
    """
    Permission for Operator role only
    Basic operational access without analytics
    """
    required_roles = ['operator']

class IsAnalystOnly(RoleBasedPermission):
    """
    Permission for Analyst role only
    Analytics access without admin privileges
    """
    required_roles = ['analyst']

# Convenience permission combinations
class ReadOnlyForOperator(BasePermission):
    """
    Read-only access for operators, full access for analyst+
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Operators can only read
        if user_role == 'operator':
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        
        # Analysts and admins have full access
        return user_role in ['analyst', 'admin']

class SafeMethodsOrAnalyst(BasePermission):
    """
    Safe methods for all authenticated users, write methods for analyst+
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Safe methods for all authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return user_role in ['operator', 'analyst', 'admin']
        
        # Write methods only for analyst+
        return user_role in ['analyst', 'admin']

# Endpoint-specific permissions
class VesselTrackingPermission(IsOperatorOrAbove):
    """Vessel tracking and monitoring - all roles"""
    pass

class AnalyticsPermission(IsAnalystOrAbove):
    """Analytics and reporting - analyst+ only"""
    pass

class AdminToolsPermission(IsAdminOnly):
    """Admin tools and configuration - admin only"""
    pass

class SafetyPermission(IsOperatorOrAbove):
    """Safety alerts and incidents - all roles"""
    pass

class PortOperationsPermission(IsOperatorOrAbove):
    """Port operations and congestion - all roles"""
    pass

class UserManagementPermission(IsAdminOnly):
    """User management - admin only"""
    pass

class DataExportPermission(IsAnalystOrAbove):
    """Data export capabilities - analyst+ only"""
    pass