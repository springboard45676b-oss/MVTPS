#!/usr/bin/env python3
"""
Test with fresh service import
"""

import os
import sys

# Setup Django BEFORE any imports
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')

import django
django.setup()

# Now import after Django is set up
from django.conf import settings

def main():
    print("🔄 Fresh Service Import Test")
    print("=" * 35)
    
    # Check settings first
    api_key = getattr(settings, 'AISSTREAM_API_KEY', None)
    print(f"📋 Settings API Key: {api_key}")
    
    # Import service AFTER Django setup
    from vessels.aisstream_service import AISStreamService
    
    # Create fresh instance
    fresh_service = AISStreamService()
    print(f"🆕 Fresh service API key: {fresh_service.api_key}")
    print(f"🔧 Fresh service get_api_key(): {fresh_service.get_api_key()}")
    
    # Test the method directly
    direct_key = getattr(settings, 'AISSTREAM_API_KEY', None)
    print(f"🎯 Direct getattr in test: {direct_key}")
    
    # Test if fresh service works
    if fresh_service.api_key:
        print("✅ Fresh service has API key!")
        
        # Test connection
        print("🌐 Testing connection...")
        fresh_service.start_streaming()
        
        import time
        time.sleep(3)
        
        print(f"   Is streaming: {fresh_service.is_streaming()}")
        fresh_service.stop_streaming()
    else:
        print("❌ Fresh service still has no API key")
        
        # Debug the method
        print("🐛 Debugging get_api_key method:")
        try:
            method_result = fresh_service.get_api_key()
            print(f"   Method result: {method_result}")
        except Exception as e:
            print(f"   Method error: {e}")

if __name__ == "__main__":
    main()