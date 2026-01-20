from django.contrib import admin
from django.urls import path, include
from coreapi.views import VesselListView, VoyageHistoryView # Ensure this line is correct
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')), 
    path('api/vessels/', VesselListView.as_view(), name='vessel-list'),
    path('api/vessels/<int:vessel_id>/history/', VoyageHistoryView.as_view(), name='voyage-history'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]