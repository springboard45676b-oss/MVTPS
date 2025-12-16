# server/backend/core/permissions.py
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Only admin users can access this endpoint
    """
    message = 'Only administrators can access this resource.'
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsAnalystOrAdmin(permissions.BasePermission):
    """
    Analyst and Admin users can access this endpoint
    """
    message = 'Only analysts and administrators can access this resource.'
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['analyst', 'admin']
        )


class IsReadOnly(permissions.BasePermission):
    """
    Allow any authenticated user to read, but deny write for non-admins
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.role == 'admin')


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allow users to edit their own profile or admins to edit anyone's profile
    """
    message = 'You can only edit your own profile.'
    
    def has_object_permission(self, request, view, obj):
        # Allow owner or admin to edit
        return obj.id == request.user.id or request.user.role == 'admin'


class CanEditVessel(permissions.BasePermission):
    """
    Only admins can create, update, or delete vessels
    """
    message = 'Only administrators can modify vessel data.'
    
    def has_permission(self, request, view):
        # Allow read for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        # Only allow write for admins
        return bool(request.user and request.user.role == 'admin')