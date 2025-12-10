from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_ROLES = (
        ('operator', 'Operator'),
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=20, choices=USER_ROLES, default='operator')
    phone = models.CharField(max_length=15, blank=True)
    company = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"