import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all apps including tasks package
app.autodiscover_tasks()
app.autodiscover_tasks(['tasks'])