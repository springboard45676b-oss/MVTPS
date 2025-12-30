#!/usr/bin/env python3
"""
Check registered users in the database
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maritime_backend.settings')
django.setup()

from authentication.models import User

def check_users():
    print("👥 Registered Users in Database")
    print("=" * 50)
    
    users = User.objects.all()
    
    if not users:
        print("❌ No users found in database")
        return
    
    print(f"📊 Total Users: {users.count()}")
    print()
    
    for i, user in enumerate(users, 1):
        print(f"{i}. User Details:")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   First Name: {user.first_name}")
        print(f"   Last Name: {user.last_name}")
        print(f"   Role: {user.role}")
        print(f"   Active: {user.is_active}")
        print(f"   Staff: {user.is_staff}")
        print(f"   Superuser: {user.is_superuser}")
        print(f"   Date Joined: {user.date_joined}")
        print(f"   Last Login: {user.last_login}")
        print("-" * 30)
    
    # Show role distribution
    print("\n📈 Role Distribution:")
    roles = User.objects.values_list('role', flat=True).distinct()
    for role in roles:
        count = User.objects.filter(role=role).count()
        print(f"   {role}: {count} users")

if __name__ == "__main__":
    check_users()