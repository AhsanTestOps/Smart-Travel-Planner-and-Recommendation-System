from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant


class Command(BaseCommand):
    help = 'Populate database with sample destination data'

    def handle(self, *args, **options):
        self.stdout.write('🌍 Populating sample destination data...')

        # Create categories
        self.stdout.write('Creating categories...')
        categories_data = [
            ('Historic Sites', 'sightseeing', '🏛️'),
            ('Museums', 'culture', '🏛️'),
            ('Parks & Gardens', 'nature', '🌳'),
            ('Adventure Sports', 'adventure', '🏔️'),
            ('Shopping Centers', 'shopping', '🛍️'),
            ('Nightlife', 'nightlife', '🍻'),
            ('Fine Dining', 'food', '🍽️'),
            ('Street Food', 'food', '🍜'),
            ('Luxury Hotels', 'hotel', '🏨'),
            ('Budget Hotels', 'hotel', '🏠'),
        ]
        
        categories = {}
        for name, category_type, icon in categories_data:
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={'type': category_type, 'icon': icon}
            )
            categories[name] = category
            if created:
                self.stdout.write(f'  ✓ Created category: {name}')

        # Create cities
        self.stdout.write('Creating cities...')
        cities_data = [
            ('Tokyo', 'Japan', 'A bustling metropolis blending tradition and modernity', 'https://example.com/tokyo.jpg'),
            ('Paris', 'France', 'The city of light and love', 'https://example.com/paris.jpg'),
            ('New York', 'USA', 'The city that never sleeps', 'https://example.com/nyc.jpg'),
            ('Singapore', 'Singapore', 'A modern city-state in Southeast Asia', 'https://example.com/singapore.jpg'),
            ('London', 'UK', 'Historic city with royal heritage', 'https://example.com/london.jpg'),
        ]
        
        cities = {}
        for name, country, description, image_url in cities_data:
            city, created = City.objects.get_or_create(
                name=name,
                country=country,
                defaults={'description': description, 'image_url': image_url}
            )
            cities[f"{name}, {country}"] = city
            if created:
                self.stdout.write(f'  ✓ Created city: {name}, {country}')

        # Create sample attractions
        self.stdout.write('Creating attractions...')
        attractions_data = [
            # Tokyo attractions
            ('Tokyo Tower', 'Tokyo, Japan', 'Historic Sites', 'Iconic red tower with city views', '1-chome-4-2 Shibakoen, Minato City, Tokyo', 35.6586, 139.7454, 4.2),
            ('Senso-ji Temple', 'Tokyo, Japan', 'Historic Sites', 'Ancient Buddhist temple', '2-3-1 Asakusa, Taito City, Tokyo', 35.7148, 139.7967, 4.5),
            ('Shibuya Crossing', 'Tokyo, Japan', 'Historic Sites', 'World\'s busiest pedestrian crossing', 'Shibuya City, Tokyo', 35.6598, 139.7006, 4.3),
            
            # Singapore attractions
            ('Marina Bay Sands', 'Singapore, Singapore', 'Historic Sites', 'Iconic resort complex with infinity pool', '10 Bayfront Ave, Singapore', 1.2834, 103.8607, 4.4),
            ('Gardens by the Bay', 'Singapore, Singapore', 'Parks & Gardens', 'Futuristic park with supertrees', '18 Marina Gardens Dr, Singapore', 1.2816, 103.8636, 4.6),
            ('Sentosa Island', 'Singapore, Singapore', 'Adventure Sports', 'Resort island with attractions', 'Sentosa Island, Singapore', 1.2494, 103.8303, 4.2),
            
            # Paris attractions
            ('Eiffel Tower', 'Paris, France', 'Historic Sites', 'Iconic iron lattice tower', 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', 48.8584, 2.2945, 4.6),
            ('Louvre Museum', 'Paris, France', 'Museums', 'World\'s largest art museum', 'Rue de Rivoli, 75001 Paris', 48.8606, 2.3376, 4.5),
            ('Notre-Dame Cathedral', 'Paris, France', 'Historic Sites', 'Medieval Catholic cathedral', '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', 48.8530, 2.3499, 4.4),
        ]
        
        for name, city_key, category_name, description, address, lat, lng, rating in attractions_data:
            city = cities[city_key]
            category = categories[category_name]
            attraction, created = Attraction.objects.get_or_create(
                name=name,
                city=city,
                defaults={
                    'category': category,
                    'description': description,
                    'address': address,
                    'latitude': lat,
                    'longitude': lng,
                    'rating': rating,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created attraction: {name} in {city.name}')

        # Create sample hotels
        self.stdout.write('Creating hotels...')
        hotels_data = [
            ('The Ritz Tokyo', 'Tokyo, Japan', 'Luxury Hotels', 'Luxury hotel in Roppongi', '9-7-1 Akasaka, Minato City, Tokyo', 4.8, 800.00),
            ('Capsule Hotel Shibuya', 'Tokyo, Japan', 'Budget Hotels', 'Modern capsule hotel experience', '1-19-14 Jinnan, Shibuya City, Tokyo', 4.0, 50.00),
            ('Marina Bay Sands Hotel', 'Singapore, Singapore', 'Luxury Hotels', 'Iconic hotel with infinity pool', '10 Bayfront Ave, Singapore', 4.4, 450.00),
            ('Hotel 81 Orchid', 'Singapore, Singapore', 'Budget Hotels', 'Comfortable budget accommodation', '21 Lorong 8 Geylang, Singapore', 3.8, 80.00),
            ('The Ritz Paris', 'Paris, France', 'Luxury Hotels', 'Historic luxury hotel', '15 Place Vendôme, 75001 Paris', 4.7, 1200.00),
        ]
        
        for name, city_key, category_name, description, address, rating, price in hotels_data:
            city = cities[city_key]
            category = categories[category_name]
            hotel, created = Hotel.objects.get_or_create(
                name=name,
                city=city,
                defaults={
                    'category': category,
                    'description': description,
                    'address': address,
                    'rating': rating,
                    'price_per_night': price,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created hotel: {name} in {city.name}')

        # Create sample restaurants
        self.stdout.write('Creating restaurants...')
        restaurants_data = [
            ('Sukiyabashi Jiro', 'Tokyo, Japan', 'Fine Dining', 'World-famous sushi restaurant', 'Tsukamoto Sogyo Building, 4-2-15 Ginza, Chuo City, Tokyo', 'Japanese', 4.9, '$$$'),
            ('Ramen Yashichi', 'Tokyo, Japan', 'Street Food', 'Traditional ramen shop', '3-57-8 Sangenjaya, Setagaya City, Tokyo', 'Ramen', 4.3, '$'),
            ('Newton Food Centre', 'Singapore, Singapore', 'Street Food', 'Famous hawker center', '500 Clemenceau Ave N, Singapore', 'Asian', 4.1, '$'),
            ('Odette', 'Singapore, Singapore', 'Fine Dining', 'Michelin-starred French cuisine', '1 St Andrew\'s Rd, Singapore', 'French', 4.6, '$$$'),
            ('L\'Ami Jean', 'Paris, France', 'Fine Dining', 'Traditional French bistro', '27 Rue Malar, 75007 Paris', 'French', 4.4, '$$'),
        ]
        
        for name, city_key, category_name, description, address, cuisine, rating, price_level in restaurants_data:
            city = cities[city_key]
            category = categories[category_name]
            restaurant, created = Restaurant.objects.get_or_create(
                name=name,
                city=city,
                defaults={
                    'category': category,
                    'description': description,
                    'address': address,
                    'cuisine': cuisine,
                    'rating': rating,
                    'price_level': price_level,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created restaurant: {name} in {city.name}')

        self.stdout.write(
            self.style.SUCCESS(
                '\n🎉 Sample destination data populated successfully!\n'
                'You can now:\n'
                '- Access Django Admin to manage destinations\n'
                '- Use API endpoints to browse and filter destinations\n'
                '- Test the complete destination system'
            )
        )