from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile for additional user information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    preferred_currency = models.CharField(max_length=10, default='USD')
    preferred_language = models.CharField(max_length=10, default='en')
    travel_preferences = models.JSONField(default=dict, blank=True)  # Store travel preferences
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    # Settings
    email_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()
    
    @property
    def initials(self):
        if self.user.first_name and self.user.last_name:
            return f"{self.user.first_name[0]}{self.user.last_name[0]}".upper()
        elif self.user.first_name:
            return self.user.first_name[:2].upper()
        else:
            return self.user.username[:2].upper()


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """Automatically create or update user profile when user is created/updated"""
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Update profile if it exists
        if hasattr(instance, 'profile'):
            instance.profile.save()


class LoginHistory(models.Model):
    """Track user login history for security and analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)  # mobile, desktop, tablet
    location = models.CharField(max_length=100, blank=True)  # City, Country
    success = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Login History"
        verbose_name_plural = "Login Histories"
        ordering = ['-login_time']
    
    def __str__(self):
        status = "✅" if self.success else "❌"
        return f"{status} {self.user.username} - {self.login_time.strftime('%Y-%m-%d %H:%M')}"
