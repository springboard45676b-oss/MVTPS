from celery import shared_task
from services.ais_stream import start_ais_stream

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=5, max_retries=3)
def ais_stream_task(self):
    """Start AIS stream in background worker"""
    try:
        start_ais_stream()
    except Exception as exc:
        print(f"AIS stream task failed: {exc}")
        raise self.retry(exc=exc)