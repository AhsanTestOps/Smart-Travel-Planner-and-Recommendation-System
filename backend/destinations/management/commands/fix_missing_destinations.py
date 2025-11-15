from django.core.management.base import BaseCommand
from destinations.models import City, Category, Attraction, Hotel, Restaurant

class Command(BaseCommand):
    help = 'Fix missing attractions and ensure all cities have destinations'

    def handle(self, *args, **options):
        self.stdout.write('Adding missing attractions to cities...')

        # Get cities
        rome = City.objects.get(name='Rome', country='Italy')
        tokyo = City.objects.get(name='Tokyo', country='Japan')
        paris = City.objects.get(name='Paris', country='France')
        new_york = City.objects.get(name='New York', country='USA')
        london = City.objects.get(name='London', country='UK')
        singapore = City.objects.get(name='Singapore', country='Singapore')
        dubai = City.objects.get(name='Dubai', country='UAE')
        santorini = City.objects.get(name='Santorini', country='Greece')
        cusco = City.objects.get(name='Cusco', country='Peru')

        # Get categories
        historic_sites = Category.objects.get(name='Historic Sites')
        
        # Missing attractions that should exist
        missing_attractions = [
            {
                'name': 'Colosseum',
                'city': rome,
                'category': historic_sites,
                'description': 'Ancient Roman amphitheater and iconic symbol of Imperial Rome',
                'rating': 4.7,
                'image_url': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop',
                'website': 'https://www.coopculture.it'
            },
            {
                'name': 'Statue of Liberty',
                'city': new_york,
                'category': historic_sites,
                'description': 'Iconic symbol of freedom and democracy on Liberty Island',
                'rating': 4.5,
                'image_url': 'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=800&h=600&fit=crop',
                'website': 'https://www.nps.gov/stli/'
            },
            {
                'name': 'Central Park',
                'city': new_york,
                'category': Category.objects.get(name='Parks & Gardens'),
                'description': 'Massive public park in the heart of Manhattan',
                'rating': 4.4,
                'image_url': 'https://images.unsplash.com/photo-1518390888380-e45d8c2f7b41?w=800&h=600&fit=crop',
                'website': 'https://www.centralparknyc.org'
            },
            {
                'name': 'Times Square',
                'city': new_york,
                'category': Category.objects.get(name='Modern Architecture'),
                'description': 'Bright commercial intersection and entertainment hub',
                'rating': 4.2,
                'image_url': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
                'website': 'https://www.timessquarenyc.org'
            },
            {
                'name': 'Big Ben',
                'city': london,
                'category': historic_sites,
                'description': 'Famous clock tower and symbol of London',
                'rating': 4.6,
                'image_url': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
                'website': 'https://www.parliament.uk'
            },
            {
                'name': 'London Bridge',
                'city': london,
                'category': historic_sites,
                'description': 'Historic bridge crossing the River Thames',
                'rating': 4.3,
                'image_url': 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&h=600&fit=crop',
                'website': 'https://www.cityoflondon.gov.uk'
            }
        ]

        created_count = 0
        for attraction_data in missing_attractions:
            attraction, created = Attraction.objects.get_or_create(
                name=attraction_data['name'],
                city=attraction_data['city'],
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
                self.stdout.write(f'✅ Added: {attraction_data["name"]} to {attraction_data["city"]}')
            else:
                self.stdout.write(f'⚠️  Already exists: {attraction_data["name"]}')

        # Add some missing hotels to cities that need them
        missing_hotels = [
            {
                'name': 'The Plaza',
                'city': new_york,
                'category': Category.objects.get(name='Luxury Hotels'),
                'description': 'Legendary luxury hotel on Fifth Avenue',
                'rating': 4.5,
                'price_per_night': 800,
                'image_url': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
                'website': 'https://www.theplazany.com'
            },
            {
                'name': 'The Savoy',
                'city': london,
                'category': Category.objects.get(name='Luxury Hotels'),
                'description': 'Iconic luxury hotel on the Strand',
                'rating': 4.6,
                'price_per_night': 600,
                'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
                'website': 'https://www.thesavoylondon.com'
            },
            {
                'name': 'Hotel de Crillon',
                'city': paris,
                'category': Category.objects.get(name='Luxury Hotels'),
                'description': 'Palace hotel on Place de la Concorde',
                'rating': 4.8,
                'price_per_night': 900,
                'image_url': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
                'website': 'https://www.rosewoodhotels.com'
            }
        ]

        for hotel_data in missing_hotels:
            hotel, created = Hotel.objects.get_or_create(
                name=hotel_data['name'],
                city=hotel_data['city'],
                defaults={
                    'category': hotel_data['category'],
                    'description': hotel_data['description'],
                    'rating': hotel_data['rating'],
                    'price_per_night': hotel_data['price_per_night'],
                    'image_url': hotel_data['image_url'],
                    'website': hotel_data['website']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Added hotel: {hotel_data["name"]} to {hotel_data["city"]}')

        # Add some missing restaurants
        missing_restaurants = [
            {
                'name': 'Le Jules Verne',
                'city': paris,
                'category': Category.objects.get(name='Fine Dining'),
                'description': 'Michelin-starred restaurant in the Eiffel Tower',
                'rating': 4.7,
                'cuisine': 'French',
                'price_level': '$$$$',
                'image_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
                'website': 'https://www.lejulesverne-paris.com'
            },
            {
                'name': 'Eleven Madison Park',
                'city': new_york,
                'category': Category.objects.get(name='Fine Dining'),
                'description': 'Renowned plant-based fine dining restaurant',
                'rating': 4.6,
                'cuisine': 'American',
                'price_level': '$$$$',
                'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
                'website': 'https://www.elevenmadisonpark.com'
            },
            {
                'name': 'Sketch London',
                'city': london,
                'category': Category.objects.get(name='Fine Dining'),
                'description': 'Artistic dining experience with unique design',
                'rating': 4.4,
                'cuisine': 'Modern European',
                'price_level': '$$$',
                'image_url': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop',
                'website': 'https://sketch.london'
            },
            {
                'name': 'Ce La Vie Singapore',
                'city': singapore,
                'category': Category.objects.get(name='Fine Dining'),
                'description': 'Rooftop restaurant with stunning city views',
                'rating': 4.5,
                'cuisine': 'Asian Fusion',
                'price_level': '$$$',
                'image_url': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
                'website': 'https://www.celavi.com.sg'
            }
        ]

        for restaurant_data in missing_restaurants:
            restaurant, created = Restaurant.objects.get_or_create(
                name=restaurant_data['name'],
                city=restaurant_data['city'],
                defaults={
                    'category': restaurant_data['category'],
                    'description': restaurant_data['description'],
                    'rating': restaurant_data['rating'],
                    'cuisine': restaurant_data['cuisine'],
                    'price_level': restaurant_data['price_level'],
                    'image_url': restaurant_data['image_url'],
                    'website': restaurant_data['website']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Added restaurant: {restaurant_data["name"]} to {restaurant_data["city"]}')

        self.stdout.write(f'\n=== FINAL CITY STATUS ===')
        for city in City.objects.all():
            a_count = city.attractions.count()
            h_count = city.hotels.count()
            r_count = city.restaurants.count()
            total = a_count + h_count + r_count
            status = "✅" if total > 0 else "❌"
            self.stdout.write(f'{status} {city.name}, {city.country}: {total} total (A:{a_count} H:{h_count} R:{r_count})')

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Added {created_count} destinations! All cities should now have content.'))