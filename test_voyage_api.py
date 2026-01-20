#!/usr/bin/env python3
"""
Test voyage tracking API endpoints
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"  # Change this to your username
PASSWORD = "admin"  # Change this to your password

def get_auth_token():
    """Get JWT token for authentication"""
    response = requests.post(f"{BASE_URL}/auth/login/", {
        "username": USERNAME,
        "password": PASSWORD
    })
    
    if response.status_code == 200:
        return response.json()["access"]
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_vessel_list(token):
    """Get list of vessels"""
    print("🚢 Testing Vessel List...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/", headers=headers)
    
    if response.status_code == 200:
        vessels = response.json()["results"]
        print(f"✅ Found {len(vessels)} vessels")
        
        for vessel in vessels[:5]:  # Show first 5
            print(f"   • {vessel['name']} ({vessel['mmsi']}) - ID: {vessel['id']}")
            if vessel.get('active_voyage'):
                voyage = vessel['active_voyage']
                print(f"     🛣️  Active voyage: {voyage['start_port']} → {voyage.get('end_port', 'Ongoing')}")
        
        return vessels
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_vessel_track(token, vessel_id):
    """Test vessel track endpoint"""
    print(f"\n🗺️  Testing Vessel Track for ID {vessel_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/{vessel_id}/track/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        vessel = data['vessel']
        track = data['track']
        
        print(f"✅ Track for {vessel['name']}:")
        print(f"   📊 {data['total_positions']} positions")
        
        if track:
            latest = track[0]
            oldest = track[-1]
            print(f"   📍 Latest: {latest['latitude']:.4f}, {latest['longitude']:.4f} ({latest['timestamp']})")
            print(f"   📍 Oldest: {oldest['latitude']:.4f}, {oldest['longitude']:.4f} ({oldest['timestamp']})")
        
        return data
    else:
        print(f"❌ Failed: {response.text}")
        return None

def test_voyages_list(token):
    """Test voyages list"""
    print(f"\n🛣️  Testing Voyages List...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/voyages/", headers=headers)
    
    if response.status_code == 200:
        voyages = response.json()["results"]
        print(f"✅ Found {len(voyages)} voyages")
        
        for voyage in voyages[:5]:  # Show first 5
            status_icon = "🟢" if voyage['is_active'] else "✅"
            print(f"   {status_icon} {voyage['vessel_name']}: {voyage['start_port']} → {voyage.get('end_port', 'Ongoing')}")
            if voyage.get('distance_km'):
                print(f"      📏 {voyage['distance_km']:.1f} km, {voyage['duration_display']}")
        
        return voyages
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_voyage_track(token, voyage_id):
    """Test voyage track endpoint"""
    print(f"\n🗺️  Testing Voyage Track for ID {voyage_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/voyages/{voyage_id}/track/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        voyage = data['voyage']
        track = data['track']
        
        print(f"✅ Track for voyage: {voyage['vessel_name']}")
        print(f"   🛣️  {voyage['start_port']} → {voyage.get('end_port', 'Ongoing')}")
        print(f"   📊 {data['total_positions']} positions in voyage")
        
        if track:
            print(f"   📍 Start: {track[-1]['latitude']:.4f}, {track[-1]['longitude']:.4f}")
            print(f"   📍 End: {track[0]['latitude']:.4f}, {track[0]['longitude']:.4f}")
        
        return data
    else:
        print(f"❌ Failed: {response.text}")
        return None

def main():
    """Main test function"""
    print("🧪 Testing Voyage Tracking API")
    print("=" * 32)
    
    # Get authentication token
    print("🔐 Getting authentication token...")
    token = get_auth_token()
    
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    print("✅ Authentication successful\n")
    
    # Test vessel list
    vessels = test_vessel_list(token)
    
    if vessels:
        # Test vessel track for first vessel
        first_vessel = vessels[0]
        test_vessel_track(token, first_vessel['id'])
    
    # Test voyages list
    voyages = test_voyages_list(token)
    
    if voyages:
        # Test voyage track for first voyage
        first_voyage = voyages[0]
        test_voyage_track(token, first_voyage['id'])
    
    print("\n" + "=" * 32)
    print("🎉 API testing completed!")
    print("\n💡 Available endpoints:")
    print("   GET  /api/vessels/                    - List vessels")
    print("   GET  /api/vessels/{id}/track/         - Get vessel track")
    print("   GET  /api/vessels/voyages/            - List voyages")
    print("   GET  /api/vessels/voyages/{id}/track/ - Get voyage track")

if __name__ == "__main__":
    main()