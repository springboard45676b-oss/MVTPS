from django.apps import AppConfig
from django.contrib import admin

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        admin.site.site_header = "Maritime Ops Platform"
        admin.site.site_title = "Maritime Portal"
        admin.site.index_title = "System Dashboard"