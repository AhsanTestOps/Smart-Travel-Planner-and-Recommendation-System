from django.contrib import admin
from .models import AIItinerary, BudgetEstimate, AIGenerationLog

@admin.register(AIItinerary)
class AIItineraryAdmin(admin.ModelAdmin):
    list_display = ['destination', 'duration_days', 'budget', 'travel_style', 'user', 'created_at', 'is_anonymous']
    list_filter = ['budget', 'travel_style', 'created_at', 'user']
    search_fields = ['destination', 'interests']
    readonly_fields = ['id', 'created_at', 'updated_at', 'generation_time', 'is_anonymous', 'total_travelers']
    
    fieldsets = (
        ('Trip Information', {
            'fields': ('id', 'destination', 'start_date', 'end_date', 'duration_days', 'adults', 'children')
        }),
        ('User Information', {
            'fields': ('user', 'session_id', 'is_anonymous', 'total_travelers')
        }),
        ('Preferences', {
            'fields': ('budget', 'budget_amount', 'currency', 'travel_style', 'interests', 
                      'accommodation_preference', 'transportation_preference')
        }),
        ('AI Generated Content', {
            'fields': ('itinerary_content', 'budget_breakdown', 'recommendations'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'ai_model_used', 'generation_time')
        })
    )
    
    def has_change_permission(self, request, obj=None):
        # Allow viewing but limit editing of AI generated content
        return True
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

@admin.register(BudgetEstimate)
class BudgetEstimateAdmin(admin.ModelAdmin):
    list_display = ['itinerary', 'total_min', 'total_max', 'created_at']
    list_filter = ['created_at']
    search_fields = ['itinerary__destination']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Itinerary', {
            'fields': ('itinerary',)
        }),
        ('Accommodation', {
            'fields': ('accommodation_min', 'accommodation_max', 'accommodation_recommendations')
        }),
        ('Transportation', {
            'fields': ('transportation_min', 'transportation_max', 'transportation_breakdown')
        }),
        ('Food & Dining', {
            'fields': ('food_min', 'food_max', 'dining_recommendations')
        }),
        ('Activities', {
            'fields': ('activities_min', 'activities_max', 'activities_breakdown')
        }),
        ('Other Expenses', {
            'fields': ('shopping_min', 'shopping_max', 'miscellaneous', 'emergency_fund')
        }),
        ('Totals', {
            'fields': ('total_min', 'total_max')
        }),
        ('Alternatives', {
            'fields': ('budget_alternatives', 'luxury_alternatives'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        })
    )

@admin.register(AIGenerationLog)
class AIGenerationLogAdmin(admin.ModelAdmin):
    list_display = ['itinerary', 'request_type', 'success', 'response_time', 'timestamp']
    list_filter = ['request_type', 'success', 'timestamp']
    search_fields = ['itinerary__destination']
    readonly_fields = ['timestamp']
    
    fieldsets = (
        ('Generation Info', {
            'fields': ('itinerary', 'request_type', 'success', 'response_time', 'tokens_used')
        }),
        ('Content', {
            'fields': ('prompt_sent', 'response_received', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('timestamp',)
        })
    )
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Logs should not be edited
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
