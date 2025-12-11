from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Port, Vessel, Voyage, Event, Notification


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )

    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")


admin.site.register(Port)
admin.site.register(Vessel)
admin.site.register(Voyage)
admin.site.register(Event)
admin.site.register(Notification)
