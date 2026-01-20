#!/usr/bin/env python3
"""
Test live AIS Stream connection
"""

import os
import sys
import django
import asyncio
import json
import signal
from datetime import datetime

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.aisstream_service import aisstream_service

async def test_live_connection():
    """Test actual connection to AIS Stream"""
    print("Testing live connection to AIS Stream...")
    print("This will connect for 30 seconds to test real data reception")
    print("Press Ctrl+C to stop early\n")
    
    # Set up bounds around a busy shipping area (English Channel)
    bounds = {
        'minlat': 50.0,
        'minlon': -2.0,
        'maxlat': 51.5,
        'maxlon': 2.0
    }
    
    print(f"Using bounds: {bounds}")
    print("Starting connection...\n")
    
    message_count = 0
    start_time = datetime.now()
    
    try:
        # Start streaming
        aisstream_service.start_streaming(bounds)
        
        # Monitor for 30 seconds
        for i in range(30):
            await asyncio.sleep(1)
            
            cached_vessels = aisstream_service.get_cached_vessels()
            current_count = len(cached_vessels)
            
            if current_count != message_count:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Received {current_count} vessels")
                message_count = current_count
                
                # Show sample vessel data
                if cached_vessels:
                    sample = cached_vessels[0]
                    print(f"  Sample: {sample['name']} ({sample['mmsi']}) at {sample['latitude']:.4f}, {sample['longitude']:.4f}")
            
            if not aisstream_service.is_streaming():
                print("Connection lost!")
                break
        
        print(f"\nTest completed. Total vessels received: {message_count}")
        
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        aisstream_service.stop_streaming()
        print("Streaming stopped")

if __name__ == "__main__":
    asyncio.run(test_live_connection())