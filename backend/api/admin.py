from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Vessel, Port, Event, Wire

# 1. Create a custom configuration to show the 'role' field
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

# 2. Register the models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Vessel)
admin.site.register(Port)
admin.site.register(Event)
admin.site.register(Wire)