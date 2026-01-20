# Generated migration

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('vessels', '0002_aisrawmessage_navigationstatus_voyageinfo_and_more'),
        ('ports', '0003_unctadportdata'),
    ]

    operations = [
        migrations.CreateModel(
            name='VoyageReplay',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('voyage_id', models.CharField(max_length=50, unique=True)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('status', models.CharField(default='completed', max_length=20)),
                ('destination_port', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='destination_voyages', to='ports.port')),
                ('origin_port', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='origin_voyages', to='ports.port')),
                ('vessel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='replay_voyages', to='vessels.vessel')),
            ],
            options={
                'ordering': ['-start_time'],
            },
        ),
        migrations.CreateModel(
            name='VoyagePosition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('speed', models.FloatField()),
                ('course', models.FloatField()),
                ('timestamp', models.DateTimeField()),
                ('voyage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='positions', to='vessels.voyagereplay')),
            ],
            options={
                'ordering': ['timestamp'],
            },
        ),
        migrations.CreateModel(
            name='ComplianceViolation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('violation_type', models.CharField(choices=[('route_deviation', 'Route Deviation'), ('excessive_wait', 'Excessive Wait Time'), ('unauthorized_port', 'Unauthorized Port Call'), ('speed_violation', 'Speed Violation')], max_length=30)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], max_length=20)),
                ('description', models.TextField()),
                ('latitude', models.FloatField(null=True)),
                ('longitude', models.FloatField(null=True)),
                ('timestamp', models.DateTimeField()),
                ('voyage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='violations', to='vessels.voyagereplay')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.AddIndex(
            model_name='voyageposition',
            index=models.Index(fields=['voyage', 'timestamp'], name='vessels_voy_voyage__idx'),
        ),
    ]
