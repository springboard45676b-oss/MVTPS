#!/usr/bin/env python3
"""
Test the real data API endpoints
"""

import requests
import json
import time

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

def test_data_source_info(token):
    """Test data source information endpoint"""
    print("\n🔍 Testing Data Source Info...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/data-source-info/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Data source info retrieved:")
        print(f"   Total vessels: {data['data_sources']['total_vessels']}")
        print(f"   Demo vessels: {data['data_sources']['demo_vessels']}")
        print(f"   Real vessels: {data['data_sources']['real_vessels']}")
        print(f"   AIS streaming enabled: {data['streaming_status']['aisstream_enabled']}")
        print(f"   Currently streaming: {data['streaming_status']['is_streaming']}")
        return data
    else:
        print(f"❌ Failed: {response.text}")
        return None

def test_ais_streaming(token):
    """Test AIS streaming endpoints"""
    print("\n📡 Testing AIS Streaming...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check status
    response = requests.get(f"{BASE_URL}/vessels/ais-status/", headers=headers)
    if response.status_code == 200:
        status = response.json()
        print(f"✅ AIS Status: {status}")
    
    # Start streaming (with bounds around busy shipping area)
    bounds_data = {
        "minlat": 50.0,
        "minlon": -2.0,
        "maxlat": 51.5,
        "maxlon": 2.0
    }
    
    response = requests.post(
        f"{BASE_URL}/vessels/ais-start/", 
        headers=headers,
        json=bounds_data
    )
    
    if response.status_code == 200:
        print("✅ AIS streaming started")
        
        # Wait a bit and check status
        time.sleep(5)
        
        response = requests.get(f"{BASE_URL}/vessels/ais-status/", headers=headers)
        if response.status_code == 200:
            status = response.json()
            print(f"📊 Updated status: {status}")
    else:
        print(f"❌ Failed to start streaming: {response.text}")

def test_live_vessels(token):
    """Test live vessels endpoint"""
    print("\n🚢 Testing Live Vessels...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/live/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved {data['count']} live vessels")
        print(f"   Data source: {data.get('source', 'Unknown')}")
        
        if data['vessels']:
            sample = data['vessels'][0]
            print(f"   Sample vessel: {sample['name']} ({sample['mmsi']})")
            print(f"   Position: {sample['latitude']:.4f}, {sample['longitude']:.4f}")
        
        return data
    else:
        print(f"❌ Failed: {response.text}")
        return None

def test_voyage_processing(token):
    """Test voyage processing"""
    print("\n🛣️  Testing Voyage Processing...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Process voyages for all vessels
    response = requests.post(f"{BASE_URL}/vessels/voyages/update-all/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Voyage processing completed:")
        print(f"   Voyages created: {data['total_voyages_created']}")
        print(f"   Active voyages updated: {data['active_voyages_updated']}")
        print(f"   Vessels processed: {data['vessels_processed']}")
    else:
        print(f"❌ Failed: {response.text}")

def test_voyage_statistics(token):
    """Test voyage statistics"""
    print("\n📈 Testing Voyage Statistics...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/vessels/voyages/statistics/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        stats = data['statistics']
        print("✅ Voyage statistics:")
        print(f"   Total voyages: {stats['total_voyages']}")
        print(f"   Active voyages: {stats['active_voyages']}")
        print(f"   Completed voyages: {stats['completed_voyages']}")
        print(f"   Total distance: {stats['total_distance']:.1f} km")
    else:
        print(f"❌ Failed: {response.text}")

def main():
    """Main test function"""
    print("🧪 Testing Real Data API Endpoints")
    print("=" * 35)
    
    # Get authentication token
    print("🔐 Getting authentication token...")
    token = get_auth_token()
    
    if not token:
        print("❌ Cannot proceed without authentication")
        return
    
    print("✅ Authentication successful")
    
    # Run tests
    test_data_source_info(token)
    test_ais_streaming(token)
    test_live_vessels(token)
    test_voyage_processing(token)
    test_voyage_statistics(token)
    
    print("\n" + "=" * 35)
    print("🎉 API testing completed!")
    print("\n💡 Tips:")
    print("   - Check data source info to see real vs demo vessels")
    print("   - Start AIS streaming to get real data")
    print("   - Process voyages to track vessel movements")
    print("   - Monitor voyage statistics for insights")

if __name__ == "__main__":
    main()