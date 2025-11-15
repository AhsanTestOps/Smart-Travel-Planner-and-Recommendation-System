import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTripContext } from '../context/TripContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, DollarSign, MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapDisplay = () => {
  const { currentTrip, saveTrip } = useTripContext();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Helper function to get field values that might be in different formats
  const getTripField = (trip, field) => {
    if (!trip) return null;
    
    const fieldMapping = {
      startDate: ['start_date', 'startDate'],
      endDate: ['end_date', 'endDate'],
      budget: ['budget_per_person', 'budget']
    };
    
    if (fieldMapping[field]) {
      for (const possibleField of fieldMapping[field]) {
        if (trip[possibleField] !== undefined) {
          return trip[possibleField];
        }
      }
    }
    
    return trip[field];
  };

  // Create default explore data if no current trip
  const defaultExploreData = {
    destination: "San Francisco",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelers: 2,
    interests: ['Culture', 'Food & Drink', 'Shopping'],
    budget: 1500,
    recommendations: [
      {
        id: 1,
        name: "Golden Gate Bridge",
        type: "Landmark",
        description: "Iconic suspension bridge with stunning views",
        coordinates: [37.8199, -122.4783],
        estimatedCost: 0,
        rating: 4.8
      },
      {
        id: 2,
        name: "Fisherman's Wharf",
        type: "Area",
        description: "Popular waterfront area with shops and restaurants",
        coordinates: [37.8080, -122.4177],
        estimatedCost: 40,
        rating: 4.2
      },
      {
        id: 3,
        name: "Alcatraz Island",
        type: "Museum",
        description: "Historic former federal prison",
        coordinates: [37.8267, -122.4230],
        estimatedCost: 45,
        rating: 4.6
      },
      {
        id: 4,
        name: "Chinatown",
        type: "Culture",
        description: "Vibrant neighborhood with authentic Chinese culture",
        coordinates: [37.7941, -122.4078],
        estimatedCost: 25,
        rating: 4.4
      },
      {
        id: 5,
        name: "Union Square",
        type: "Shopping",
        description: "Premier shopping district",
        coordinates: [37.7880, -122.4074],
        estimatedCost: 60,
        rating: 4.3
      },
      {
        id: 6,
        name: "Lombard Street",
        type: "Landmark",
        description: "The most crooked street in the world",
        coordinates: [37.8021, -122.4187],
        estimatedCost: 0,
        rating: 4.5
      }
    ]
  };

  // Use current trip data if available, otherwise use default explore data
  const tripData = currentTrip || defaultExploreData;
  const isExploreMode = !currentTrip;

  {/*const handleSaveTrip = () => {
    if (isExploreMode) {
      alert('Please plan a trip first to save it!');
      navigate('/plan');
      return;
    }
    const savedTrip = saveTrip(currentTrip);
    alert('Trip saved successfully!');
    navigate('/saved-trips');
  };*/}

  const defaultCenter = tripData.recommendations?.length > 0 
    ? tripData.recommendations[0].coordinates 
    : [37.7749, -122.4194]; // Default to San Francisco

  const totalEstimatedCost = tripData.recommendations?.reduce(
    (total, rec) => total + rec.estimatedCost, 0
  ) || 0;

  return (
    <div className={`${isExploreMode ? 'container mx-auto px-4 py-8' : ''} max-w-7xl mx-auto`}>
      {/* Explore Mode Banner */}
      {isExploreMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Explore Mode</h3>
                <p className="text-sm text-blue-700">You're exploring San Francisco. Plan a trip to customize your experience!</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/plan')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Plan Trip
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/plan')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Planning</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isExploreMode ? `Explore ${tripData.destination}` : tripData.destination}
            </h1>
            <p className="text-gray-600">
              {isExploreMode 
                ? 'Discover amazing places to visit' 
                : (() => {
                    const startDate = getTripField(tripData, 'startDate');
                    const endDate = getTripField(tripData, 'endDate');
                    if (startDate && endDate) {
                      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
                    }
                    return 'Dates not set';
                  })()
              }
            </p>
          </div>
        </div>
      {/*  <button
          onClick={handleSaveTrip}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isExploreMode 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          disabled={isExploreMode}
        >
          <Save className="h-4 w-4" />
          <span>{isExploreMode ? 'Plan Trip to Save' : 'Save Trip'}</span>
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="h-96 lg:h-[600px]">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {tripData.recommendations?.map((location) => (
                  <Marker
                    key={location.id}
                    position={location.coordinates}
                    eventHandlers={{
                      click: () => setSelectedLocation(location),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">${location.estimatedCost}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-sm ml-1">{location.rating}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trip Summary */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {isExploreMode ? 'Location Info' : 'Trip Summary'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Travelers:</span>
                <span className="font-medium">{tripData.travelers}</span>
              </div>
              {!isExploreMode && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {(() => {
                      const startDate = getTripField(tripData, 'startDate');
                      const endDate = getTripField(tripData, 'endDate');
                      if (startDate && endDate) {
                        return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
                      }
                      return 0;
                    })()} days
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium">${getTripField(tripData, 'budget') || 0}/person</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Cost:</span>
                <span className="font-medium text-primary-600">${totalEstimatedCost}/person</span>
              </div>
            </div>
            
            {/* Interests */}
            <div className="mt-4">
              <span className="text-gray-600 text-sm">Interests:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {tripData.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Recommended Places</h2>
            <div className="space-y-4">
              {tripData.recommendations?.map((location) => (
                <div
                  key={location.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">${location.estimatedCost}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{location.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Location Details</h2>
              <div className="space-y-3">
                <h3 className="font-medium">{selectedLocation.name}</h3>
                <p className="text-gray-600 text-sm">{selectedLocation.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{selectedLocation.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Cost:</span>
                  <span className="text-sm font-medium">${selectedLocation.estimatedCost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">{selectedLocation.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
