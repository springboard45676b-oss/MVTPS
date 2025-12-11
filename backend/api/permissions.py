from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOperator(permissions.BasePermission):
    """Allows access only to operator users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'operator'

class IsAnalyst(permissions.BasePermission):
    """Allows access only to analyst users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'analyst'

class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin can do anything; others can only read."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'
