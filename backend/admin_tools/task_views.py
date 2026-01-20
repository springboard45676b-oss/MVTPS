from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from tasks.external_api_tasks import get_task_status, get_cached_data
from django.core.cache import cache
from permissions import AdminToolsPermission

class TaskStatusView(APIView):
    """Get status of async tasks"""
    permission_classes = [AdminToolsPermission]
    
    def get(self, request, task_id):
        try:
            task_status = get_task_status(task_id)
            return Response(task_status)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CachedDataView(APIView):
    """Get cached data from completed tasks"""
    permission_classes = [AdminToolsPermission]
    
    def get(self, request, cache_key):
        try:
            cached_data = get_cached_data(cache_key)
            if cached_data is not None:
                return Response({
                    'cache_key': cache_key,
                    'data': cached_data,
                    'found': True
                })
            else:
                return Response({
                    'cache_key': cache_key,
                    'data': None,
                    'found': False
                })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AsyncTaskTriggerView(APIView):
    """Manually trigger async tasks for testing"""
    permission_classes = [AdminToolsPermission]
    
    def post(self, request):
        task_type = request.data.get('task_type')
        
        if task_type == 'ais_hub':
            from tasks.external_api_tasks import fetch_ais_hub_vessels_task
            result = fetch_ais_hub_vessels_task.delay(40.0, 60.0, -10.0, 10.0)
            return Response({'task_id': result.id, 'task_type': 'ais_hub'})
        
        elif task_type == 'weather':
            from tasks.external_api_tasks import fetch_weather_data_task
            lat = request.data.get('lat', 33.7)
            lng = request.data.get('lng', -118.2)
            result = fetch_weather_data_task.delay(lat, lng)
            return Response({'task_id': result.id, 'task_type': 'weather'})
        
        elif task_type == 'unctad':
            from tasks.external_api_tasks import sync_unctad_data_task
            result = sync_unctad_data_task.delay()
            return Response({'task_id': result.id, 'task_type': 'unctad'})
        
        else:
            return Response(
                {'error': 'Invalid task_type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )