from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom User model with role-based access control.
    Roles: OPERATOR, ANALYST, ADMIN
    """
    ROLE_CHOICES = [
        ('OPERATOR', 'Operator'),
        ('ANALYST', 'Analyst'),
        ('ADMIN', 'Admin'),
    ]
    
    # Override default fields to match schema
    name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='OPERATOR')
    operator = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Keep inherited fields: id, username, email, password
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    class Meta:
        db_table = 'users'
