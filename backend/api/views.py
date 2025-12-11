from rest_framework import viewsets, status
from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Port, Vessel, Voyage
from .serializers import (
    PortSerializer,
    VesselSerializer,
    VoyageSerializer,
    UserSerializer,
    RegisterSerializer,
)

# -------------------------
# GENERIC ROLE-BASED PERMISSION
# -------------------------
class RolePermission(BasePermission):
    """
    Generic permission for allowed roles.
    Usage: set allowed_roles = ['admin', 'operator'] on viewset.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in self.allowed_roles

# -------------------------
# PORT VIEWSET
# -------------------------
class PortViewSet(viewsets.ModelViewSet):
    queryset = Port.objects.all()
    serializer_class = PortSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated()]
        # Only admin and operator can modify
        perm = RolePermission()
        perm.allowed_roles = ['admin', 'operator']
        return [perm]

# -------------------------
# VESSEL VIEWSET
# -------------------------
class VesselViewSet(viewsets.ModelViewSet):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated()]
        # Only admin can modify
        perm = RolePermission()
        perm.allowed_roles = ['admin']
        return [perm]

# -------------------------
# VOYAGE VIEWSET
# -------------------------
class VoyageViewSet(viewsets.ModelViewSet):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated()]
        # Only admin and analyst can modify
        perm = RolePermission()
        perm.allowed_roles = ['admin', 'analyst']
        return [perm]

# -------------------------
# CURRENT USER VIEW
# -------------------------
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# -------------------------
# USER REGISTRATION VIEW
# -------------------------
class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "User created successfully",
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
