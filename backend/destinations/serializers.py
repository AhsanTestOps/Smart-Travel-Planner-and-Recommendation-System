from rest_framework import serializers
from .models import City, Category, Attraction, Hotel, Restaurant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'icon']


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'country', 'description', 'image_url']


class AttractionSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Attraction
        fields = [
            'id', 'name', 'city', 'category', 'description', 'address',
            'latitude', 'longitude', 'image_url', 'website', 'rating'
        ]


class HotelSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'city', 'category', 'address', 'description',
            'image_url', 'website', 'rating', 'price_per_night'
        ]


class RestaurantSerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'city', 'category', 'address', 'description',
            'image_url', 'website', 'cuisine', 'rating', 'price_level'
        ]


# Detailed serializers for browsing
class CityDetailSerializer(serializers.ModelSerializer):
    attractions_count = serializers.SerializerMethodField()
    hotels_count = serializers.SerializerMethodField()
    restaurants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = City
        fields = [
            'id', 'name', 'country', 'description', 'image_url',
            'attractions_count', 'hotels_count', 'restaurants_count'
        ]
    
    def get_attractions_count(self, obj):
        return obj.attractions.filter(is_active=True).count()
    
    def get_hotels_count(self, obj):
        return obj.hotels.filter(is_active=True).count()
    
    def get_restaurants_count(self, obj):
        return obj.restaurants.filter(is_active=True).count()