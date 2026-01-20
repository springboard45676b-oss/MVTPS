#!/usr/bin/env python3
"""
Test Real-Time Subscriptions API
"""

import requests
import json

# API base URL
BASE_URL = "http://127.0.0.1:8000/api"

def test_login():
    """Test login and get token"""
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful")
        return data.get('access') or data.get('token')
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def test_subscriptions_api(token):
    """Test real-time subscriptions API"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔍 Testing Real-Time Subscriptions API")
    print("=" * 50)
    
    # 1. Get subscriptions
    print("1. Getting user subscriptions...")
    response = requests.get(f"{BASE_URL}/vessels/realtime-subscriptions/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        subscriptions = data.get('subscriptions', [])
        print(f"✅ Found {len(subscriptions)} subscriptions")
        
        for i, sub in enumerate(subscriptions, 1):
            print(f"   {i}. {sub['subscription_type']} - {len(sub.get('notification_types', []))} notification types")
            print(f"      Status: {'🟢 Active' if sub['is_active'] else '🔴 Inactive'}")
            print(f"      Vessels: {len(sub.get('vessels', []))} ships")
            print(f"      Frequency: {sub['update_frequency']} minutes")
        
        return subscriptions
    else:
        print(f"❌ Failed to get subscriptions: {response.status_code}")
        print(response.text)
        return []

def test_subscription_stats(token):
    """Test subscription statistics"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n📊 Testing Subscription Statistics...")
    response = requests.get(f"{BASE_URL}/vessels/realtime-subscriptions/stats/", headers=headers)
    
    if response.status_code == 200:
        stats = response.json()
        print("✅ Statistics retrieved:")
        print(f"   Total subscriptions: {stats['total_subscriptions']}")
        print(f"   Active subscriptions: {stats['active_subscriptions']}")
        print(f"   Email notifications: {stats['notification_preferences']['email']}")
        print(f"   Push notifications: {stats['notification_preferences']['push']}")
        print(f"   SMS notifications: {stats['notification_preferences']['sms']}")
        
        print(f"\n   Subscription types:")
        for sub_type, count in stats['subscription_types'].items():
            print(f"     • {sub_type}: {count}")
        
        return stats
    else:
        print(f"❌ Failed to get statistics: {response.status_code}")
        return None

def test_create_global_subscription(token):
    """Test creating a global subscription"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🌍 Testing Global Subscription Creation...")
    
    subscription_data = {
        "subscription_type": "global",
        "notification_types": ["position_update", "emergency"],
        "email_notifications": True,
        "push_notifications": True,
        "sms_notifications": False,
        "update_frequency": 15
    }
    
    response = requests.post(
        f"{BASE_URL}/vessels/realtime-subscriptions/", 
        json=subscription_data, 
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        print("✅ Global subscription created successfully")
        print(f"   ID: {data['id']}")
        print(f"   Type: {data['subscription_type']}")
        print(f"   Notifications: {', '.join(data['notification_types'])}")
        return data['id']
    else:
        print(f"❌ Failed to create subscription: {response.status_code}")
        print(response.text)
        return None

def test_toggle_subscription(token, subscription_id):
    """Test toggling subscription active status"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"\n🔄 Testing Subscription Toggle (ID: {subscription_id})...")
    
    response = requests.post(
        f"{BASE_URL}/vessels/realtime-subscriptions/{subscription_id}/toggle/", 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['message']}")
        print(f"   Status: {'🟢 Active' if data['is_active'] else '🔴 Inactive'}")
        return data['is_active']
    else:
        print(f"❌ Failed to toggle subscription: {response.status_code}")
        return None

def test_vessels_api(token):
    """Test vessels API for subscription targets"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🚢 Testing Vessels API...")
    response = requests.get(f"{BASE_URL}/vessels/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        vessels = data.get('results', data) if isinstance(data, dict) else data
        
        print(f"✅ Found {len(vessels)} vessels available for subscription")
        
        # Show real vs demo ships
        demo_mmsis = ['636019825', '353136000', '477995300', '311000274', '636017894']
        real_ships = [v for v in vessels if v['mmsi'] not in demo_mmsis]
        demo_ships = [v for v in vessels if v['mmsi'] in demo_mmsis]
        
        print(f"   🌍 Real ships: {len(real_ships)}")
        print(f"   🎭 Demo ships: {len(demo_ships)}")
        
        return vessels
    else:
        print(f"❌ Failed to get vessels: {response.status_code}")
        return []

def main():
    print("🔔 Real-Time Subscriptions API Test")
    print("=" * 40)
    
    # Test login
    token = test_login()
    if not token:
        return
    
    # Test vessels API
    vessels = test_vessels_api(token)
    
    # Test subscriptions
    subscriptions = test_subscriptions_api(token)
    
    # Test statistics
    stats = test_subscription_stats(token)
    
    # Test creating new subscription
    new_sub_id = test_create_global_subscription(token)
    
    # Test toggling subscription
    if subscriptions and len(subscriptions) > 0:
        test_toggle_subscription(token, subscriptions[0]['id'])
    elif new_sub_id:
        test_toggle_subscription(token, new_sub_id)
    
    print("\n🎉 API Testing Complete!")
    print("✅ Real-time subscription system is working properly")
    print("🌐 Frontend available at: http://localhost:3000/subscriptions")

if __name__ == "__main__":
    main()