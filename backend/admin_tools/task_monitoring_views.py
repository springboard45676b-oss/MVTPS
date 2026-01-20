from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.utils import timezone
from celery.result import AsyncResult
from celery import current_app
from permissions import AdminToolsPermission
import logging

logger = logging.getLogger(__name__)

class TaskStatusView(APIView):
    permission_classes = [AdminToolsPermission]
    
    def get(self, request, task_id):
        """Get status of a specific Celery task"""
        try:
            result = AsyncResult(task_id)
            
            response_data = {
                'task_id': task_id,
                'status': result.status,
                'ready': result.ready(),
                'successful': result.successful() if result.ready() else None,
                'failed': result.failed() if result.ready() else None,
                'result': result.result if result.ready() and result.successful() else None,
                'traceback': result.traceback if result.failed() else None,
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error getting task status for {task_id}: {e}")
            return Response(
                {'error': f'Failed to get task status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CachedDataView(APIView):
    permission_classes = [AdminToolsPermission]
    
    def get(self, request, cache_key):
        """Get cached data by cache key"""
        try:
            cached_data = cache.get(cache_key)
            
            if cached_data is None:
                return Response(
                    {'error': 'Cache key not found or expired'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'cache_key': cache_key,
                'data': cached_data,
                'retrieved_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting cached data for {cache_key}: {e}")
            return Response(
                {'error': f'Failed to get cached data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TaskTriggerView(APIView):
    permission_classes = [AdminToolsPermission]
    
    def post(self, request):
        """Trigger async tasks manually"""
        try:
            task_type = request.data.get('task_type')
            task_params = request.data.get('params', {})
            
            if not task_type:
                return Response(
                    {'error': 'task_type is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Import tasks
            from tasks.external_api_tasks import (
                fetch_ais_hub_vessels_task,
                fetch_ais_stream_vessels_task,
                fetch_weather_data_task,
                sync_unctad_data_task,
                fetch_port_performance_task,
                fetch_live_vessels_mock_task
            )
            from tasks.comprehensive_async_tasks import (
                fetch_weather_data_comprehensive_task,
                sync_port_analytics_data_task,
                generate_safety_alerts_task,
                refresh_analytics_dashboard_task,
                batch_vessel_data_processing_task
            )
            
            # Task mapping
            task_map = {
                'ais_hub_vessels': fetch_ais_hub_vessels_task,
                'ais_stream_vessels': fetch_ais_stream_vessels_task,
                'weather_data': fetch_weather_data_task,
                'weather_comprehensive': fetch_weather_data_comprehensive_task,
                'unctad_sync': sync_unctad_data_task,
                'port_performance': fetch_port_performance_task,
                'port_analytics_sync': sync_port_analytics_data_task,
                'safety_alerts': generate_safety_alerts_task,
                'dashboard_refresh': refresh_analytics_dashboard_task,
                'batch_vessel_processing': batch_vessel_data_processing_task,
                'mock_vessels': fetch_live_vessels_mock_task
            }
            
            if task_type not in task_map:
                return Response(
                    {'error': f'Unknown task type: {task_type}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Trigger the task
            task_func = task_map[task_type]
            
            if task_params:
                task_result = task_func.delay(**task_params)
            else:
                task_result = task_func.delay()
            
            logger.info(f"Triggered task {task_type} with ID {task_result.id}")
            
            return Response({
                'success': True,
                'task_id': task_result.id,
                'task_type': task_type,
                'params': task_params,
                'triggered_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error triggering task: {e}")
            return Response(
                {'error': f'Failed to trigger task: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
@permission_classes([AdminToolsPermission])
def active_tasks_view(request):
    """Get list of active Celery tasks"""
    try:
        # Get active tasks from Celery
        inspect = current_app.control.inspect()
        active_tasks = inspect.active()
        
        if not active_tasks:
            return Response({
                'active_tasks': [],
                'total_active': 0,
                'timestamp': timezone.now().isoformat()
            })
        
        # Format active tasks
        formatted_tasks = []
        total_active = 0
        
        for worker, tasks in active_tasks.items():
            for task in tasks:
                formatted_tasks.append({
                    'worker': worker,
                    'task_id': task['id'],
                    'task_name': task['name'],
                    'args': task.get('args', []),
                    'kwargs': task.get('kwargs', {}),
                    'time_start': task.get('time_start')
                })
                total_active += 1
        
        return Response({
            'active_tasks': formatted_tasks,
            'total_active': total_active,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting active tasks: {e}")
        return Response(
            {'error': f'Failed to get active tasks: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AdminToolsPermission])
def cache_stats_view(request):
    """Get cache statistics and status"""
    try:
        # Get cache keys for monitoring
        cache_keys = [
            'ais_hub_vessels_*',
            'ais_stream_vessels_*',
            'weather_*',
            'port_performance_*',
            'port_analytics_*',
            'safety_alerts_summary',
            'dashboard_metrics',
            'unctad_last_sync',
            'port_analytics_last_sync'
        ]
        
        cache_status = {}
        
        # Check specific cache keys
        specific_keys = [
            'safety_alerts_summary',
            'dashboard_metrics',
            'unctad_last_sync',
            'port_analytics_last_sync'
        ]
        
        for key in specific_keys:
            cached_data = cache.get(key)
            cache_status[key] = {
                'exists': cached_data is not None,
                'data': cached_data if cached_data else None
            }
        
        return Response({
            'cache_status': cache_status,
            'monitored_keys': cache_keys,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        return Response(
            {'error': f'Failed to get cache stats: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )