"""
URL configuration for travel_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .csrf_views import csrf_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/trips/', include('trips.urls')),
    path('api/free-trips/', include('free_trips.urls')),  # Free trips API
    path('api/ai-travel/', include('ai_travel.urls')),  # AI-powered travel features
    path('api/destinations/', include('destinations.urls')),  # Destination management API
    path('api/csrf/', csrf_token, name='csrf_token'),
]
