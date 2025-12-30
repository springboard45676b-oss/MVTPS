# server/core/management/commands/populate_mock_data.py

from django.core.management.base import BaseCommand
from core.mock_data_generator import MockDataGenerator
from core.models import Vessel, Port, Voyage

class Command(BaseCommand):
    help = 'Populate the database with mock data for ports and voyages'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing voyages before generating new mock data',
        )
        parser.add_argument(
            '--voyages',
            type=int,
            default=15,
            help='Number of voyages to create (default: 15)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING('\n' + '='*60)
        )
        self.stdout.write(
            self.style.WARNING('🚢 POPULATING MOCK DATA')
        )
        self.stdout.write(
            self.style.WARNING('='*60 + '\n')
        )

        # Check if vessels exist
        vessel_count = Vessel.objects.count()
        if vessel_count == 0:
            self.stdout.write(
                self.style.ERROR('❌ No vessels found in database!')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'✅ Found {vessel_count} vessels in database\n')
        )

        # Clear existing voyages if requested
        if options['clear']:
            self.stdout.write(self.style.WARNING('⚠️  Clearing existing voyages...'))
            Voyage.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Voyages cleared\n'))

        # Generate ports
        self.stdout.write('📍 Generating ports...')
        ports = MockDataGenerator.generate_ports()
        self.stdout.write(
            self.style.SUCCESS(f'✅ Generated {len(ports)} ports\n')
        )

        # Generate voyages using existing vessels
        self.stdout.write('⛵ Generating voyages...')
        voyages = MockDataGenerator.generate_voyages(options['voyages'])
        self.stdout.write(
            self.style.SUCCESS(f'✅ Generated {len(voyages)} voyages\n')
        )

        # Print summary
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('📊 SUMMARY'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(f'Total Vessels: {Vessel.objects.count()}')
        self.stdout.write(f'Total Ports: {Port.objects.count()}')
        self.stdout.write(f'Total Voyages: {Voyage.objects.count()}')
        self.stdout.write(self.style.SUCCESS('='*60 + '\n'))

if __name__ == '__main__':
    import os
    import django
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
    django.setup()
    
    MockDataGenerator.generate_all_mock_data()