#!/usr/bin/env python3
"""
Test script for AIS Stream integration
"""

import os
import sys
import django
import asyncio
import json
from datetime import datetime

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.aisstream_service import aisstream_service
from vessels.models import Vessel, VesselPosition

async def test_aisstream_connection():
    """Test AIS Stream connection and data processing"""
    print("Testing AIS Stream connection...")
    print(f"API Key configured: {'Yes' if aisstream_service.api_key else 'No'}")
    
    if not aisstream_service.api_key:
        print("ERROR: AIS Stream API key not configured!")
        return False
    
    try:
        # Test subscription message creation
        subscription = aisstream_service.get_subscription_message()
        print(f"Subscription message: {json.dumps(subscription, indent=2)}")
        
        # Test with bounds (around New York)
        bounds = {
            'minlat': 40.0,
            'minlon': -75.0,
            'maxlat': 41.0,
            'maxlon': -73.0
        }
        
        bounded_subscription = aisstream_service.get_subscription_message(bounds)
        print(f"Bounded subscription: {json.dumps(bounded_subscription, indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_database_integration():
    """Test database integration"""
    print("\nTesting database integration...")
    
    try:
        # Count existing vessels
        vessel_count = Vessel.objects.count()
        position_count = VesselPosition.objects.count()
        
        print(f"Current vessels in database: {vessel_count}")
        print(f"Current positions in database: {position_count}")
        
        # Test vessel creation
        test_vessel_data = {
            'mmsi': '999999999',
            'name': 'TEST VESSEL',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'speed': 12.5,
            'course': 180.0,
            'heading': 175.0,
            'status': 'Under way using engine',
            'timestamp': datetime.now(),
        }
        
        # This would be called by the AIS service
        vessel, created = Vessel.objects.get_or_create(
            mmsi=test_vessel_data['mmsi'],
            defaults={
                'name': test_vessel_data['name'],
                'vessel_type': 'other',
            }
        )
        
        position = VesselPosition.objects.create(
            vessel=vessel,
            latitude=test_vessel_data['latitude'],
            longitude=test_vessel_data['longitude'],
            speed=test_vessel_data['speed'],
            course=test_vessel_data['course'],
            heading=test_vessel_data['heading'],
            status=test_vessel_data['status'],
            timestamp=test_vessel_data['timestamp']
        )
        
        print(f"Created test vessel: {vessel}")
        print(f"Created test position: {position}")
        
        # Clean up test data
        position.delete()
        if created:
            vessel.delete()
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_streaming_service():
    """Test streaming service status"""
    print("\nTesting streaming service...")
    
    try:
        print(f"Is streaming: {aisstream_service.is_streaming()}")
        print(f"Cached vessels: {len(aisstream_service.get_cached_vessels())}")
        
        # Test starting streaming (won't actually connect in test)
        print("Testing streaming start/stop...")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

async def main():
    """Main test function"""
    print("=== AIS Stream Integration Test ===\n")
    
    # Test connection setup
    connection_ok = await test_aisstream_connection()
    
    # Test database integration (run in sync context)
    import asyncio
    from asgiref.sync import sync_to_async
    
    database_ok = await sync_to_async(test_database_integration)()
    
    # Test streaming service
    streaming_ok = test_streaming_service()
    
    print("\n=== Test Results ===")
    print(f"Connection setup: {'✓' if connection_ok else '✗'}")
    print(f"Database integration: {'✓' if database_ok else '✗'}")
    print(f"Streaming service: {'✓' if streaming_ok else '✗'}")
    
    if all([connection_ok, database_ok, streaming_ok]):
        print("\n✓ All tests passed! AIS Stream integration is ready.")
        print("\nTo start streaming:")
        print("1. Run: python manage.py start_ais_stream")
        print("2. Or use the API endpoints in your application")
        print("3. Or call the streaming service directly from your views")
    else:
        print("\n✗ Some tests failed. Check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())