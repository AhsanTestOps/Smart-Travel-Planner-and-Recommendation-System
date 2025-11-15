from django.contrib import admin
from .models import City, Category, Attraction, Hotel, Restaurant


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'is_active', 'created_at']
    list_filter = ['country', 'is_active', 'created_at']
    search_fields = ['name', 'country']
    list_editable = ['is_active']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'country', 'description')
        }),
        ('Display', {
            'fields': ('image_url', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'icon']
    list_filter = ['type']
    search_fields = ['name']
    ordering = ['type', 'name']


@admin.register(Attraction)
class AttractionAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'category', 'rating', 'is_active']
    list_filter = ['city', 'category', 'is_active', 'rating']
    search_fields = ['name', 'city__name', 'description']
    list_editable = ['is_active', 'rating']
    ordering = ['city', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'city', 'category', 'description')
        }),
        ('Location Details', {
            'fields': ('address', 'latitude', 'longitude')
        }),
        ('Online Presence', {
            'fields': ('image_url', 'website')
        }),
        ('Settings', {
            'fields': ('rating', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'category', 'rating', 'price_per_night', 'is_active']
    list_filter = ['city', 'category', 'is_active', 'rating']
    search_fields = ['name', 'city__name', 'description']
    list_editable = ['is_active', 'rating', 'price_per_night']
    ordering = ['city', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'city', 'category', 'description')
        }),
        ('Location Details', {
            'fields': ('address',)
        }),
        ('Online Presence', {
            'fields': ('image_url', 'website')
        }),
        ('Pricing & Rating', {
            'fields': ('rating', 'price_per_night')
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'category', 'cuisine', 'rating', 'price_level', 'is_active']
    list_filter = ['city', 'category', 'cuisine', 'price_level', 'is_active', 'rating']
    search_fields = ['name', 'city__name', 'cuisine', 'description']
    list_editable = ['is_active', 'rating', 'price_level']
    ordering = ['city', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'city', 'category', 'description')
        }),
        ('Location Details', {
            'fields': ('address',)
        }),
        ('Restaurant Details', {
            'fields': ('cuisine', 'price_level')
        }),
        ('Online Presence', {
            'fields': ('image_url', 'website')
        }),
        ('Settings', {
            'fields': ('rating', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )