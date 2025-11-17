import React, { useState, useEffect } from 'react';
import config from '../utils/api';
import { 
  MapPin, Search, Filter, Star, DollarSign, Utensils, 
  Building, Camera, Clock, Globe, ChevronDown, X 
} from 'lucide-react';

const DestinationsPage = () => {
  const [activeTab, setActiveTab] = useState('attractions');
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE = `${config.API_BASE_URL}/destinations`;

  // Fetch initial data
  useEffect(() => {
    fetchCities();
    fetchCategories();
    fetchDestinations();
  }, []);

  // Fetch destinations when filters change
  useEffect(() => {
    fetchDestinations();
  }, [activeTab, selectedCity, selectedCategory, searchQuery, minRating]);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/cities/`);
      const data = await response.json();
      if (data.success) setCities(data.cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories/`);
      const data = await response.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.append('city_id', selectedCity);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (minRating > 0) params.append('min_rating', minRating);

      const endpoint = `${API_BASE}/${activeTab}/`;
      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();

      if (data.success) {
        if (activeTab === 'attractions') setAttractions(data.attractions);
        else if (activeTab === 'hotels') setHotels(data.hotels);
        else if (activeTab === 'restaurants') setRestaurants(data.restaurants);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedCategory('');
    setSearchQuery('');
    setMinRating(0);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'attractions': return Camera;
      case 'hotels': return Building;
      case 'restaurants': return Utensils;
      default: return MapPin;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'attractions': return attractions;
      case 'hotels': return hotels;
      case 'restaurants': return restaurants;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Explore Destinations</h1>
                <p className="text-gray-600">Discover amazing places, hotels, and restaurants</p>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search destinations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['attractions', 'hotels', 'restaurants'].map((tab) => {
                    const Icon = getTabIcon(tab);
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="capitalize">{tab}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getCurrentData().map((item) => (
                    <DestinationCard
                      key={item.id}
                      item={item}
                      type={activeTab}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              )}

              {!loading && getCurrentData().length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Destination Card Component
const DestinationCard = ({ item, type, renderStars }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug log for component rendering
  console.log('Rendering DestinationCard for:', item.name, 'with URL:', item.image_url);

  const handleImageLoad = () => {
    console.log('Image loaded successfully for:', item.name, 'URL:', item.image_url);
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load for:', item.name, 'URL:', item.image_url, 'Error:', e);
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-400 to-indigo-500 overflow-hidden">
        {item.image_url && !imageError ? (
          <>
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50 animate-bounce" />
                  <p className="text-sm opacity-75">Loading image...</p>
                </div>
              </div>
            )}
            {/* Actual image */}
            <img
              src={item.image_url}
              alt={item.name}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </>
        ) : (
          /* Fallback for missing/failed images */
          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {item.city?.name}, {item.city?.country}
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {renderStars(item.rating)}
            <span className="text-sm font-medium text-gray-600 ml-1">
              {item.rating}
            </span>
          </div>
        </div>

        {/* Category */}
        {item.category && (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-3">
            {item.category.name}
          </span>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Type-specific info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {type === 'hotels' && item.price_per_night && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                ${item.price_per_night}/night
              </div>
            )}
            {type === 'restaurants' && item.cuisine && (
              <div className="flex items-center">
                <Utensils className="h-4 w-4 mr-1" />
                {item.cuisine}
              </div>
            )}
            {type === 'restaurants' && item.price_level && (
              <span className="font-medium text-green-600">
                {item.price_level}
              </span>
            )}
          </div>

          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Visit Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;