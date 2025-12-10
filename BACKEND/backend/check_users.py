import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile

users = User.objects.all()
print("\n=== All Users ===")
for u in users:
    try:
        profile = UserProfile.objects.get(user=u)
        role = profile.role
    except:
        role = 'N/A'
    print(f'Username: {u.username}, Email: {u.email}, Is Staff: {u.is_staff}, Role: {role}')

if not users.exists():
    print("No users found in database")
