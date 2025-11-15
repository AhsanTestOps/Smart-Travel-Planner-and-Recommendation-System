from django.contrib import admin
from .models import FreeTrip, FreeTripPlan, FreeTripLocation


@admin.register(FreeTripPlan)
class FreeTripPlanAdmin(admin.ModelAdmin):
    """Enhanced Free Trip Plan admin interface"""
    list_display = ('title_display', 'destination', 'start_date', 'end_date', 'total_travelers', 'budget_display', 'views_count', 'created_at')
    list_filter = ('accommodation_type', 'transportation_mode', 'trip_type', 'currency', 'created_at', 'is_active')
    search_fields = ('title', 'destination', 'contact_name', 'contact_email', 'session_id')
    readonly_fields = ('session_id', 'duration_days', 'total_travelers', 'budget_per_person', 'views_count', 'created_at', 'updated_at')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('session_id', 'title', 'destination', 'description')
        }),
        ('Trip Dates', {
            'fields': ('start_date', 'end_date', 'duration_days')
        }),
        ('Travelers', {
            'fields': ('adults', 'children', 'total_travelers')
        }),
        ('Budget', {
            'fields': ('budget', 'currency', 'budget_per_person')
        }),
        ('Preferences', {
            'fields': ('accommodation_type', 'transportation_mode', 'trip_type', 'interests', 'special_requirements')
        }),
        ('Contact Information', {
            'fields': ('contact_name', 'contact_email'),
            'classes': ('collapse',)
        }),
        ('Location Data', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Generated Content', {
            'fields': ('itinerary', 'recommendations', 'estimated_costs'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('is_active', 'views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def title_display(self, obj):
        """Display title or destination"""
        return obj.title or f"Trip to {obj.destination}"
    title_display.short_description = "Title"
    
    def budget_display(self, obj):
        """Display formatted budget"""
        if obj.budget:
            return f"{obj.budget} {obj.currency}"
        return "Not specified"
    budget_display.short_description = "Budget"


@admin.register(FreeTripLocation)
class FreeTripLocationAdmin(admin.ModelAdmin):
    """Free Trip Location admin interface"""
    list_display = ('name', 'country', 'continent', 'trip_count', 'popularity_score', 'currency', 'timezone')
    list_filter = ('continent', 'country', 'currency', 'created_at')
    search_fields = ('name', 'country', 'country_code', 'timezone', 'language')
    readonly_fields = ('trip_count', 'created_at', 'updated_at')
    ordering = ('-popularity_score', 'name')
    
    fieldsets = (
        ('Location Information', {
            'fields': ('name', 'country', 'country_code', 'continent')
        }),
        ('Coordinates', {
            'fields': ('latitude', 'longitude')
        }),
        ('Local Information', {
            'fields': ('timezone', 'currency', 'language')
        }),
        ('Popularity Metrics', {
            'fields': ('trip_count', 'popularity_score')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Legacy Free Trip model admin (for backward compatibility)
@admin.register(FreeTrip)
class FreeTripAdmin(admin.ModelAdmin):
    """Legacy Free Trip admin interface"""
    list_display = [
        'destination', 
        'start_date', 
        'end_date', 
        'adults', 
        'budget',
        'contact_name',
        'contact_email',
        'session_id',
        'created_at',
        'is_active'
    ]
    list_filter = [
        'is_active',
        'created_at',
        'start_date',
        'currency',
        'accommodation_type'
    ]
    search_fields = [
        'destination',
        'contact_name',
        'contact_email',
        'session_id'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Trip Information', {
            'fields': ('destination', 'start_date', 'end_date', 'description')
        }),
        ('Budget & Travelers', {
            'fields': ('budget', 'currency', 'adults', 'children')
        }),
        ('Preferences', {
            'fields': ('accommodation_type', 'transportation_mode', 'interests')
        }),
        ('Contact Information', {
            'fields': ('contact_name', 'contact_email')
        }),
        ('Generated Content', {
            'fields': ('itinerary',)
        }),
        ('System', {
            'fields': ('session_id', 'is_active', 'created_at', 'updated_at')
        }),
    )
