from django.core.management.base import BaseCommand
from destinations.models import City, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Add real image URLs to existing destinations'

    def handle(self, *args, **options):
        self.stdout.write('Adding real images to destinations...')

        # Update City Images
        city_images = {
            'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
            'Paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
            'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
            'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
            'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop'
        }

        for city_name, image_url in city_images.items():
            City.objects.filter(name=city_name).update(image_url=image_url)
            self.stdout.write(f'Updated {city_name} image')

        # Update Attraction Images
        attraction_images = {
            'Eiffel Tower': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop',
            'Tokyo Skytree': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
            'Statue of Liberty': 'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=800&h=600&fit=crop',
            'Central Park': 'https://images.unsplash.com/photo-1518390888380-e45d8c2f7b41?w=800&h=600&fit=crop',
            'Times Square': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
            'Big Ben': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
            'London Bridge': 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&h=600&fit=crop',
            'Gardens by the Bay': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
            'Marina Bay Sands': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=600&fit=crop'
        }

        for attraction_name, image_url in attraction_images.items():
            Attraction.objects.filter(name=attraction_name).update(image_url=image_url)
            self.stdout.write(f'Updated {attraction_name} image')

        # Update Hotel Images
        hotel_images = {
            'Hotel de Crillon': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
            'The Plaza': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
            'Park Hyatt Tokyo': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
            'The Savoy': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            'Marina Bay Sands Hotel': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop'
        }

        for hotel_name, image_url in hotel_images.items():
            Hotel.objects.filter(name=hotel_name).update(image_url=image_url)
            self.stdout.write(f'Updated {hotel_name} image')

        # Update Restaurant Images
        restaurant_images = {
            'Le Jules Verne': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
            'Sukiyabashi Jiro': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
            'Eleven Madison Park': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            'Sketch London': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop',
            'Ce La Vie Singapore': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop'
        }

        for restaurant_name, image_url in restaurant_images.items():
            Restaurant.objects.filter(name=restaurant_name).update(image_url=image_url)
            self.stdout.write(f'Updated {restaurant_name} image')

        self.stdout.write(self.style.SUCCESS('Successfully added real images to all destinations!'))