from django.shortcuts import render
from rest_framework import generics
from .models import User, Vessel
from .serializers import UserSerializer, VesselSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from .utils import get_unctad_data  # <--- MAKE SURE YOU IMPORT THIS
from .models import Voyage  # Make sure Voyage is imported
from .serializers import VoyageSerializer # Import the new serializer
from .models import VesselLog
from .serializers import VesselLogSerializer


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

# 3. Vessel List for Map (Protected)
class VesselListView(generics.ListAPIView):
    queryset = Vessel.objects.all()
    serializer_class = VesselSerializer
    permission_classes = [IsAuthenticated]

# 4. UNCTAD Port Analytics (Public/Open for Dashboard)
def port_analytics_view(request):
    # Fetch real data for India (IN) from your utils.py
    # If utils.py fails, it returns safe defaults
    real_stats = get_unctad_data("IN") 
    
    # We combine Real UNCTAD data with simulated "live" congestion data
    # (Since real-time congestion requires a paid API)
    data = {
        "kpi": {
            "global_wait_time": 18.5, 
            "connectivity_index": real_stats['lsci'],        # REAL
            "connectivity_year": real_stats['lsci_year'],    # REAL
            "port_traffic": real_stats['traffic'],           # REAL
            "traffic_year": real_stats['traffic_year'],      # REAL
        },
        # Simulated chart data for the frontend graphs
        "charts": {
            "port_data": [
                {"name": "Singapore", "wait": 2.1, "arrivals": 400, "departures": 380},
                {"name": "Rotterdam", "wait": 3.4, "arrivals": 250, "departures": 240},
                {"name": "Shanghai", "wait": 2.1, "arrivals": 500, "departures": 490},
                {"name": "LA", "wait": 2.1, "arrivals": 180, "departures": 170},
                {"name": "Jebel Ali", "wait": 2.1, "arrivals": 150, "departures": 145},
                {"name": "Busan", "wait": 2.1, "arrivals": 300, "departures": 290},
                {"name": "Antwerp", "wait": 3.4, "arrivals": 220, "departures": 210},
            ],
            "trade_data": [
                {"month": "Jan", "import": 4000, "export": 2400},
                {"month": "Feb", "import": 3000, "export": 1398},
                {"month": "Mar", "import": 2000, "export": 9800},
                {"month": "Apr", "import": 2780, "export": 3908},
                {"month": "May", "import": 1890, "export": 4800},
                {"month": "Jun", "import": 2390, "export": 3800},
                {"month": "Jul", "import": 3490, "export": 4300},
            ]
        }
    }
    
    return JsonResponse(data)
class VoyageListView(generics.ListAPIView):
    queryset = Voyage.objects.all().order_by('-departure_time')
    serializer_class = VoyageSerializer
    permission_classes = [AllowAny]
class VesselHistoryView(generics.ListAPIView):
    serializer_class = VesselLogSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Get vessel_id from the URL (e.g., /api/history/1/)
        vessel_id = self.kwargs['pk']
        return VesselLog.objects.filter(vessel_id=vessel_id).order_by('timestamp')