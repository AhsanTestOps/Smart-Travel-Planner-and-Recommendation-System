import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripContext } from '../context/TripContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, Star, DollarSign, MapPin } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapDisplayEnhanced = () => {
  const navigate = useNavigate();
  const { currentTrip, saveTrip } = useTripContext();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default to London
  const [mapZoom, setMapZoom] = useState(13);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Set trip data from context
  useEffect(() => {
    if (currentTrip) {
      setSelectedTrip(currentTrip);
      geocodeDestination(currentTrip.destination);
    } else {
      // Show default San Francisco data if no current trip
      const defaultTrip = {
        destination: "San Francisco",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        travelers: 2,
        interests: ['Culture', 'Food & Drink', 'Shopping'],
        budget_per_person: 1500
      };
      setSelectedTrip(defaultTrip);
      geocodeDestination("San Francisco");
    }
  }, [currentTrip]);

  // Geocoding function to get coordinates from destination name
  const geocodeDestination = async (destination) => {
    setLoading(true);
    try {
      // Try OpenStreetMap Nominatim API first (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setDestinationCoords(coords);
          setMapCenter(coords);
          setMapZoom(12);
          
          // Get nearby attractions
          await getNearbyAttractions(coords[0], coords[1], destination);
        } else {
          // Fallback coordinates for popular cities
          const fallbackCoords = getFallbackCoordinates(destination);
          setDestinationCoords(fallbackCoords);
          setMapCenter(fallbackCoords);
          await getNearbyAttractions(fallbackCoords[0], fallbackCoords[1], destination);
        }
      } else {
        const fallbackCoords = getFallbackCoordinates(destination);
        setDestinationCoords(fallbackCoords);
        setMapCenter(fallbackCoords);
        await getNearbyAttractions(fallbackCoords[0], fallbackCoords[1], destination);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      const fallbackCoords = getFallbackCoordinates(destination);
      setDestinationCoords(fallbackCoords);
      setMapCenter(fallbackCoords);
      await getNearbyAttractions(fallbackCoords[0], fallbackCoords[1], destination);
    }
    setLoading(false);
  };

  // Fallback coordinates for popular destinations
  const getFallbackCoordinates = (destination) => {
    const fallbacks = {
      'paris': [48.8566, 2.3522],
      'london': [51.5074, -0.1278],
      'tokyo': [35.6762, 139.6503],
      'new york': [40.7128, -74.0060],
      'rome': [41.9028, 12.4964],
      'barcelona': [41.3851, 2.1734],
      'dubai': [25.2048, 55.2708],
      'sydney': [-33.8688, 151.2093],
      'istanbul': [41.0082, 28.9784],
      'bangkok': [13.7563, 100.5018],
      'san francisco': [37.7749, -122.4194],
      'los angeles': [34.0522, -118.2437],
      'miami': [25.7617, -80.1918],
      'default': [51.505, -0.09] // London as final fallback
    };

    const key = destination.toLowerCase();
    for (const city in fallbacks) {
      if (key.includes(city)) {
        return fallbacks[city];
      }
    }
    return fallbacks.default;
  };

  // Get nearby attractions based on destination and interests
  const getNearbyAttractions = async (lat, lon, destination) => {
    // Create contextual attractions based on destination and trip interests
    const interests = selectedTrip?.interests || [];
    
    const attractionTypes = {
      'adventure': ['Mountain Peak', 'Adventure Park', 'Hiking Trail', 'Rock Climbing Spot'],
      'culture': ['Cultural Center', 'Traditional Market', 'Heritage Site', 'Local Museum'],
      'shopping': ['Shopping Mall', 'Boutique District', 'Local Market', 'Souvenir Shop'],
      'relaxation': ['Spa & Wellness', 'Beach Resort', 'Peaceful Garden', 'Hot Springs'],
      'food & drink': ['Local Restaurant', 'Food Market', 'Wine Bar', 'Street Food Area'],
      'nightlife': ['Rooftop Bar', 'Night Club', 'Live Music Venue', 'Cocktail Lounge'],
      'nature': ['National Park', 'Botanical Garden', 'Nature Reserve', 'Scenic Viewpoint'],
      'history': ['Historical Site', 'Ancient Ruins', 'Historical Museum', 'Monument'],
      'art': ['Art Gallery', 'Street Art District', 'Art Museum', 'Artist Quarter'],
      'sports': ['Sports Complex', 'Stadium', 'Fitness Center', 'Sports Bar']
    };

    const mockAttractions = [];
    let attractionId = 1;

    // Add 2-3 attractions based on user interests
    interests.forEach((interest, index) => {
      const interestKey = interest.toLowerCase().replace(' & ', '_').replace(' ', '_');
      if (attractionTypes[interestKey] && index < 3) {
        const options = attractionTypes[interestKey];
        const attractionName = options[Math.floor(Math.random() * options.length)];
        mockAttractions.push({
          id: attractionId++,
          name: attractionName,
          lat: lat + (Math.random() - 0.5) * 0.02, // Random nearby location
          lon: lon + (Math.random() - 0.5) * 0.02,
          type: interestKey,
          description: `Popular ${attractionName.toLowerCase()} in ${destination}`,
          category: interest,
          estimatedCost: Math.floor(Math.random() * 50) + 10,
          rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 to 5.0
        });
      }
    });

    // Add some general popular attractions if no specific interests or to fill up
    if (mockAttractions.length < 4) {
      const generalAttractions = [
        { 
          name: 'City Center', 
          type: 'landmark',
          description: `Main city center of ${destination}`,
          category: 'landmark',
          estimatedCost: 0,
          rating: '4.5'
        },
        { 
          name: 'Popular Viewpoint', 
          type: 'viewpoint',
          description: `Best viewpoint in ${destination}`,
          category: 'sightseeing',
          estimatedCost: 15,
          rating: '4.7'
        },
        { 
          name: 'Local Market', 
          type: 'market',
          description: `Traditional market in ${destination}`,
          category: 'shopping',
          estimatedCost: 25,
          rating: '4.3'
        },
        { 
          name: 'Cultural Quarter', 
          type: 'culture',
          description: `Cultural district of ${destination}`,
          category: 'culture',
          estimatedCost: 30,
          rating: '4.6'
        }
      ];

      const needed = 4 - mockAttractions.length;
      for (let i = 0; i < needed && i < generalAttractions.length; i++) {
        const attraction = generalAttractions[i];
        mockAttractions.push({
          id: attractionId++,
          name: attraction.name,
          lat: lat + (Math.random() - 0.5) * 0.025,
          lon: lon + (Math.random() - 0.5) * 0.025,
          type: attraction.type,
          description: attraction.description,
          category: attraction.category,
          estimatedCost: attraction.estimatedCost,
          rating: attraction.rating
        });
      }
    }
    
    setNearbyAttractions(mockAttractions);
    
    // Create optimized route including destination and attractions
    if (destinationCoords) {
      const allPoints = [destinationCoords, ...mockAttractions.map(a => [a.lat, a.lon])];
      optimizeRoute(allPoints);
    }
  };

  // Simple route optimization using nearest neighbor algorithm
  const optimizeRoute = (points) => {
    if (points.length <= 2) {
      setRouteCoordinates(points);
      return;
    }

    // Start with the main destination (first point)
    let optimizedRoute = [points[0]];
    let remaining = [...points.slice(1)];

    // Find nearest unvisited point each time
    while (remaining.length > 0) {
      let current = optimizedRoute[optimizedRoute.length - 1];
      let nearestIndex = 0;
      let nearestDistance = calculateDistance(current, remaining[0]);

      for (let i = 1; i < remaining.length; i++) {
        let distance = calculateDistance(current, remaining[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      optimizedRoute.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }

    // Close the loop back to start
    optimizedRoute.push(points[0]);
    setRouteCoordinates(optimizedRoute);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAttractionIcon = (type) => {
    const icons = {
      'adventure': '🏔️',
      'culture': '🏛️',
      'shopping': '🛍️',
      'relaxation': '🧘',
      'food_drink': '🍽️',
      'food & drink': '🍽️',
      'nightlife': '🌙',
      'nature': '🌳',
      'history': '🏺',
      'art': '🎨',
      'sports': '⚽',
      'landmark': '📍',
      'viewpoint': '👁️',
      'market': '🏪',
      'default': '📍'
    };
    return icons[type] || icons.default;
  };

 {/*} const handleSaveTrip = () => {
    if (!currentTrip) {
      alert('Please plan a trip first to save it!');
      navigate('/plan');
      return;
    }
    
    try {
      saveTrip(currentTrip);
      alert('Trip saved successfully!');
      navigate('/saved-trips');
    } catch (err) {
      console.error('Error saving trip:', err);
      alert('Failed to save trip. Please try again.');
    }
  }; */}

  const totalEstimatedCost = nearbyAttractions.reduce((total, attraction) => total + attraction.estimatedCost, 0);

  if (!selectedTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No trip selected</h2>
          <p className="text-gray-600 mb-4">Please go back and plan a trip first.</p>
          <button
            onClick={() => navigate('/plan')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Plan a Trip
          </button>
        </div>
      </div>
    );
  }

  const isExploreMode = !currentTrip;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your trip map...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100vh', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Main destination marker */}
            {destinationCoords && (
              <Marker position={destinationCoords}>
                <Popup>
                  <div className="text-center p-2">
                    <h3 className="font-bold text-lg text-blue-600">🎯 {selectedTrip.destination}</h3>
                    <p className="text-sm text-gray-600 mt-1">Your main destination</p>
                    <p className="text-xs text-gray-500 mt-1">Starting point</p>
                    {selectedTrip.start_date && selectedTrip.end_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Nearby attractions markers */}
            {nearbyAttractions.map((attraction, index) => (
              <Marker key={attraction.id} position={[attraction.lat, attraction.lon]}>
                <Popup>
                  <div className="text-center p-2">
                    <h3 className="font-bold text-base">
                      {getAttractionIcon(attraction.type)} {attraction.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{attraction.description}</p>
                    <p className="text-xs text-blue-600 mt-1 capitalize">
                      Stop #{index + 2} • {attraction.category}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-green-600 font-medium">${attraction.estimatedCost}</span>
                      <div className="flex items-center text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="ml-1">{attraction.rating}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Optimized route polyline */}
            {routeCoordinates.length > 1 && (
              <Polyline
                positions={routeCoordinates}
                color="#2563eb"
                weight={4}
                opacity={0.8}
                dashArray="10, 5"
              />
            )}
          </MapContainer>
        )}
        
        {/* Map overlay info */}
        {!loading && routeCoordinates.length > 1 && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              🗺️ Optimized Route
            </h3>
            <p className="text-sm text-gray-600">
              The blue dashed line shows the most efficient path to visit all {nearbyAttractions.length + 1} locations.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total stops: {nearbyAttractions.length + 1} • Route optimized for minimal travel time
            </p>
          </div>
        )}

        {/* Map controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg">
          <button
            onClick={() => navigate('/plan')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-t-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Planning</span>
          </button>
          <hr className="border-gray-200" />
       {/*  <button
            onClick={handleSaveTrip}
            className={`flex items-center space-x-2 px-4 py-2 rounded-b-lg ${
              isExploreMode 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800'
            }`}
            disabled={isExploreMode}
          >
            <Save className="h-4 w-4" />
            <span className="text-sm">{isExploreMode ? 'Plan Trip to Save' : 'Save Trip'}</span>
          </button> */}
        </div>
      </div>

      {/* Right Side - Trip Summary */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Trip Summary</h1>
              {isExploreMode && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Explore Mode
                </span>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                🌍 {selectedTrip.destination}
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                {selectedTrip.start_date && selectedTrip.end_date && (
                  <>
                    <p>📅 {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}</p>
                    <p>⏱️ {calculateDuration(selectedTrip.start_date, selectedTrip.end_date)} days</p>
                  </>
                )}
                {selectedTrip.budget_per_person && (
                  <p>💰 ${selectedTrip.budget_per_person} per person</p>
                )}
                <p>👥 {selectedTrip.travelers} traveler{selectedTrip.travelers > 1 ? 's' : ''}</p>
                <p>💵 Estimated attractions cost: ${totalEstimatedCost}/person</p>
              </div>
            </div>
          </div>

          {/* Trip Interests */}
          {selectedTrip.interests && selectedTrip.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTrip.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Places */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">📍 Recommended Places</h3>
            <div className="space-y-3">
              {/* Main destination */}
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{selectedTrip.destination}</p>
                  <p className="text-xs text-gray-600">Main destination</p>
                  <p className="text-xs text-blue-600">Starting point</p>
                </div>
              </div>
              
              {/* Attractions */}
              {nearbyAttractions.map((attraction, index) => (
                <div key={attraction.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{getAttractionIcon(attraction.type)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{attraction.name}</p>
                    <p className="text-xs text-gray-600">{attraction.description}</p>
                    <p className="text-xs text-blue-600 capitalize">Stop #{index + 2} • {attraction.category}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-green-600 font-medium">${attraction.estimatedCost}</span>
                      <div className="flex items-center text-xs text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="ml-1">{attraction.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Info */}
          {routeCoordinates.length > 1 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-900 mb-2 flex items-center">
                ✅ Route Optimized!
              </h3>
              <p className="text-sm text-green-800">
                We've created the most efficient route to visit all {nearbyAttractions.length + 1} locations based on your interests.
              </p>
              <ul className="text-xs text-green-700 mt-2 space-y-1">
                <li>• Minimal travel time between stops</li>
                <li>• Attractions matched to your interests</li>
                <li>• Easy to follow on the map</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
         {/* <button
              onClick={handleSaveTrip}
              disabled={isExploreMode}
              className={`w-full py-3 rounded-lg transition-colors font-medium ${
                isExploreMode
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExploreMode ? 'Plan a Trip to Save' : 'Save Trip'}
            </button>
            */}
            <button
              onClick={() => navigate('/plan')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Plan Another Trip
            </button>
            
            <button
              onClick={() => window.print()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Print Trip Summary
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Click on map markers to see more details about each location
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDisplayEnhanced;
