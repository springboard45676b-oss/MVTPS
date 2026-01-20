#!/usr/bin/env python3
"""
Setup Real Ship Notifications - Exclude Demo Vessels
"""

import os
import sys
import django

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from vessels.models import Vessel, RealTimeDataSubscription
from authentication.models import User
from notifications.services import notification_service

def get_real_ships():
    """Get only real ships (exclude demo vessels)"""
    # Demo vessel MMSIs to exclude
    demo_mmsis = [
        '636019825',  # MSC Gülsün (demo)
        '353136000',  # Ever Ace (demo)
        '477995300',  # OOCL Hong Kong (demo)
        '311000274',  # Symphony of the Seas (demo)
        '636017894',  # Seaways Laura Lynn (demo)
        '367123456',  # Maersk Alabama (demo)
        '310627000',  # Queen Mary 2 (demo)
        '477123456',  # Seawise Giant (demo)
    ]
    
    # Get all vessels excluding demo ones
    real_ships = Vessel.objects.exclude(mmsi__in=demo_mmsis)
    return real_ships

def create_real_ship_subscription(username):
    """Create a subscription specifically for real ships"""
    try:
        user = User.objects.get(username=username)
        real_ships = get_real_ships()
        
        print(f"🚢 Found {real_ships.count()} real ships:")
        for ship in real_ships[:10]:  # Show first 10
            print(f"   • {ship.name} ({ship.mmsi}) - {ship.vessel_type}")
        if real_ships.count() > 10:
            print(f"   ... and {real_ships.count() - 10} more")
        
        # Create subscription for real ships only
        subscription = RealTimeDataSubscription.objects.create(
            user=user,
            subscription_type='vessel_specific',
            notification_types=[
                'position_update',
                'status_change', 
                'port_arrival',
                'port_departure',
                'emergency'
            ],
            email_notifications=True,
            push_notifications=True,
            sms_notifications=False,
            update_frequency=5,  # 5 minutes
            is_active=True
        )
        
        # Add real ships to the subscription
        subscription.vessels.set(real_ships)
        
        print(f"\n✅ Created real ship subscription for {username}")
        print(f"📊 Subscription Details:")
        print(f"   • Type: Specific Vessels (Real Ships Only)")
        print(f"   • Ships: {subscription.vessels.count()} real vessels")
        print(f"   • Notifications: Position, Status, Ports, Emergency")
        print(f"   • Methods: Email + Push notifications")
        print(f"   • Frequency: Every 5 minutes")
        print(f"   • Status: Active")
        
        # Create notification
        notification_service.notify_realtime_subscription_created(user, subscription)
        
        return subscription
        
    except User.DoesNotExist:
        print(f"❌ User '{username}' not found")
        return None

def list_real_vs_demo_ships():
    """Show breakdown of real vs demo ships"""
    print("🔍 Ship Classification")
    print("=" * 30)
    
    demo_mmsis = [
        '636019825', '353136000', '477995300', '311000274', 
        '636017894', '367123456', '310627000', '477123456'
    ]
    
    all_ships = Vessel.objects.all()
    demo_ships = all_ships.filter(mmsi__in=demo_mmsis)
    real_ships = all_ships.exclude(mmsi__in=demo_mmsis)
    
    print(f"📊 Total Ships: {all_ships.count()}")
    print(f"🎭 Demo Ships: {demo_ships.count()}")
    print(f"🌍 Real Ships: {real_ships.count()}")
    
    print(f"\n🌍 Real Ships:")
    for ship in real_ships:
        print(f"   • {ship.name} ({ship.mmsi}) - {ship.vessel_type}")
    
    print(f"\n🎭 Demo Ships (will be excluded):")
    for ship in demo_ships:
        print(f"   • {ship.name} ({ship.mmsi}) - {ship.vessel_type}")

def main():
    print("🚢 Real Ship Notification Setup")
    print("=" * 40)
    
    # Show ship breakdown
    list_real_vs_demo_ships()
    
    # Get username from command line or use default
    username = sys.argv[1] if len(sys.argv) > 1 else 'arjun'
    
    print(f"\n🔔 Creating subscription for user: {username}")
    subscription = create_real_ship_subscription(username)
    
    if subscription:
        print(f"\n🎯 Next Steps:")
        print(f"1. ✅ Subscription created successfully")
        print(f"2. 📱 Check notifications page for confirmation")
        print(f"3. 📧 You'll receive email notifications for real ship updates")
        print(f"4. 🔄 Updates every 5 minutes for {subscription.vessels.count()} real ships")
        print(f"5. 🌐 View subscription at: http://localhost:3000/subscriptions")
    
    print(f"\n💡 This subscription will ONLY notify about real ships,")
    print(f"   excluding all demo/test vessels.")

if __name__ == "__main__":
    main()