from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Add content to empty categories (Shopping Centers and Nightlife)'

    def handle(self, *args, **options):
        self.stdout.write('Adding content to empty categories...')

        # Get the empty categories
        shopping_category = Category.objects.get(name='Shopping Centers')
        nightlife_category = Category.objects.get(name='Nightlife')

        # Get cities for destinations
        tokyo = City.objects.get(name='Tokyo', country='Japan')
        paris = City.objects.get(name='Paris', country='France')
        new_york = City.objects.get(name='New York', country='USA')
        london = City.objects.get(name='London', country='UK')
        singapore = City.objects.get(name='Singapore', country='Singapore')
        dubai = City.objects.get(name='Dubai', country='UAE')
        rome = City.objects.get(name='Rome', country='Italy')
        santorini = City.objects.get(name='Santorini', country='Greece')

        # Shopping Centers Attractions
        shopping_centers = [
            {
                'name': 'Shibuya Sky',
                'city': tokyo,
                'description': 'Modern shopping and entertainment complex with rooftop observation deck',
                'rating': 4.5,
                'image_url': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
                'website': 'https://shibuya-sky.com'
            },
            {
                'name': 'Champs-Élysées Shopping',
                'city': paris,
                'description': 'World-famous shopping avenue with luxury boutiques and flagship stores',
                'rating': 4.3,
                'image_url': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
                'website': 'https://www.champselysees-paris.com'
            },
            {
                'name': 'Fifth Avenue Shopping',
                'city': new_york,
                'description': 'Premium shopping district with luxury department stores and boutiques',
                'rating': 4.6,
                'image_url': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
                'website': 'https://www.fifthavenuenyc.com'
            },
            {
                'name': 'Oxford Street',
                'city': london,
                'description': 'Europe\'s busiest shopping street with over 300 shops',
                'rating': 4.2,
                'image_url': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
                'website': 'https://www.oxfordstreet.co.uk'
            },
            {
                'name': 'Orchard Road',
                'city': singapore,
                'description': 'Singapore\'s premier shopping boulevard with malls and luxury stores',
                'rating': 4.4,
                'image_url': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
                'website': 'https://www.orchardroad.org'
            },
            {
                'name': 'Dubai Mall',
                'city': dubai,
                'description': 'World\'s largest shopping mall with over 1,200 shops and entertainment',
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&h=600&fit=crop',
                'website': 'https://thedubaimall.com'
            }
        ]

        # Nightlife Attractions
        nightlife_spots = [
            {
                'name': 'Robot Restaurant Shinjuku',
                'city': tokyo,
                'description': 'Famous robot show dining experience with neon lights and entertainment',
                'rating': 4.1,
                'image_url': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
                'website': 'https://www.shinjuku-robot.com'
            },
            {
                'name': 'Moulin Rouge',
                'city': paris,
                'description': 'World-famous cabaret with spectacular shows and French cancan',
                'rating': 4.5,
                'image_url': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
                'website': 'https://www.moulinrouge.fr'
            },
            {
                'name': 'Times Square Nightlife',
                'city': new_york,
                'description': 'Vibrant nightlife district with Broadway shows, bars, and entertainment',
                'rating': 4.3,
                'image_url': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
                'website': 'https://www.timessquarenyc.org'
            },
            {
                'name': 'Soho Nightlife',
                'city': london,
                'description': 'Trendy nightlife area with cocktail bars, pubs, and live music venues',
                'rating': 4.4,
                'image_url': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
                'website': 'https://www.soho-london.com'
            },
            {
                'name': 'Clarke Quay',
                'city': singapore,
                'description': 'Riverside nightlife hub with bars, clubs, and restaurants',
                'rating': 4.2,
                'image_url': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
                'website': 'https://www.clarkequay.com.sg'
            },
            {
                'name': 'Dubai Marina Nightlife',
                'city': dubai,
                'description': 'Upscale nightlife with rooftop bars and waterfront dining',
                'rating': 4.6,
                'image_url': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&h=600&fit=crop',
                'website': 'https://www.dubaimarina.ae'
            }
        ]

        # Nightlife Restaurants (bars/clubs that serve food)
        nightlife_restaurants = [
            {
                'name': 'Sky Bar Tokyo',
                'city': tokyo,
                'description': 'High-end rooftop bar with panoramic city views and premium cocktails',
                'rating': 4.3,
                'cuisine': 'International',
                'price_level': '$$$',
                'image_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
                'website': 'https://www.skybartokyo.com'
            },
            {
                'name': 'Le Procope Paris',
                'city': paris,
                'description': 'Historic cafe-bar frequented by famous writers and intellectuals',
                'rating': 4.2,
                'cuisine': 'French',
                'price_level': '$$',
                'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
                'website': 'https://www.procope.com'
            },
            {
                'name': 'Rainbow Room NYC',
                'city': new_york,
                'description': 'Iconic cocktail lounge with stunning city views from the 65th floor',
                'rating': 4.5,
                'cuisine': 'American',
                'price_level': '$$$$',
                'image_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
                'website': 'https://www.rainbowroom.com'
            }
        ]

        # Add Shopping Centers
        created_shopping = 0
        for attraction_data in shopping_centers:
            attraction, created = Attraction.objects.get_or_create(
                name=attraction_data['name'],
                city=attraction_data['city'],
                defaults={
                    'category': shopping_category,
                    'description': attraction_data['description'],
                    'rating': attraction_data['rating'],
                    'image_url': attraction_data['image_url'],
                    'website': attraction_data['website']
                }
            )
            if created:
                created_shopping += 1
                self.stdout.write(f'✅ Added shopping center: {attraction_data["name"]}')

        # Add Nightlife Attractions
        created_nightlife_attr = 0
        for attraction_data in nightlife_spots:
            attraction, created = Attraction.objects.get_or_create(
                name=attraction_data['name'],
                city=attraction_data['city'],
                defaults={
                    'category': nightlife_category,
                    'description': attraction_data['description'],
                    'rating': attraction_data['rating'],
                    'image_url': attraction_data['image_url'],
                    'website': attraction_data['website']
                }
            )
            if created:
                created_nightlife_attr += 1
                self.stdout.write(f'✅ Added nightlife spot: {attraction_data["name"]}')

        # Add Nightlife Restaurants
        created_nightlife_rest = 0
        for restaurant_data in nightlife_restaurants:
            restaurant, created = Restaurant.objects.get_or_create(
                name=restaurant_data['name'],
                city=restaurant_data['city'],
                defaults={
                    'category': nightlife_category,
                    'description': restaurant_data['description'],
                    'rating': restaurant_data['rating'],
                    'cuisine': restaurant_data['cuisine'],
                    'price_level': restaurant_data['price_level'],
                    'image_url': restaurant_data['image_url'],
                    'website': restaurant_data['website']
                }
            )
            if created:
                created_nightlife_rest += 1
                self.stdout.write(f'✅ Added nightlife restaurant: {restaurant_data["name"]}')

        self.stdout.write(f'\n=== SUMMARY ===')
        self.stdout.write(f'Shopping Centers added: {created_shopping}')
        self.stdout.write(f'Nightlife attractions added: {created_nightlife_attr}')
        self.stdout.write(f'Nightlife restaurants added: {created_nightlife_rest}')
        self.stdout.write(f'Total destinations added: {created_shopping + created_nightlife_attr + created_nightlife_rest}')

        self.stdout.write(self.style.SUCCESS('\n🎉 Successfully filled empty categories with destinations!'))