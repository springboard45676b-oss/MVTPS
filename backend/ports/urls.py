from django.urls import path
from . import views

urlpatterns = [
    path('', views.PortListView.as_view(), name='port-list'),
    path('<int:pk>/', views.PortDetailView.as_view(), name='port-detail'),
    path('<int:port_id>/congestion/', views.PortCongestionListView.as_view(), name='port-congestion'),
]