#!/usr/bin/env python3
"""
Test script to verify voyage replay data is available
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_voyage_replay_data():
    print("🎞️ Testing Voyage Replay Data")
    print("=" * 40)
    
    # Login first
    login_response = requests.post(f"{BASE_URL}/auth/login/", data={
        "username": "admin",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token = login_response.json().get('access') or login_response.json().get('token')
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Login successful")
    
    # Test vessels endpoint
    print("\n1. Testing vessels endpoint...")
    vessels_response = requests.get(f"{BASE_URL}/vessels/", headers=headers)
    
    if vessels_response.status_code != 200:
        print(f"❌ Vessels request failed: {vessels_response.status_code}")
        return False
    
    vessels_data = vessels_response.json()
    vessels = vessels_data.get('results', vessels_data) if isinstance(vessels_data, dict) else vessels_data
    print(f"✅ Found {len(vessels)} vessels")
    
    if not vessels:
        print("❌ No vessels available for replay")
        return False
    
    # Test vessel track endpoint
    test_vessel = vessels[0]
    vessel_id = test_vessel['id']
    vessel_name = test_vessel['name']
    
    print(f"\n2. Testing track data for {vessel_name} (ID: {vessel_id})...")
    track_response = requests.get(f"{BASE_URL}/vessels/{vessel_id}/track/", headers=headers)
    
    if track_response.status_code != 200:
        print(f"❌ Track request failed: {track_response.status_code}")
        print(f"Response: {track_response.text}")
        return False
    
    track_data = track_response.json()
    positions = track_data.get('positions', [])
    print(f"✅ Found {len(positions)} position records for {vessel_name}")
    
    if positions:
        print(f"   First position: {positions[0]['timestamp']} at ({positions[0]['latitude']}, {positions[0]['longitude']})")
        print(f"   Last position: {positions[-1]['timestamp']} at ({positions[-1]['latitude']}, {positions[-1]['longitude']})")
    else:
        print("⚠️ No position data available - replay will be limited")
    
    print(f"\n✅ Voyage Replay data is ready!")
    print(f"   • {len(vessels)} vessels available")
    print(f"   • {len(positions)} positions for selected vessel")
    print(f"   • Ready for timeline scrubbing and playback")
    
    return True

if __name__ == "__main__":
    try:
        test_voyage_replay_data()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")