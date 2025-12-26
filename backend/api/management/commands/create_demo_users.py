from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    help = 'Create demo users for testing'
    
    def handle(self, *args, **options):
        users_data = [
            {'username': 'operator', 'password': 'password123', 'role': 'operator', 'email': 'operator@demo.com'},
            {'username': 'analyst', 'password': 'password123', 'role': 'analyst', 'email': 'analyst@demo.com'},
            {'username': 'admin', 'password': 'password123', 'role': 'admin', 'email': 'admin@demo.com'},
        ]
        
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'role': user_data['role']
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {user.username} ({user.role})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User already exists: {user.username}')
                )
        
        self.stdout.write(self.style.SUCCESS('Demo users setup complete!'))