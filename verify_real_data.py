#!/usr/bin/env python3
"""
Verify that we're receiving real AIS data from aisstream.io
"""

import os
import sys
import django
import asyncio
import json
import websockets
from datetime import datetime

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, VesselPosition
from django.conf import settings

async def test_direct_aisstream_connection():
    """Test direct connection to AIS Stream to verify real data"""
    api_key = getattr(settings, 'AISSTREAM_API_KEY', None)
    
    if not api_key:
        print("❌ No AIS Stream API key configured!")
        return False
    
    print(f"🔑 Using API key: {api_key[:10]}...")
    print("🌐 Connecting directly to AIS Stream...")
    
    try:
        # Connect to AIS Stream with timeout
        async with websockets.connect(
            "wss://stream.aisstream.io/v0/stream",
            ping_timeout=20,
            close_timeout=10
        ) as websocket:
            print("✅ Connected to AIS Stream!")
            
            # Send subscription for a busy area (English Channel)
            subscription = {
                "APIKey": api_key,
                "BoundingBoxes": [[[50.0, -2.0], [51.5, 2.0]]],  # English Channel
                "FilterMessageTypes": ["PositionReport", "ShipStaticData"]
            }
            
            await websocket.send(json.dumps(subscription))
            print("📡 Subscription sent for English Channel area")
            print("⏳ Waiting for real AIS messages (30 seconds)...\n")
            
            message_count = 0
            unique_vessels = set()
            
            # Listen for messages with timeout
            try:
                timeout_task = asyncio.create_task(asyncio.sleep(30))
                
                async for message_json in websocket:
                    if timeout_task.done():
                        break
                        
                    message = json.loads(message_json)
                    message_count += 1
                    
                    if "MessageType" in message:
                        msg_type = message["MessageType"]
                        metadata = message.get("MetaData", {})
                        mmsi = metadata.get("MMSI")
                        ship_name = metadata.get("ShipName", "Unknown")
                        
                        if mmsi:
                            unique_vessels.add(mmsi)
                        
                        print(f"📨 Message #{message_count}: {msg_type}")
                        print(f"   🚢 Ship: {ship_name} (MMSI: {mmsi})")
                        
                        if msg_type == "PositionReport":
                            pos_data = message["Message"]["PositionReport"]
                            lat = pos_data.get("Latitude", 0)
                            lon = pos_data.get("Longitude", 0)
                            speed = pos_data.get("Sog", 0)
                            print(f"   📍 Position: {lat:.4f}, {lon:.4f}")
                            print(f"   🏃 Speed: {speed} knots")
                        
                        print(f"   🕐 Time: {datetime.now().strftime('%H:%M:%S')}")
                        print()
                        
                        # Stop after 5 messages for quick test
                        if message_count >= 5:
                            break
                
                timeout_task.cancel()
            
            except asyncio.TimeoutError:
                print("⏰ Timeout reached")
            
            print(f"📊 Summary:")
            print(f"   Total messages: {message_count}")
            print(f"   Unique vessels: {len(unique_vessels)}")
            
            if message_count > 0:
                print("✅ SUCCESS: Receiving real AIS data!")
                return True
            else:
                print("❌ No messages received - check API key or network")
                return False
                
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def check_database_data():
    """Check what data is currently in the database"""
    print("\n🗄️  Checking current database data...")
    
    vessels = Vessel.objects.all()
    positions = VesselPosition.objects.all().order_by('-timestamp')[:10]
    
    print(f"📈 Total vessels in database: {vessels.count()}")
    print(f"📈 Total positions in database: {VesselPosition.objects.count()}")
    
    print("\n🚢 Recent vessel positions:")
    for pos in positions:
        age = datetime.now() - pos.timestamp.replace(tzinfo=None)
        print(f"   {pos.vessel.name} ({pos.vessel.mmsi})")
        print(f"   📍 {pos.latitude:.4f}, {pos.longitude:.4f}")
        print(f"   🕐 {pos.timestamp} ({age.total_seconds():.0f}s ago)")
        print()

def identify_demo_vs_real_data():
    """Help identify if current data is demo or real"""
    print("\n🔍 Identifying data source...")
    
    # Demo vessels have specific MMSIs
    demo_mmsis = ['636019825', '353136000', '477995300', '311000274', '636017894']
    
    vessels = Vessel.objects.all()
    demo_count = 0
    real_count = 0
    
    for vessel in vessels:
        if vessel.mmsi in demo_mmsis:
            demo_count += 1
            print(f"🎭 DEMO: {vessel.name} ({vessel.mmsi})")
        else:
            real_count += 1
            print(f"🌍 REAL: {vessel.name} ({vessel.mmsi})")
    
    print(f"\n📊 Data breakdown:")
    print(f"   Demo vessels: {demo_count}")
    print(f"   Real vessels: {real_count}")
    
    if real_count > demo_count:
        print("✅ Majority of data appears to be REAL!")
    elif demo_count > 0 and real_count == 0:
        print("⚠️  Only demo data found - AIS streaming may not be active")
    else:
        print("🤔 Mixed data - some real, some demo")

async def main():
    """Main verification function"""
    print("🔍 AIS Stream Real Data Verification")
    print("=" * 40)
    
    # Test direct connection
    real_data_working = await test_direct_aisstream_connection()
    
    # Check database (run in sync context)
    from asgiref.sync import sync_to_async
    
    await sync_to_async(check_database_data)()
    await sync_to_async(identify_demo_vs_real_data)()
    
    print("\n" + "=" * 40)
    if real_data_working:
        print("✅ CONCLUSION: AIS Stream is working and providing real data!")
        print("\n💡 To start streaming into your database:")
        print("   1. python manage.py start_ais_stream")
        print("   2. Or use API: POST /api/vessels/ais-start/")
    else:
        print("❌ CONCLUSION: AIS Stream connection failed")
        print("\n🔧 Troubleshooting:")
        print("   1. Check your internet connection")
        print("   2. Verify API key is correct")
        print("   3. Check firewall settings")

if __name__ == "__main__":
    asyncio.run(main())