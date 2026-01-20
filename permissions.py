from rest_framework import permissions

class IsOperatorOrAdmin(permissions.BasePermission):
    """
    Allows write access only to Operators or Admins.
    Analysts get Read-Only access.
    """
    def has_permission(self, request, view):
        # Allow any authenticated user to see data (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if the user has an 'operator' or 'admin' role for POST, PUT, DELETE
        return request.user.is_authenticated and request.user.role in ['operator', 'admin']