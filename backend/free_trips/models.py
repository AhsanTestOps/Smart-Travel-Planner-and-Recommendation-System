from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid


class FreeTripPlan(models.Model):
    """Free trip planning model for anonymous users"""
    ACCOMMODATION_CHOICES = [
        ('budget', 'Budget (Hostels, Budget Hotels)'),
        ('mid-range', 'Mid-Range (3-star Hotels)'),
        ('luxury', 'Luxury (4-5 star Hotels)'),
        ('apartment', 'Apartment/Airbnb'),
        ('mixed', 'Mixed Options'),
    ]
    
    TRANSPORTATION_CHOICES = [
        ('budget', 'Budget (Bus, Budget Airlines)'),
        ('standard', 'Standard (Regular Airlines, Train)'),
        ('premium', 'Premium (Business Class, First Class)'),
        ('mixed', 'Mixed Options'),
    ]
    
    TRIP_TYPE_CHOICES = [
        ('adventure', 'Adventure & Outdoor'),
        ('cultural', 'Cultural & Historical'),
        ('relaxation', 'Beach & Relaxation'),
        ('city', 'City Break'),
        ('nature', 'Nature & Wildlife'),
        ('family', 'Family Friendly'),
        ('romantic', 'Romantic Getaway'),
        ('business', 'Business Travel'),
        ('mixed', 'Mixed Interests'),
    ]
    
    # Unique identifier for anonymous sessions
    session_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    # Trip basic information
    destination = models.CharField(max_length=200)
    title = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Budget information
    budget = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='USD')
    
    # Traveler information
    adults = models.IntegerField(
        default=1, 
        validators=[MinValueValidator(1), MaxValueValidator(20)]
    )
    children = models.IntegerField(
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    # Preferences
    accommodation_type = models.CharField(
        max_length=20, 
        choices=ACCOMMODATION_CHOICES, 
        default='mid-range'
    )
    transportation_mode = models.CharField(
        max_length=20, 
        choices=TRANSPORTATION_CHOICES, 
        default='standard'
    )
    trip_type = models.CharField(
        max_length=20, 
        choices=TRIP_TYPE_CHOICES, 
        default='mixed'
    )
    interests = models.JSONField(default=list)  # Store as JSON array
    special_requirements = models.TextField(blank=True)
    
    # Trip details
    description = models.TextField(blank=True)
    
    # Optional contact info for future reference
    contact_email = models.EmailField(blank=True)
    contact_name = models.CharField(max_length=100, blank=True)
    
    # Generated content
    itinerary = models.JSONField(default=dict)  # Store AI-generated itinerary
    recommendations = models.JSONField(default=dict)  # Store recommendations
    estimated_costs = models.JSONField(default=dict)  # Store cost breakdown
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    
    # Location coordinates for map display
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Free Trip Plan"
        verbose_name_plural = "Free Trip Plans"
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['destination']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        title = self.title or f"Trip to {self.destination}"
        return f"{title} ({self.start_date} - {self.end_date})"
    
    @property
    def duration_days(self):
        """Calculate trip duration in days"""
        return (self.end_date - self.start_date).days + 1
    
    @property
    def total_travelers(self):
        """Calculate total number of travelers"""
        return self.adults + self.children
    
    @property
    def budget_per_person(self):
        """Calculate budget per person"""
        if self.budget and self.total_travelers > 0:
            return self.budget / self.total_travelers
        return None
    
    def increment_views(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class FreeTripLocation(models.Model):
    """Store popular destinations with coordinates for map display"""
    name = models.CharField(max_length=200, unique=True)
    country = models.CharField(max_length=100)
    country_code = models.CharField(max_length=2)
    continent = models.CharField(max_length=50)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    
    # Additional info
    timezone = models.CharField(max_length=50, blank=True)
    currency = models.CharField(max_length=3, blank=True)
    language = models.CharField(max_length=50, blank=True)
    
    # Popularity metrics
    trip_count = models.PositiveIntegerField(default=0)  # How many trips to this destination
    popularity_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-popularity_score', 'name']
        verbose_name = "Free Trip Location"
        verbose_name_plural = "Free Trip Locations"
        indexes = [
            models.Index(fields=['country']),
            models.Index(fields=['popularity_score']),
        ]
    
    def __str__(self):
        return f"{self.name}, {self.country}"


# Keep the old FreeTrip model for backward compatibility
class FreeTrip(models.Model):
    """Legacy FreeTrip model - will be migrated to FreeTripPlan"""
    destination = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    accommodation_type = models.CharField(max_length=100, blank=True)
    transportation_mode = models.CharField(max_length=100, blank=True)
    interests = models.TextField(blank=True)
    description = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_name = models.CharField(max_length=100, blank=True)
    itinerary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    session_id = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Free Trip to {self.destination} ({self.start_date} - {self.end_date})"
