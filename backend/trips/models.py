from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class TripPlan(models.Model):
    """Main trip planning model for authenticated users"""
    TRIP_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('planned', 'Planned'),
        ('booked', 'Booked'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    ACCOMMODATION_CHOICES = [
        ('hotel', 'Hotel'),
        ('resort', 'Resort'),
        ('hostel', 'Hostel'),
        ('apartment', 'Apartment'),
        ('guesthouse', 'Guesthouse'),
        ('camping', 'Camping'),
        ('other', 'Other'),
    ]
    
    TRANSPORTATION_CHOICES = [
        ('flight', 'Flight'),
        ('car', 'Car'),
        ('bus', 'Bus'),
        ('train', 'Train'),
        ('ship', 'Ship'),
        ('mixed', 'Mixed'),
        ('other', 'Other'),
    ]
    
    # Basic trip information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_plans')
    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Travelers
    adults = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(50)])
    children = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(20)])
    infants = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(10)])
    
    # Budget
    budget_per_person = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='USD')
    
    # Preferences
    accommodation_type = models.CharField(
        max_length=20, 
        choices=ACCOMMODATION_CHOICES, 
        default='hotel'
    )
    transportation_mode = models.CharField(
        max_length=20, 
        choices=TRANSPORTATION_CHOICES, 
        default='flight'
    )
    interests = models.JSONField(default=list)  # Store as JSON array
    special_requirements = models.TextField(blank=True)
    
    # Generated content
    itinerary = models.JSONField(default=dict)  # Store generated itinerary
    recommendations = models.JSONField(default=dict)  # Store AI recommendations
    booking_links = models.JSONField(default=dict)  # Store booking information
    
    # Trip status and metadata
    status = models.CharField(max_length=20, choices=TRIP_STATUS_CHOICES, default='draft')
    is_public = models.BooleanField(default=False)  # Allow sharing
    is_favorite = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Trip Plan"
        verbose_name_plural = "Trip Plans"
    
    def __str__(self):
        return f"{self.title} - {self.destination} ({self.start_date})"
    
    @property
    def duration_days(self):
        """Calculate trip duration in days"""
        return (self.end_date - self.start_date).days + 1
    
    @property
    def total_travelers(self):
        """Calculate total number of travelers"""
        return self.adults + self.children + self.infants
    
    @property
    def total_budget(self):
        """Calculate total budget for all travelers"""
        return self.budget_per_person * (self.adults + self.children)  # Infants usually free
    
    @property
    def is_past_trip(self):
        """Check if trip date has passed"""
        from django.utils import timezone
        return self.end_date < timezone.now().date()


class TripExpense(models.Model):
    """Track expenses for a trip"""
    EXPENSE_CATEGORIES = [
        ('accommodation', 'Accommodation'),
        ('transportation', 'Transportation'),
        ('food', 'Food & Dining'),
        ('activities', 'Activities & Tours'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    
    trip = models.ForeignKey(TripPlan, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=20, choices=EXPENSE_CATEGORIES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    expense_date = models.DateField()
    receipt_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-expense_date', '-created_at']
        verbose_name = "Trip Expense"
        verbose_name_plural = "Trip Expenses"
    
    def __str__(self):
        return f"{self.trip.title} - {self.title} ({self.amount} {self.currency})"


class TripPhoto(models.Model):
    """Store trip photos and memories"""
    trip = models.ForeignKey(TripPlan, on_delete=models.CASCADE, related_name='photos')
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    image_url = models.URLField()
    thumbnail_url = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    taken_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-taken_date', '-created_at']
        verbose_name = "Trip Photo"
        verbose_name_plural = "Trip Photos"
    
    def __str__(self):
        return f"{self.trip.title} - {self.title or 'Photo'}"


# Keep the old Trip model for backward compatibility (will be migrated)
class Trip(models.Model):
    """Legacy Trip model - will be migrated to TripPlan"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    destination = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    travelers = models.IntegerField(default=1)
    interests = models.JSONField(default=list)
    budget_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    itinerary = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.destination} - {self.start_date} to {self.end_date}"
