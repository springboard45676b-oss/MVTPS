#!/usr/bin/env python3
"""
Simple test script to verify WebSocket functionality
Run this after starting both backend and frontend servers
"""

import asyncio
import websockets
import json
import requests
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

async def test_websocket_connection():
    """Test WebSocket connection and message receiving"""
    
    # First, get a JWT token by logging in
    print("🔐 Getting authentication token...")
    
    # Create a test user if needed
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/auth/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access')
            print(f"✅ Successfully got token: {token[:20]}...")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Connection error: {e}")
        print("Make sure the backend server is running on http://localhost:8000")
        return
    
    # Test WebSocket connection
    print("\n🔌 Testing WebSocket connection...")
    
    try:
        # Connect to alerts WebSocket
        ws_url = f"{WS_URL}/ws/vessels/alerts/?token={token}"
        print(f"Connecting to: {ws_url}")
        
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Wait for messages
            print("⏳ Waiting for messages (will timeout after 30 seconds)...")
            
            try:
                # Set a timeout for receiving messages
                for message in asyncio.as_completed([websocket.recv()], timeout=30):
                    try:
                        data = await message
                        parsed_data = json.loads(data)
                        print(f"📨 Received message: {json.dumps(parsed_data, indent=2)}")
                    except json.JSONDecodeError:
                        print(f"📨 Received raw message: {data}")
                    except Exception as e:
                        print(f"❌ Error processing message: {e}")
                        
            except asyncio.TimeoutError:
                print("⏰ No messages received in 30 seconds (this is normal if no vessel positions are updating)")
            
    except websockets.exceptions.ConnectionClosed:
        print("❌ WebSocket connection closed")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        print("Make sure Redis is running and the backend is using daphne")

async def test_vessel_position_update():
    """Test creating a vessel position to trigger alerts"""
    
    print("\n🚢 Testing vessel position update...")
    
    # Get authentication token
    login_data = {
        "username": "testuser", 
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/auth/login/", json=login_data)
        if response.status_code != 200:
            print("❌ Cannot get token for position update test")
            return
            
        token = response.json().get('access')
        headers = {'Authorization': f'Bearer {token}'}
        
        # Get vessels
        vessels_response = requests.get(f"{BACKEND_URL}/api/vessels/", headers=headers)
        if vessels_response.status_code == 200:
            vessels = vessels_response.json().get('results', [])
            if vessels:
                vessel_id = vessels[0]['id']
                print(f"📋 Using vessel: {vessels[0]['name']} (ID: {vessel_id})")
                
                # Create a position update (this would normally be done by AIS data feed)
                position_data = {
                    "vessel": vessel_id,
                    "latitude": 17.385,
                    "longitude": 78.486,
                    "speed": 25.0,  # High speed to trigger alert
                    "course": 45.0,
                    "heading": 50.0,
                    "timestamp": datetime.now().isoformat()
                }
                
                # Note: This endpoint may not exist - you'd need to create it
                print("📍 Creating position update (this may require additional API endpoint)...")
                # position_response = requests.post(f"{BACKEND_URL}/api/vessels/positions/", 
                #                                 json=position_data, headers=headers)
                # print(f"Position update response: {position_response.status_code}")
                
            else:
                print("❌ No vessels found")
        else:
            print(f"❌ Failed to get vessels: {vessels_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error in position update test: {e}")

def main():
    print("🧪 WebSocket Test Suite")
    print("=" * 50)
    
    print("📋 Prerequisites:")
    print("1. Backend server running with: daphne backend.asgi:application -b 0.0.0.0 -p 8000")
    print("2. Redis server running")
    print("3. Test user exists (username: testuser, password: testpass123)")
    print("4. Frontend server running: npm run dev")
    print()
    
    # Run WebSocket test
    asyncio.run(test_websocket_connection())
    
    # Run position update test
    asyncio.run(test_vessel_position_update())
    
    print("\n🎯 Test completed!")
    print("If you see '✅ WebSocket connected successfully!' then the setup is working.")
    print("To see actual alerts, you need to:")
    print("1. Create vessel subscriptions via the API")
    print("2. Update vessel positions (via AIS feed or API)")

if __name__ == "__main__":
    main()
