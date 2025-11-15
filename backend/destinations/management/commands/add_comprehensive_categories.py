from django.core.management.base import BaseCommand
from destinations.models import Category

class Command(BaseCommand):
    help = 'Add comprehensive categories for destinations'

    def handle(self, *args, **options):
        self.stdout.write('Adding comprehensive destination categories...')

        # Complete list of destination categories
        categories_to_add = [
            # Attractions & Sightseeing
            {'name': 'Historic Sites', 'type': 'sightseeing', 'icon': '🏛️'},
            {'name': 'Museums', 'type': 'sightseeing', 'icon': '🏛️'},
            {'name': 'Art Galleries', 'type': 'culture', 'icon': '🎨'},
            {'name': 'Monuments', 'type': 'sightseeing', 'icon': '🗿'},
            {'name': 'Castles & Palaces', 'type': 'sightseeing', 'icon': '🏰'},
            {'name': 'Religious Sites', 'type': 'culture', 'icon': '⛪'},
            {'name': 'Temples', 'type': 'culture', 'icon': '🛕'},
            {'name': 'Churches', 'type': 'culture', 'icon': '⛪'},
            {'name': 'Mosques', 'type': 'culture', 'icon': '🕌'},
            
            # Nature & Outdoor
            {'name': 'National Parks', 'type': 'nature', 'icon': '🏞️'},
            {'name': 'Beaches', 'type': 'nature', 'icon': '🏖️'},
            {'name': 'Mountains', 'type': 'nature', 'icon': '⛰️'},
            {'name': 'Lakes', 'type': 'nature', 'icon': '🏔️'},
            {'name': 'Waterfalls', 'type': 'nature', 'icon': '💧'},
            {'name': 'Gardens & Parks', 'type': 'nature', 'icon': '🌳'},
            {'name': 'Botanical Gardens', 'type': 'nature', 'icon': '🌺'},
            {'name': 'Zoos', 'type': 'nature', 'icon': '🦁'},
            {'name': 'Aquariums', 'type': 'nature', 'icon': '🐠'},
            
            # Modern & Architecture
            {'name': 'Modern Architecture', 'type': 'sightseeing', 'icon': '🏢'},
            {'name': 'Skyscrapers', 'type': 'sightseeing', 'icon': '🏙️'},
            {'name': 'Bridges', 'type': 'sightseeing', 'icon': '🌉'},
            {'name': 'Towers', 'type': 'sightseeing', 'icon': '🗼'},
            {'name': 'Observatories', 'type': 'sightseeing', 'icon': '🔭'},
            
            # Entertainment & Activities
            {'name': 'Theme Parks', 'type': 'adventure', 'icon': '🎢'},
            {'name': 'Water Parks', 'type': 'adventure', 'icon': '🏊'},
            {'name': 'Amusement Parks', 'type': 'adventure', 'icon': '🎡'},
            {'name': 'Theaters', 'type': 'culture', 'icon': '🎭'},
            {'name': 'Concert Halls', 'type': 'culture', 'icon': '🎵'},
            {'name': 'Sports Stadiums', 'type': 'adventure', 'icon': '🏟️'},
            {'name': 'Casinos', 'type': 'nightlife', 'icon': '🎰'},
            
            # Adventure & Sports
            {'name': 'Adventure Sports', 'type': 'adventure', 'icon': '🏂'},
            {'name': 'Hiking Trails', 'type': 'adventure', 'icon': '🥾'},
            {'name': 'Diving Sites', 'type': 'adventure', 'icon': '🤿'},
            {'name': 'Ski Resorts', 'type': 'adventure', 'icon': '⛷️'},
            {'name': 'Golf Courses', 'type': 'adventure', 'icon': '⛳'},
            
            # Shopping & Markets
            {'name': 'Shopping Malls', 'type': 'shopping', 'icon': '🛍️'},
            {'name': 'Markets', 'type': 'shopping', 'icon': '🏪'},
            {'name': 'Bazaars', 'type': 'shopping', 'icon': '🧺'},
            {'name': 'Street Markets', 'type': 'shopping', 'icon': '🛒'},
            {'name': 'Souvenir Shops', 'type': 'shopping', 'icon': '🎁'},
            
            # Food & Dining Categories
            {'name': 'Fine Dining', 'type': 'food', 'icon': '🍽️'},
            {'name': 'Local Cuisine', 'type': 'food', 'icon': '🍜'},
            {'name': 'Street Food', 'type': 'food', 'icon': '🌮'},
            {'name': 'Cafes', 'type': 'food', 'icon': '☕'},
            {'name': 'Bars', 'type': 'nightlife', 'icon': '🍸'},
            {'name': 'Rooftop Restaurants', 'type': 'food', 'icon': '🏙️'},
            {'name': 'Seafood Restaurants', 'type': 'food', 'icon': '🦞'},
            {'name': 'Vegetarian Restaurants', 'type': 'food', 'icon': '🥗'},
            {'name': 'Fast Food', 'type': 'food', 'icon': '🍔'},
            {'name': 'Bakeries', 'type': 'food', 'icon': '🥖'},
            
            # Hotel Categories
            {'name': 'Luxury Hotels', 'type': 'hotel', 'icon': '🏨'},
            {'name': 'Boutique Hotels', 'type': 'hotel', 'icon': '🏩'},
            {'name': 'Budget Hotels', 'type': 'hotel', 'icon': '🏠'},
            {'name': 'Hostels', 'type': 'hotel', 'icon': '🛏️'},
            {'name': 'Resorts', 'type': 'hotel', 'icon': '🏖️'},
            {'name': 'Spa Hotels', 'type': 'hotel', 'icon': '🧘'},
            {'name': 'Business Hotels', 'type': 'hotel', 'icon': '💼'},
            {'name': 'Historic Hotels', 'type': 'hotel', 'icon': '🏛️'},
            {'name': 'Beach Hotels', 'type': 'hotel', 'icon': '🏖️'},
            {'name': 'Mountain Hotels', 'type': 'hotel', 'icon': '⛰️'},
            
            # Nightlife & Entertainment
            {'name': 'Nightclubs', 'type': 'nightlife', 'icon': '🕺'},
            {'name': 'Live Music Venues', 'type': 'nightlife', 'icon': '🎸'},
            {'name': 'Comedy Clubs', 'type': 'nightlife', 'icon': '😂'},
            {'name': 'Wine Bars', 'type': 'nightlife', 'icon': '🍷'},
            {'name': 'Cocktail Bars', 'type': 'nightlife', 'icon': '🍹'},
            
            # Scenic & Views
            {'name': 'Scenic Views', 'type': 'nature', 'icon': '📸'},
            {'name': 'Sunset Points', 'type': 'nature', 'icon': '🌅'},
            {'name': 'Panoramic Views', 'type': 'nature', 'icon': '🏞️'},
            {'name': 'Photo Spots', 'type': 'sightseeing', 'icon': '📷'},
            
            # Transportation & Infrastructure
            {'name': 'Airports', 'type': 'other', 'icon': '✈️'},
            {'name': 'Train Stations', 'type': 'other', 'icon': '🚂'},
            {'name': 'Ports', 'type': 'other', 'icon': '⚓'},
            
            # Cultural & Educational
            {'name': 'Libraries', 'type': 'culture', 'icon': '📚'},
            {'name': 'Universities', 'type': 'culture', 'icon': '🎓'},
            {'name': 'Cultural Centers', 'type': 'culture', 'icon': '🎭'},
            {'name': 'Festivals', 'type': 'culture', 'icon': '🎊'},
            
            # Special Interest
            {'name': 'Ghost Tours', 'type': 'adventure', 'icon': '👻'},
            {'name': 'Food Tours', 'type': 'food', 'icon': '🍴'},
            {'name': 'Walking Tours', 'type': 'sightseeing', 'icon': '🚶'},
            {'name': 'Boat Tours', 'type': 'adventure', 'icon': '🛥️'},
            {'name': 'Photography Tours', 'type': 'sightseeing', 'icon': '📸'},
        ]

        created_count = 0
        updated_count = 0

        for category_data in categories_to_add:
            category, created = Category.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'type': category_data['type'],
                    'icon': category_data['icon']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created: {category_data["name"]} ({category_data["type"]})')
            else:
                # Update existing category with icon if it doesn't have one
                if not category.icon and category_data['icon']:
                    category.icon = category_data['icon']
                    category.save()
                    updated_count += 1
                    self.stdout.write(f'🔄 Updated icon for: {category_data["name"]}')

        self.stdout.write(f'\n=== SUMMARY ===')
        self.stdout.write(f'Categories created: {created_count}')
        self.stdout.write(f'Categories updated: {updated_count}')
        self.stdout.write(f'Total categories in database: {Category.objects.count()}')
        
        # Show categories by type
        self.stdout.write(f'\n=== CATEGORIES BY TYPE ===')
        for category_type, type_name in Category.CATEGORY_TYPES:
            count = Category.objects.filter(type=category_type).count()
            self.stdout.write(f'{type_name}: {count} categories')

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Successfully added comprehensive destination categories!'))