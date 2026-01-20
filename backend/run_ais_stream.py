#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now import and run the AIS stream
from services.ais_stream import start_ais_stream

if __name__ == "__main__":
    print("Starting AIS Stream (without Celery)...")
    start_ais_stream()