from rest_framework import permissions


class IsOperator(permissions.BasePermission):
    """
    Permission class for Operator role
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'OPERATOR'


class IsAnalyst(permissions.BasePermission):
    """
    Permission class for Analyst role
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ANALYST', 'ADMIN']


class IsAdmin(permissions.BasePermission):
    """
    Permission class for Admin role
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'
