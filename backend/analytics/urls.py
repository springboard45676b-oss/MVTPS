from django.urls import path
from .views import AdminDashboardView, AnalystDashboardView, OperatorDashboardView

urlpatterns = [
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('analyst-dashboard/', AnalystDashboardView.as_view(), name='analyst_dashboard'),
    path('operator-dashboard/', OperatorDashboardView.as_view(), name='operator_dashboard'),
]