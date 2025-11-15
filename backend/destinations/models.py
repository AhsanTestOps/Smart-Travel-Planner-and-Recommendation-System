from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class City(models.Model):
	name = models.CharField(max_length=100)
	country = models.CharField(max_length=100)
	description = models.TextField(blank=True)
	image_url = models.URLField(blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ("name", "country")
		ordering = ["name"]

	def __str__(self):
		return f"{self.name}, {self.country}"

class Category(models.Model):
	CATEGORY_TYPES = [
		("sightseeing", "Sightseeing"),
		("food", "Food & Drink"),
		("nature", "Nature"),
		("adventure", "Adventure"),
		("shopping", "Shopping"),
		("culture", "Culture"),
		("nightlife", "Nightlife"),
		("hotel", "Hotel"),
		("restaurant", "Restaurant"),
		("other", "Other"),
	]
	name = models.CharField(max_length=50, unique=True)
	type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default="other")
	icon = models.CharField(max_length=50, blank=True)

	def __str__(self):
		return self.name

class Attraction(models.Model):
	name = models.CharField(max_length=200)
	city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="attractions")
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="attractions")
	description = models.TextField(blank=True)
	address = models.CharField(max_length=255, blank=True)
	latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	image_url = models.URLField(blank=True)
	website = models.URLField(blank=True)
	rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name

class Hotel(models.Model):
	name = models.CharField(max_length=200)
	city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="hotels")
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="hotels")
	address = models.CharField(max_length=255, blank=True)
	description = models.TextField(blank=True)
	image_url = models.URLField(blank=True)
	website = models.URLField(blank=True)
	rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
	price_per_night = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name

class Restaurant(models.Model):
	name = models.CharField(max_length=200)
	city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="restaurants")
	category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="restaurants")
	address = models.CharField(max_length=255, blank=True)
	description = models.TextField(blank=True)
	image_url = models.URLField(blank=True)
	website = models.URLField(blank=True)
	cuisine = models.CharField(max_length=100, blank=True)
	rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
	price_level = models.CharField(max_length=20, blank=True)  # e.g., $, $$, $$$
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name
