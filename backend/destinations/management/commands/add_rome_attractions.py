from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Add more Rome attractions to test image loading'

    def handle(self, *args, **options):
        self.stdout.write('Adding more Rome destinations...')

        rome = City.objects.get(name='Rome', country='Italy')
        historic_sites = Category.objects.get(name='Historic Sites')
        museums = Category.objects.get(name='Museums')
        
        # Additional Rome attractions with guaranteed working images
        rome_attractions = [
            {
                'name': 'Roman Forum',
                'category': historic_sites,
                'description': 'Ancient Roman public square with ruins of important government buildings',
                'rating': 4.5,
                'image_url': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop',
                'website': 'https://www.coopculture.it'
            },
            {
                'name': 'Pantheon',
                'category': historic_sites,
                'description': 'Ancient Roman temple with the famous dome and oculus',
                'rating': 4.6,
                'image_url': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&h=600&fit=crop',
                'website': 'https://www.pantheonroma.com'
            },
            {
                'name': 'Vatican Museums',
                'category': museums,
                'description': 'World-renowned museums with Sistine Chapel and art masterpieces',
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
                'website': 'https://www.vatican.va'
            }
        ]

        created_count = 0
        for attraction_data in rome_attractions:
            attraction, created = Attraction.objects.get_or_create(
                name=attraction_data['name'],
                city=rome,
                defaults={
                    'category': attraction_data['category'],
                    'description': attraction_data['description'],
                    'rating': attraction_data['rating'],
                    'image_url': attraction_data['image_url'],
                    'website': attraction_data['website']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Added: {attraction_data["name"]}')
            else:
                # Update existing with better image
                if attraction.image_url != attraction_data['image_url']:
                    attraction.image_url = attraction_data['image_url']
                    attraction.save()
                    self.stdout.write(f'🔄 Updated image for: {attraction_data["name"]}')
                else:
                    self.stdout.write(f'⚠️  Already exists: {attraction_data["name"]}')

        # Also fix the Colosseum with a different image URL
        try:
            colosseum = Attraction.objects.get(name='Colosseum', city=rome)
            # Use a direct, simple image URL
            colosseum.image_url = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600'
            colosseum.save()
            self.stdout.write('🔄 Updated Colosseum with new image URL')
        except:
            pass

        # Check final status
        rome_attractions_count = rome.attractions.count()
        self.stdout.write(f'\nRome now has {rome_attractions_count} attractions:')
        for attraction in rome.attractions.all():
            self.stdout.write(f'  - {attraction.name} ({len(attraction.image_url)} chars image URL)')

        self.stdout.write(self.style.SUCCESS(f'\n✅ Added {created_count} new Rome attractions!'))