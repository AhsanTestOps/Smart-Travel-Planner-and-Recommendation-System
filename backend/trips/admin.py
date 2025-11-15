from django.contrib import admin
from .models import Trip, TripPlan, TripExpense, TripPhoto


@admin.register(TripPlan)
class TripPlanAdmin(admin.ModelAdmin):
    """Enhanced Trip Plan admin interface"""
    list_display = ('title', 'user', 'destination', 'start_date', 'end_date', 'status', 'total_budget_display', 'created_at')
    list_filter = ('status', 'accommodation_type', 'transportation_mode', 'currency', 'created_at', 'is_public')
    search_fields = ('title', 'destination', 'user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('duration_days', 'total_travelers', 'total_budget', 'created_at', 'updated_at')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'destination')
        }),
        ('Trip Dates', {
            'fields': ('start_date', 'end_date', 'duration_days')
        }),
        ('Travelers', {
            'fields': ('adults', 'children', 'infants', 'total_travelers')
        }),
        ('Budget', {
            'fields': ('budget_per_person', 'currency', 'total_budget')
        }),
        ('Preferences', {
            'fields': ('accommodation_type', 'transportation_mode', 'interests', 'special_requirements')
        }),
        ('Generated Content', {
            'fields': ('itinerary', 'recommendations', 'booking_links'),
            'classes': ('collapse',)
        }),
        ('Status & Settings', {
            'fields': ('status', 'is_public', 'is_favorite', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_budget_display(self, obj):
        """Display formatted total budget"""
        return f"{obj.total_budget} {obj.currency}"
    total_budget_display.short_description = "Total Budget"


class TripExpenseInline(admin.TabularInline):
    model = TripExpense
    extra = 0
    fields = ('category', 'title', 'amount', 'currency', 'expense_date')
    readonly_fields = ('created_at',)


class TripPhotoInline(admin.TabularInline):
    model = TripPhoto
    extra = 0
    fields = ('title', 'image_url', 'location', 'taken_date')
    readonly_fields = ('created_at',)


@admin.register(TripExpense)
class TripExpenseAdmin(admin.ModelAdmin):
    """Trip Expense admin interface"""
    list_display = ('trip', 'title', 'category', 'amount', 'currency', 'expense_date')
    list_filter = ('category', 'currency', 'expense_date', 'created_at')
    search_fields = ('trip__title', 'trip__destination', 'title', 'description')
    date_hierarchy = 'expense_date'
    ordering = ('-expense_date', '-created_at')
    
    fieldsets = (
        ('Expense Information', {
            'fields': ('trip', 'category', 'title', 'description')
        }),
        ('Amount & Date', {
            'fields': ('amount', 'currency', 'expense_date')
        }),
        ('Receipt', {
            'fields': ('receipt_url',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TripPhoto)
class TripPhotoAdmin(admin.ModelAdmin):
    """Trip Photo admin interface"""
    list_display = ('trip', 'title', 'location', 'taken_date', 'created_at')
    list_filter = ('taken_date', 'created_at')
    search_fields = ('trip__title', 'trip__destination', 'title', 'location')
    date_hierarchy = 'taken_date'
    ordering = ('-taken_date', '-created_at')
    
    fieldsets = (
        ('Photo Information', {
            'fields': ('trip', 'title', 'description')
        }),
        ('Image', {
            'fields': ('image_url', 'thumbnail_url')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Date', {
            'fields': ('taken_date',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


# Legacy Trip model admin (for backward compatibility)
@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    """Legacy Trip admin interface"""
    list_display = ('destination', 'user', 'start_date', 'end_date', 'travelers', 'budget_per_person', 'created_at')
    list_filter = ('created_at', 'start_date', 'end_date')
    search_fields = ('destination', 'user__username', 'user__email')
    date_hierarchy = 'start_date'
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Trip Information', {
            'fields': ('user', 'destination', 'start_date', 'end_date', 'travelers')
        }),
        ('Budget', {
            'fields': ('budget_per_person',)
        }),
        ('Preferences', {
            'fields': ('interests',)
        }),
        ('Generated Content', {
            'fields': ('itinerary',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
