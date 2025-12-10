import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile

# Get all users
users = User.objects.all()
print("=== Checking and fixing UserProfiles ===\n")

for user in users:
    profile_exists = UserProfile.objects.filter(user=user).exists()
    print(f"User: {user.username}, Email: {user.email}")
    
    if not profile_exists:
        # Create profile for users that don't have one
        if user.is_staff:
            role = 'admin'
        else:
            role = 'operator'
        profile = UserProfile.objects.create(user=user, role=role)
        print(f"  ✓ Created UserProfile with role: {role}")
    else:
        profile = UserProfile.objects.get(user=user)
        print(f"  ✓ UserProfile already exists with role: {profile.role}")
    print()

print("=== Users Summary ===")
for user in User.objects.all():
    profile = UserProfile.objects.get(user=user)
    print(f"Username: {user.username}, Email: {user.email}, Role: {profile.role}, Is Staff: {user.is_staff}")
