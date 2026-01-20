#!/usr/bin/env python3
"""
Check if Django settings are loading the API key correctly
"""

import os
import sys
import django

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from django.conf import settings
from vessels.aisstream_service import aisstream_service

def main():
    print("🔧 Django Settings API Key Check")
    print("=" * 40)
    
    # Check settings
    api_key = getattr(settings, 'AISSTREAM_API_KEY', None)
    print(f"📋 Settings AISSTREAM_API_KEY: {api_key}")
    
    # Check service
    service_key = aisstream_service.api_key
    print(f"🔧 Service API Key: {service_key}")
    
    # Check if they match
    if api_key == service_key:
        print("✅ API keys match!")
    else:
        print("❌ API keys don't match!")
    
    # Check if key is valid format
    if api_key and len(api_key) == 32:
        print("✅ API key format looks correct (32 characters)")
    else:
        print(f"⚠️  API key format issue: length = {len(api_key) if api_key else 0}")
    
    # Test service connection
    print(f"\n🌐 Service Status:")
    print(f"   Is streaming: {aisstream_service.is_streaming()}")
    print(f"   Cached vessels: {len(aisstream_service.get_cached_vessels())}")
    
    # Start streaming test
    print(f"\n🚀 Starting AIS Stream...")
    aisstream_service.start_streaming()
    
    import time
    time.sleep(3)  # Wait 3 seconds
    
    print(f"   Is streaming now: {aisstream_service.is_streaming()}")
    print(f"   Cached vessels now: {len(aisstream_service.get_cached_vessels())}")

if __name__ == "__main__":
    main()