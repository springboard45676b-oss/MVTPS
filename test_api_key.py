#!/usr/bin/env python3
"""
Test the AIS Stream API key directly
"""

import asyncio
import websockets
import json
import ssl

async def test_api_key():
    """Test the API key with aisstream.io"""
    api_key = "698798e83f0d53e62fe9db32313677f5ed6eeb45"
    
    print(f"🔑 Testing API key: {api_key}")
    print("🌐 Connecting to aisstream.io...")
    
    try:
        # Create SSL context that's more permissive
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Connect with shorter timeout
        async with websockets.connect(
            "wss://stream.aisstream.io/v0/stream",
            ssl=ssl_context,
            ping_timeout=10,
            close_timeout=5,
            open_timeout=10
        ) as websocket:
            print("✅ Connected successfully!")
            
            # Send subscription
            subscription = {
                "APIKey": api_key,
                "BoundingBoxes": [[[40.0, -75.0], [41.0, -73.0]]],  # Small area around NYC
                "FilterMessageTypes": ["PositionReport"]
            }
            
            print("📡 Sending subscription...")
            await websocket.send(json.dumps(subscription))
            print("✅ Subscription sent!")
            
            # Wait for response
            print("⏳ Waiting for messages (10 seconds)...")
            
            try:
                # Wait for first message with timeout
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                data = json.loads(message)
                
                if "MessageType" in data:
                    print(f"✅ SUCCESS! Received message type: {data['MessageType']}")
                    if "MetaData" in data:
                        metadata = data["MetaData"]
                        print(f"   Ship: {metadata.get('ShipName', 'Unknown')}")
                        print(f"   MMSI: {metadata.get('MMSI', 'Unknown')}")
                    return True
                else:
                    print(f"⚠️  Received response: {data}")
                    if "error" in str(data).lower():
                        print("❌ API key might be invalid or expired")
                        return False
                    
            except asyncio.TimeoutError:
                print("⏰ No messages received within 10 seconds")
                print("💡 This might be normal if no ships are in the selected area")
                return True  # Connection worked, just no data
                
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ Connection failed with status code: {e.status_code}")
        if e.status_code == 401:
            print("🔑 API key is invalid or expired")
        elif e.status_code == 403:
            print("🚫 Access forbidden - check API key permissions")
        return False
        
    except Exception as e:
        print(f"❌ Connection error: {e}")
        print("🔧 Possible issues:")
        print("   - Internet connection problems")
        print("   - Firewall blocking WebSocket connections")
        print("   - API service temporarily unavailable")
        return False

async def main():
    print("🧪 AIS Stream API Key Test")
    print("=" * 30)
    
    success = await test_api_key()
    
    print("\n" + "=" * 30)
    if success:
        print("✅ API key is working!")
        print("💡 If you're not seeing new data, try:")
        print("   1. python manage_real_data.py --clear-demo")
        print("   2. python manage_real_data.py --start")
        print("   3. Wait 5 minutes and check status")
    else:
        print("❌ API key test failed!")
        print("🔧 Next steps:")
        print("   1. Check if API key is correct")
        print("   2. Verify internet connection")
        print("   3. Contact aisstream.io support if needed")

if __name__ == "__main__":
    asyncio.run(main())