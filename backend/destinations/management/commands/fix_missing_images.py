from django.core.management.base import BaseCommand
from destinations.models import City, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Add missing images to all remaining destinations'

    def handle(self, *args, **options):
        self.stdout.write('Adding images to remaining destinations...')

        # Missing Attraction Images
        attraction_images = {
            'Tokyo Tower': 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&h=600&fit=crop',
            'Senso-ji Temple': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop',
            'Shibuya Crossing': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
            'Sentosa Island': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
            'Louvre Museum': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop',
            'Notre-Dame Cathedral': 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800&h=600&fit=crop'
        }

        for attraction_name, image_url in attraction_images.items():
            updated = Attraction.objects.filter(name=attraction_name).update(image_url=image_url)
            if updated:
                self.stdout.write(f'✅ Updated {attraction_name} image')
            else:
                self.stdout.write(f'❌ Could not find attraction: {attraction_name}')

        # Missing Hotel Images
        hotel_images = {
            'The Ritz Tokyo': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
            'Capsule Hotel Shibuya': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
            'Hotel 81 Orchid': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            'The Ritz Paris': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop'
        }

        for hotel_name, image_url in hotel_images.items():
            updated = Hotel.objects.filter(name=hotel_name).update(image_url=image_url)
            if updated:
                self.stdout.write(f'✅ Updated {hotel_name} image')
            else:
                self.stdout.write(f'❌ Could not find hotel: {hotel_name}')

        # Missing Restaurant Images
        restaurant_images = {
            'Ramen Yashichi': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
            'Newton Food Centre': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
            'Odette': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
            'L\'Ami Jean': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
        }

        for restaurant_name, image_url in restaurant_images.items():
            updated = Restaurant.objects.filter(name=restaurant_name).update(image_url=image_url)
            if updated:
                self.stdout.write(f'✅ Updated {restaurant_name} image')
            else:
                self.stdout.write(f'❌ Could not find restaurant: {restaurant_name}')

        self.stdout.write(self.style.SUCCESS('\n🎉 Successfully added images to all remaining destinations!'))
        self.stdout.write('Run "python manage.py check_images" to verify all images are now present.')