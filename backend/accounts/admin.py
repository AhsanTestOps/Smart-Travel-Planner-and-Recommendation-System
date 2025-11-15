from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import UserProfile, LoginHistory


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fields = (
        'phone_number', 'date_of_birth', 'location', 'bio',
        'preferred_currency', 'preferred_language',
        'email_notifications', 'marketing_emails'
    )


class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with profile inline"""
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'last_login')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Profile admin interface"""
    list_display = ('user', 'full_name', 'location', 'preferred_currency', 'created_at')
    list_filter = ('preferred_currency', 'preferred_language', 'email_notifications', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'location')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('phone_number', 'date_of_birth', 'location', 'bio', 'avatar_url')
        }),
        ('Preferences', {
            'fields': ('preferred_currency', 'preferred_language', 'travel_preferences')
        }),
        ('Settings', {
            'fields': ('email_notifications', 'marketing_emails')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """Login History admin interface"""
    list_display = ('user', 'login_time', 'ip_address', 'device_type', 'success', 'location')
    list_filter = ('success', 'device_type', 'login_time')
    search_fields = ('user__username', 'user__email', 'ip_address', 'location')
    readonly_fields = ('user', 'login_time', 'ip_address', 'user_agent', 'device_type', 'location', 'success')
    date_hierarchy = 'login_time'
    ordering = ('-login_time',)
    
    def has_add_permission(self, request):
        return False  # Don't allow manual addition
    
    def has_change_permission(self, request, obj=None):
        return False  # Don't allow editing


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    """Enhanced Token admin interface"""
    list_display = ('key_display', 'user', 'user_email', 'created', 'is_active')
    list_filter = ('created',)
    search_fields = ('user__username', 'user__email', 'key')
    readonly_fields = ('key', 'created')
    ordering = ('-created',)
    
    def key_display(self, obj):
        """Display first 10 characters of token key"""
        return f"{obj.key[:10]}..."
    key_display.short_description = "Token Key"
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = "Email"
    
    def is_active(self, obj):
        """Check if user is active"""
        return obj.user.is_active
    is_active.boolean = True
    is_active.short_description = "User Active"


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Customize admin site headers
admin.site.site_header = "Smart Travel Planner Administration"
admin.site.site_title = "Smart Travel Planner Admin"
admin.site.index_title = "Welcome to Smart Travel Planner Administration"
