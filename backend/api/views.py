from django.shortcuts import render
from rest_framework import generics
from .models import User, Vessel
from .serializers import UserSerializer, VesselSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

# 1. User Registration (Public)
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# 2. Dashboard Data (Protected)
class RoleDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        
        # Custom logic based on Role
        if role == 'operator':
            message = "Hello Operator! Vessel controls are online."
        elif role == 'analyst':
            message = "Hello Analyst! Data reports are ready."
        elif role == 'admin':
            message = "Hello Admin! System configuration unlocked."
        else:
            message = "Welcome to the Maritime Portal."

        return Response({
            "message": message,
            "role": role,
            "username": user.username
        })

# 3. Vessel List for Map (Protected - Milestone 2)
class VesselListView(generics.ListAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [IsAuthenticated]