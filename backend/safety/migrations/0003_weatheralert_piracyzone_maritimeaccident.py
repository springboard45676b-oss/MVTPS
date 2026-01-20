# Generated migration for safety app

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('safety', '0002_alert_remove_incident_vessel_delete_piracyzone_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='WeatherAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('storm_type', models.CharField(max_length=50)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], max_length=20)),
                ('affected_area', models.CharField(max_length=200)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('radius_km', models.FloatField(default=100)),
                ('wind_speed', models.FloatField(help_text='Wind speed in knots')),
                ('description', models.TextField()),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PiracyZone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zone_name', models.CharField(max_length=200)),
                ('risk_level', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], max_length=20)),
                ('description', models.TextField()),
                ('coordinates', models.JSONField(help_text='Polygon coordinates for zone')),
                ('incident_count', models.PositiveIntegerField(default=0)),
                ('last_incident_date', models.DateField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-risk_level', 'zone_name'],
            },
        ),
        migrations.CreateModel(
            name='MaritimeAccident',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accident_type', models.CharField(choices=[('collision', 'Collision'), ('grounding', 'Grounding'), ('fire', 'Fire'), ('sinking', 'Sinking'), ('piracy', 'Piracy'), ('other', 'Other')], max_length=50)),
                ('severity', models.CharField(choices=[('minor', 'Minor'), ('moderate', 'Moderate'), ('severe', 'Severe'), ('catastrophic', 'Catastrophic')], max_length=20)),
                ('vessel_name', models.CharField(max_length=200)),
                ('vessel_imo', models.CharField(blank=True, max_length=20)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('accident_date', models.DateTimeField()),
                ('description', models.TextField()),
                ('casualties', models.PositiveIntegerField(default=0)),
                ('environmental_impact', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-accident_date'],
            },
        ),
    ]
