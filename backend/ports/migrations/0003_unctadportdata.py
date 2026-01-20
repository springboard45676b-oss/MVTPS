# Generated migration for ports app

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('ports', '0002_remove_port_timezone_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UNCTADPortData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('port_name', models.CharField(max_length=200)),
                ('country', models.CharField(max_length=100)),
                ('average_wait_time', models.FloatField(help_text='Average wait time in hours')),
                ('vessel_arrival_count', models.PositiveIntegerField(default=0)),
                ('vessel_departure_count', models.PositiveIntegerField(default=0)),
                ('congestion_index', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], max_length=20)),
                ('container_throughput', models.PositiveIntegerField(default=0, help_text='TEU')),
                ('cargo_tonnage', models.FloatField(default=0, help_text='Million tons')),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('port', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='unctad_data', to='ports.port')),
            ],
            options={
                'verbose_name': 'UNCTAD Port Data',
                'verbose_name_plural': 'UNCTAD Port Data',
                'ordering': ['-last_updated'],
            },
        ),
    ]
