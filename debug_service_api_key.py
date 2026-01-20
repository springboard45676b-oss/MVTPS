#!/usr/bin/env python3
"""
Debug the AIS Stream service API key issue
"""

import os
import sys
import django

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from django.conf import settings

def test_direct_import():
    """Test importing and checking the service directly"""
    print("🔧 Direct Service Import Test")
    print("=" * 35)
    
    # Test settings first
    api_key_from_settings = getattr(settings, 'AISSTREAM_API_KEY', None)
    print(f"📋 Settings API Key: {api_key_from_settings}")
    print(f"📏 Length: {len(api_key_from_settings) if api_key_from_settings else 0}")
    
    # Import service fresh
    from vessels.aisstream_service import AISStreamService
    
    # Create new instance
    service = AISStreamService()
    print(f"🔧 Service API Key: {service.api_key}")
    
    # Test the property directly
    direct_key = getattr(settings, 'AISSTREAM_API_KEY', None)
    print(f"🎯 Direct getattr: {direct_key}")
    
    # Test if they match
    if service.api_key == api_key_from_settings:
        print("✅ Keys match!")
    else:
        print("❌ Keys don't match!")
        
    # Test if service can start
    if service.api_key:
        print("✅ Service has API key - should be able to start")
        
        # Try to start streaming
        print("🚀 Testing service start...")
        service.start_streaming()
        
        import time
        time.sleep(2)
        
        print(f"   Is streaming: {service.is_streaming()}")
        
        service.stop_streaming()
    else:
        print("❌ Service has no API key - cannot start")

def test_global_service():
    """Test the global service instance"""
    print("\n🌍 Global Service Instance Test")
    print("=" * 35)
    
    from vessels.aisstream_service import aisstream_service
    
    print(f"🔧 Global service API Key: {aisstream_service.api_key}")
    print(f"🌐 Is streaming: {aisstream_service.is_streaming()}")
    
    if aisstream_service.api_key:
        print("✅ Global service has API key")
    else:
        print("❌ Global service has no API key")

def main():
    print("🐛 AIS Stream Service API Key Debug")
    print("=" * 45)
    
    test_direct_import()
    test_global_service()
    
    print("\n" + "=" * 45)
    print("💡 If service still shows None:")
    print("   1. Restart Django server")
    print("   2. Check .env file is in backend/ directory")
    print("   3. Verify python-decouple is installed")

if __name__ == "__main__":
    main()