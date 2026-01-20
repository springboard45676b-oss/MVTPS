#!/usr/bin/env python3
"""
Debug the property issue specifically
"""

import os
import sys
import django

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from django.conf import settings

class TestService:
    @property
    def api_key(self):
        """Test property implementation"""
        print(f"   Property called - settings available: {hasattr(settings, 'AISSTREAM_API_KEY')}")
        key = getattr(settings, 'AISSTREAM_API_KEY', None)
        print(f"   Property returning: {key}")
        return key

def main():
    print("🧪 Property Debug Test")
    print("=" * 25)
    
    # Test settings directly
    print("1. Direct settings test:")
    key = getattr(settings, 'AISSTREAM_API_KEY', None)
    print(f"   Direct key: {key}")
    
    # Test with test service
    print("\n2. Test service property:")
    test_service = TestService()
    prop_key = test_service.api_key
    print(f"   Property result: {prop_key}")
    
    # Test actual service
    print("\n3. Actual AIS service:")
    from vessels.aisstream_service import AISStreamService
    
    service = AISStreamService()
    print(f"   Service type: {type(service)}")
    print(f"   Has api_key attr: {hasattr(service, 'api_key')}")
    
    # Call property with debug
    print("   Calling api_key property...")
    actual_key = service.api_key
    print(f"   Actual service key: {actual_key}")
    
    # Check if it's a method vs property
    import inspect
    print(f"   api_key is property: {isinstance(inspect.getattr_static(service.__class__, 'api_key'), property)}")

if __name__ == "__main__":
    main()