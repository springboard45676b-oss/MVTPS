from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin user for testing'
    
    def handle(self, *args, **options):
        username = 'admin'
        password = 'admin123'
        email = 'admin@test.com'
        
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.role = 'admin'
            user.is_active = True
            user.save()
            self.stdout.write(f'Updated existing user: {username} with admin role')
        else:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                role='admin',
                is_active=True
            )
            self.stdout.write(f'Created admin user: {username}/{password}')
        
        self.stdout.write(f'Admin user: {user.username}, Role: {user.role}, Active: {user.is_active}')