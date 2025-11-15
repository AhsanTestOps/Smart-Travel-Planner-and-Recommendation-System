from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Add more sample destinations with beautiful images'

    def handle(self, *args, **options):
        self.stdout.write('Adding more destinations with images...')

        # Add more attractions with images
        more_attractions = [
            {
                'name': 'Colosseum',
                'city': 'Rome',
                'country': 'Italy',
                'category': 'Historic Sites',
                'description': 'Ancient Roman amphitheater and iconic symbol of Imperial Rome',
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop',
                'website': 'https://www.coopculture.it'
            },
            {
                'name': 'Machu Picchu',
                'city': 'Cusco',
                'country': 'Peru',
                'category': 'Historic Sites',
                'description': 'Ancient Inca citadel set high in the Andes Mountains',
                'rating': 4.8,
                'image_url': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop',
                'website': 'https://www.machupicchu.gob.pe'
            },
            {
                'name': 'Santorini Sunset',
                'city': 'Santorini',
                'country': 'Greece',
                'category': 'Scenic Views',
                'description': 'World-famous sunset views from Oia village',
                'rating': 4.9,
                'image_url': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
                'website': 'https://www.santorini.gr'
            },
            {
                'name': 'Burj Khalifa',
                'city': 'Dubai',
                'country': 'UAE',
                'category': 'Modern Architecture',
                'description': 'World\'s tallest building with stunning city views',
                'rating': 4.6,
                'image_url': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&h=600&fit=crop',
                'website': 'https://www.burjkhalifa.ae'
            }
        ]

        # Add more hotels with images
        more_hotels = [
            {
                'name': 'Atlantis Dubai',
                'city': 'Dubai',
                'country': 'UAE',
                'category': 'Luxury Hotel',
                'description': 'Luxury resort on Palm Jumeirah with underwater suites',
                'rating': 4.5,
                'price_per_night': 450,
                'image_url': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
                'website': 'https://www.atlantis.com/dubai'
            },
            {
                'name': 'Hotel Santorini Palace',
                'city': 'Santorini',
                'country': 'Greece',
                'category': 'Boutique Hotel',
                'description': 'Luxury hotel with infinity pools overlooking the Aegean Sea',
                'rating': 4.8,
                'price_per_night': 650,
                'image_url': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
                'website': 'https://www.santorinipalace.com'
            },
            {
                'name': 'Hotel Colosseum Rome',
                'city': 'Rome',
                'country': 'Italy',
                'category': 'Historic Hotel',
                'description': 'Elegant hotel near the Colosseum with Roman architecture',
                'rating': 4.4,
                'price_per_night': 280,
                'image_url': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
                'website': 'https://www.hotelcolosseumrome.com'
            }
        ]

        # Add more restaurants with images
        more_restaurants = [
            {
                'name': 'Osteria del Sostegno',
                'city': 'Rome',
                'country': 'Italy',
                'category': 'Fine Dining',
                'description': 'Authentic Roman cuisine in a historic setting',
                'rating': 4.6,
                'cuisine': 'Italian',
                'price_level': '$$$',
                'image_url': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
                'website': 'https://www.osteriasostegno.it'
            },
            {
                'name': 'Nobu Dubai',
                'city': 'Dubai',
                'country': 'UAE',
                'category': 'Fine Dining',
                'description': 'World-renowned Japanese-Peruvian fusion restaurant',
                'rating': 4.7,
                'cuisine': 'Japanese-Peruvian',
                'price_level': '$$$$',
                'image_url': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
                'website': 'https://www.noburestaurants.com'
            },
            {
                'name': 'Oia Castle Restaurant',
                'city': 'Santorini',
                'country': 'Greece',
                'category': 'Scenic Dining',
                'description': 'Mediterranean cuisine with breathtaking sunset views',
                'rating': 4.5,
                'cuisine': 'Mediterranean',
                'price_level': '$$$',
                'image_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
                'website': 'https://www.oiacastle.com'
            }
        ]

        # Create cities if they don't exist
        cities_to_create = [
            {'name': 'Rome', 'country': 'Italy', 'image_url': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop'},
            {'name': 'Cusco', 'country': 'Peru', 'image_url': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop'},
            {'name': 'Santorini', 'country': 'Greece', 'image_url': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop'},
            {'name': 'Dubai', 'country': 'UAE', 'image_url': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&h=600&fit=crop'}
        ]

        for city_data in cities_to_create:
            city, created = City.objects.get_or_create(
                name=city_data['name'],
                country=city_data['country'],
                defaults={
                    'description': f"Beautiful city of {city_data['name']}",
                    'image_url': city_data['image_url']
                }
            )
            if created:
                self.stdout.write(f'Created city: {city}')

        # Create categories if they don't exist
        new_categories = [
            'Historic Sites', 'Scenic Views', 'Modern Architecture', 
            'Luxury Hotel', 'Boutique Hotel', 'Historic Hotel',
            'Fine Dining', 'Scenic Dining'
        ]

        for cat_name in new_categories:
            category, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'type': 'sightseeing'}
            )
            if created:
                self.stdout.write(f'Created category: {cat_name}')

        # Add attractions
        for attr_data in more_attractions:
            city = City.objects.get(name=attr_data['city'], country=attr_data['country'])
            category = Category.objects.get(name=attr_data['category'])
            
            attraction, created = Attraction.objects.get_or_create(
                name=attr_data['name'],
                city=city,
                defaults={
                    'category': category,
                    'description': attr_data['description'],
                    'rating': attr_data['rating'],
                    'image_url': attr_data['image_url'],
                    'website': attr_data['website']
                }
            )
            if created:
                self.stdout.write(f'Created attraction: {attr_data["name"]}')

        # Add hotels
        for hotel_data in more_hotels:
            city = City.objects.get(name=hotel_data['city'], country=hotel_data['country'])
            category = Category.objects.get(name=hotel_data['category'])
            
            hotel, created = Hotel.objects.get_or_create(
                name=hotel_data['name'],
                city=city,
                defaults={
                    'category': category,
                    'description': hotel_data['description'],
                    'rating': hotel_data['rating'],
                    'price_per_night': hotel_data['price_per_night'],
                    'image_url': hotel_data['image_url'],
                    'website': hotel_data['website']
                }
            )
            if created:
                self.stdout.write(f'Created hotel: {hotel_data["name"]}')

        # Add restaurants
        for rest_data in more_restaurants:
            city = City.objects.get(name=rest_data['city'], country=rest_data['country'])
            category = Category.objects.get(name=rest_data['category'])
            
            restaurant, created = Restaurant.objects.get_or_create(
                name=rest_data['name'],
                city=city,
                defaults={
                    'category': category,
                    'description': rest_data['description'],
                    'rating': rest_data['rating'],
                    'cuisine': rest_data['cuisine'],
                    'price_level': rest_data['price_level'],
                    'image_url': rest_data['image_url'],
                    'website': rest_data['website']
                }
            )
            if created:
                self.stdout.write(f'Created restaurant: {rest_data["name"]}')

        self.stdout.write(self.style.SUCCESS('Successfully added more destinations with beautiful images!'))