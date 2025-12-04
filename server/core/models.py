from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.ROLE_ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_OPERATOR = "operator"
    ROLE_ANALYST = "analyst"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = (
        (ROLE_OPERATOR, "Operator"),
        (ROLE_ANALYST, "Analyst"),
        (ROLE_ADMIN, "Admin"),
    )

    username = None
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(_('full name'), max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_OPERATOR, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} ({self.role})"
    
    def clean(self):
        super().clean()
        if self.role == self.ROLE_ADMIN and not self.is_superuser:
            raise ValidationError({'role': 'Only superusers can have admin role.'})

    def save(self, *args, **kwargs):
        self.clean()
        if self.role == self.ROLE_ADMIN:
            self.is_staff = True
            self.is_superuser = True
        super().save(*args, **kwargs)
