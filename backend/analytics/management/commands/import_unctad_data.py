"""
Django management command to import UNCTAD port calls data
Usage: python manage.py import_unctad_data
"""

import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db import models
from pathlib import Path

class Command(BaseCommand):
    help = 'Import UNCTAD port calls data into the database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='data/UNCTAD/US_PortCallsArrivals.csv',
            help='Path to the UNCTAD CSV file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before import'
        )
    
    def handle(self, *args, **options):
        # Import models here to avoid circular imports
        from analytics.models import Country, ShipType, PortCallStatistic, PortCongestionMetric
        
        file_path = Path(options['file'])
        
        if not file_path.exists():
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return
        
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            PortCallStatistic.objects.all().delete()
            PortCongestionMetric.objects.all().delete()
            Country.objects.all().delete()
            ShipType.objects.all().delete()
        
        self.stdout.write('Loading UNCTAD data...')
        df = pd.read_csv(file_path)
        
        # Clean data
        df_clean = df[
            (df['Number of port calls'].notna()) & 
            (df['Number of port calls'] != '') &
            (~df['Number of port calls Missing value'].str.contains(
                'Not applicable|Not publishable|Not available', na=False
            ))
        ].copy()
        
        df_clean['Number of port calls'] = pd.to_numeric(
            df_clean['Number of port calls'], errors='coerce'
        )
        
        # Filter individual economies (code > 100)
        df_clean = df_clean[df_clean['Economy'] > 100]
        
        self.stdout.write(f'Processing {len(df_clean)} records...')
        
        with transaction.atomic():
            # Import countries
            countries_data = df_clean[['Economy', 'Economy Label']].drop_duplicates()
            countries_created = 0
            
            for _, row in countries_data.iterrows():
                country, created = Country.objects.get_or_create(
                    code=str(row['Economy']),
                    defaults={'name': row['Economy Label']}
                )
                if created:
                    countries_created += 1
            
            self.stdout.write(f'Created {countries_created} countries')
            
            # Import ship types
            ship_types_data = df_clean[['CommercialMarket', 'CommercialMarket Label']].drop_duplicates()
            ship_types_created = 0
            
            for _, row in ship_types_data.iterrows():
                ship_type, created = ShipType.objects.get_or_create(
                    code=str(row['CommercialMarket']),
                    defaults={'name': row['CommercialMarket Label']}
                )
                if created:
                    ship_types_created += 1
            
            self.stdout.write(f'Created {ship_types_created} ship types')
            
            # Import port call statistics
            stats_created = 0
            
            for _, row in df_clean.iterrows():
                try:
                    country = Country.objects.get(code=str(row['Economy']))
                    ship_type = ShipType.objects.get(code=str(row['CommercialMarket']))
                    
                    stat, created = PortCallStatistic.objects.get_or_create(
                        year=row['Year'],
                        country=country,
                        ship_type=ship_type,
                        defaults={'port_calls': int(row['Number of port calls'])}
                    )
                    
                    if created:
                        stats_created += 1
                
                except (Country.DoesNotExist, ShipType.DoesNotExist, ValueError) as e:
                    self.stdout.write(
                        self.style.WARNING(f'Skipping row: {e}')
                    )
                    continue
            
            self.stdout.write(f'Created {stats_created} port call statistics')
            
            # Generate congestion metrics
            self.generate_congestion_metrics()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully imported UNCTAD data')
        )
    
    def generate_congestion_metrics(self):
        """Generate port congestion metrics from port call statistics"""
        from analytics.models import Country, ShipType, PortCallStatistic, PortCongestionMetric
        
        self.stdout.write('Generating congestion metrics...')
        
        # Get all countries and years
        countries = Country.objects.all()
        years = PortCallStatistic.objects.values_list('year', flat=True).distinct()
        
        metrics_created = 0
        
        for country in countries:
            for year in years:
                # Get statistics for this country and year
                stats = PortCallStatistic.objects.filter(
                    country=country,
                    year=year
                )
                
                if not stats.exists():
                    continue
                
                # Calculate totals
                total_calls = stats.aggregate(
                    total=models.Sum('port_calls')
                )['total'] or 0
                
                # Get specific ship type calls
                container_calls = stats.filter(
                    ship_type__code='03'
                ).aggregate(total=models.Sum('port_calls'))['total'] or 0
                
                bulk_calls = stats.filter(
                    ship_type__code__in=['02', '05']
                ).aggregate(total=models.Sum('port_calls'))['total'] or 0
                
                passenger_calls = stats.filter(
                    ship_type__code='01'
                ).aggregate(total=models.Sum('port_calls'))['total'] or 0
                
                # Calculate congestion index (simplified)
                global_avg = PortCallStatistic.objects.filter(
                    year=year
                ).aggregate(avg=models.Avg('port_calls'))['avg'] or 1
                
                congestion_index = min(100, (total_calls / global_avg) * 10)
                efficiency_score = max(0, 100 - congestion_index)
                
                # Create or update metric
                metric, created = PortCongestionMetric.objects.get_or_create(
                    country=country,
                    year=year,
                    defaults={
                        'total_port_calls': total_calls,
                        'congestion_index': congestion_index,
                        'efficiency_score': efficiency_score,
                        'container_calls': container_calls,
                        'bulk_calls': bulk_calls,
                        'passenger_calls': passenger_calls,
                    }
                )
                
                if created:
                    metrics_created += 1
        
        self.stdout.write(f'Generated {metrics_created} congestion metrics')