#!/usr/bin/env python3
"""
View and manage user details in the maritime platform
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from authentication.models import User
from vessels.models import VesselSubscription
from notifications.models import Notification

def list_all_users():
    """List all users with their details"""
    print("👥 All Users in Database")
    print("=" * 60)
    
    users = User.objects.all()
    
    if not users:
        print("❌ No users found in database")
        return
    
    for i, user in enumerate(users, 1):
        print(f"\n{i}. 👤 {user.username}")
        print(f"   📧 Email: {user.email}")
        print(f"   👤 Full Name: {user.first_name} {user.last_name}")
        print(f"   🏢 Company: {user.company}")
        print(f"   💼 Role: {user.role}")
        print(f"   📱 Phone: {user.phone}")
        print(f"   🌍 Country: {getattr(user, 'country', 'Not specified')}")
        print(f"   📅 Joined: {user.date_joined}")
        print(f"   🔓 Last Login: {user.last_login}")
        print(f"   ✅ Active: {user.is_active}")
        print(f"   👑 Staff: {user.is_staff}")
        print(f"   🔑 Superuser: {user.is_superuser}")
        
        # Get user's subscriptions
        subscriptions = VesselSubscription.objects.filter(user=user)
        print(f"   🚢 Vessel Subscriptions: {subscriptions.count()}")
        
        # Get user's notifications
        notifications = Notification.objects.filter(user=user)
        print(f"   🔔 Notifications: {notifications.count()}")

def show_user_details(username_or_id):
    """Show detailed information for a specific user"""
    try:
        if username_or_id.isdigit():
            user = User.objects.get(id=int(username_or_id))
        else:
            user = User.objects.get(username=username_or_id)
    except User.DoesNotExist:
        print(f"❌ User '{username_or_id}' not found")
        return
    
    print(f"👤 Detailed User Information: {user.username}")
    print("=" * 50)
    
    print(f"🆔 ID: {user.id}")
    print(f"👤 Username: {user.username}")
    print(f"📧 Email: {user.email}")
    print(f"👤 First Name: {user.first_name}")
    print(f"👤 Last Name: {user.last_name}")
    print(f"🏢 Company: {user.company}")
    print(f"💼 Role: {user.role}")
    print(f"📱 Phone: {user.phone}")
    print(f"🌍 Country: {getattr(user, 'country', 'Not specified')}")
    print(f"📅 Date Joined: {user.date_joined}")
    print(f"🔓 Last Login: {user.last_login}")
    print(f"✅ Active: {user.is_active}")
    print(f"👑 Staff: {user.is_staff}")
    print(f"🔑 Superuser: {user.is_superuser}")
    
    # Show subscriptions
    print(f"\n🚢 Vessel Subscriptions:")
    subscriptions = VesselSubscription.objects.filter(user=user)
    if subscriptions:
        for sub in subscriptions:
            print(f"   • {sub.vessel.name} ({sub.vessel.mmsi}) - {sub.created_at}")
    else:
        print("   No vessel subscriptions")
    
    # Show notifications
    print(f"\n🔔 Recent Notifications:")
    notifications = Notification.objects.filter(user=user).order_by('-created_at')[:5]
    if notifications:
        for notif in notifications:
            print(f"   • {notif.title} - {notif.created_at}")
    else:
        print("   No notifications")

def create_sample_user():
    """Create a sample user for testing"""
    print("👤 Creating Sample User...")
    
    try:
        user = User.objects.create_user(
            username='maritime_user',
            email='user@maritime.com',
            password='maritime123',
            first_name='John',
            last_name='Mariner',
            company='Maritime Solutions Inc',
            role='operator',
            phone='+1-555-0123'
        )
        
        print(f"✅ Created user: {user.username}")
        print(f"   📧 Email: {user.email}")
        print(f"   🔑 Password: maritime123")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")

def export_users_to_csv():
    """Export all users to CSV file"""
    import csv
    
    users = User.objects.all()
    filename = 'users_export.csv'
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # Header
        writer.writerow([
            'ID', 'Username', 'Email', 'First Name', 'Last Name', 
            'Company', 'Role', 'Phone', 'Country', 'Date Joined', 
            'Last Login', 'Is Active', 'Is Staff', 'Is Superuser'
        ])
        
        # Data
        for user in users:
            writer.writerow([
                user.id, user.username, user.email, user.first_name, 
                user.last_name, user.company, user.role, user.phone_number,
                user.country, user.date_joined, user.last_login,
                user.is_active, user.is_staff, user.is_superuser
            ])
    
    print(f"✅ Users exported to: {filename}")
    print(f"📊 {users.count()} users exported")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='View and manage users')
    parser.add_argument('--list', action='store_true', help='List all users')
    parser.add_argument('--user', type=str, help='Show details for specific user')
    parser.add_argument('--create-sample', action='store_true', help='Create sample user')
    parser.add_argument('--export', action='store_true', help='Export users to CSV')
    
    args = parser.parse_args()
    
    if args.list:
        list_all_users()
    elif args.user:
        show_user_details(args.user)
    elif args.create_sample:
        create_sample_user()
    elif args.export:
        export_users_to_csv()
    else:
        print("👥 Maritime Platform - User Management")
        print("=" * 40)
        print("\nUsage:")
        print("  python view_users.py --list")
        print("  python view_users.py --user admin")
        print("  python view_users.py --user 1")
        print("  python view_users.py --create-sample")
        print("  python view_users.py --export")
        print("\nOptions:")
        print("  --list         List all users")
        print("  --user USER    Show details for specific user")
        print("  --create-sample Create a sample user")
        print("  --export       Export users to CSV")

if __name__ == "__main__":
    main()