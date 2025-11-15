import React from 'react';
import { useTripContext } from '../context/TripContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, MapPin, Trash2, Eye, Sparkles, Star, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const SavedTrips = () => {
  const { savedTrips, deleteTrip, updateCurrentTrip, fetchTrips, loading } = useTripContext();
  const navigate = useNavigate();

  // Helper function to get the correct field value regardless of format
  const getTripField = (trip, field) => {
    // Handle both camelCase and snake_case formats
    const fieldMapping = {
      startDate: ['start_date', 'startDate'],
      endDate: ['end_date', 'endDate'],
      budget: ['budget_per_person', 'budget'],
      createdAt: ['created_at', 'createdAt']
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

  const handleViewTrip = (trip) => {
    if (trip.type === 'ai-generated') {
      // Navigate to AI itinerary display for AI trips
      navigate(`/ai-travel/itinerary/${trip.id}`);
    } else {
      // Ensure the trip data has the correct format for MapDisplay
      const normalizedTrip = {
        ...trip,
        start_date: getTripField(trip, 'startDate'),
        end_date: getTripField(trip, 'endDate'),
        budget_per_person: getTripField(trip, 'budget'),
        recommendations: trip.recommendations || []
      };
      updateCurrentTrip(normalizedTrip);
      navigate('/map');
    }
  };

  const handleDeleteTrip = (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      deleteTrip(tripId);
    }
  };

  const getTripDuration = (trip) => {
    const startDate = getTripField(trip, 'startDate');
    const endDate = getTripField(trip, 'endDate');
    
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalCost = (trip) => {
    // For AI trips, use the calculated total_estimated_cost
    if (trip.type === 'ai-generated' && trip.total_estimated_cost) {
      return trip.total_estimated_cost;
    }
    
    // For regular trips, calculate from recommendations
    const recommendations = trip.recommendations || [];
    if (recommendations.length === 0) return 0;
    return recommendations.reduce((total, rec) => total + (rec.estimatedCost || 0), 0);
  };

  if (savedTrips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="py-12">
          <MapPin className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No saved trips yet</h2>
          <p className="text-gray-600 mb-8">Start planning your first trip to see it here!</p>
          <button
            onClick={() => navigate('/plan')}
            className="btn-primary"
          >
            Plan Your First Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
          <p className="text-gray-600">Manage and view your saved travel plans and AI-generated itineraries</p>
        </div>
        <button
          onClick={fetchTrips}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {savedTrips.map((trip) => (
          <div key={trip.id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
            {/* Trip Header */}
            <div className={`p-6 text-white ${trip.type === 'ai-generated' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
              : 'bg-gradient-to-r from-primary-500 to-primary-600'}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold">{trip.destination}</h3>
                {trip.type === 'ai-generated' && (
                  <div className="flex items-center space-x-1 text-purple-200">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-medium">AI Generated</span>
                  </div>
                )}
              </div>
              <div className={`flex items-center space-x-4 ${trip.type === 'ai-generated' ? 'text-purple-100' : 'text-primary-100'}`}>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {(() => {
                      const startDate = getTripField(trip, 'startDate');
                      const endDate = getTripField(trip, 'endDate');
                      
                      if (startDate && endDate && 
                          !isNaN(new Date(startDate).getTime()) && 
                          !isNaN(new Date(endDate).getTime())) {
                        return `${format(new Date(startDate), 'MMM dd')} - ${format(new Date(endDate), 'MMM dd')}`;
                      }
                      return 'Date not set';
                    })()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{trip.travelers}</span>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Duration and Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Duration</span>
                    <p className="font-medium">{getTripDuration(trip)} days</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Budget</span>
                    <p className="font-medium">${getTripField(trip, 'budget')}/person</p>
                  </div>
                </div>

                {/* Estimated Cost */}
                <div>
                  <span className="text-sm text-gray-600">Estimated Cost</span>
                  <div className="flex items-center space-x-2">
                    <DollarSign className={`h-4 w-4 ${trip.type === 'ai-generated' ? 'text-purple-600' : 'text-primary-600'}`} />
                    <span className={`font-medium ${trip.type === 'ai-generated' ? 'text-purple-600' : 'text-primary-600'}`}>
                      ${getTotalCost(trip)}/person
                    </span>
                  </div>
                </div>

                {/* Interests or Travel Style */}
                <div>
                  <span className="text-sm text-gray-600 block mb-2">
                    {trip.type === 'ai-generated' ? 'Travel Style & Interests' : 'Interests'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {trip.type === 'ai-generated' && trip.travel_style && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        {trip.travel_style.charAt(0).toUpperCase() + trip.travel_style.slice(1)}
                      </span>
                    )}
                    {trip.interests?.slice(0, trip.type === 'ai-generated' ? 2 : 3).map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {trip.interests?.length > (trip.type === 'ai-generated' ? 2 : 3) && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{trip.interests.length - (trip.type === 'ai-generated' ? 2 : 3)} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommendations Count */}
                <div>
                  <span className="text-sm text-gray-600">Recommendations</span>
                  <p className="font-medium">{trip.recommendations?.length || 0} places</p>
                </div>

                {/* Created Date */}
                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const createdAt = getTripField(trip, 'createdAt');
                      const prefix = trip.type === 'ai-generated' ? 'Generated' : 'Created';
                      if (createdAt && !isNaN(new Date(createdAt).getTime())) {
                        return `${prefix} ${format(new Date(createdAt), 'MMM dd, yyyy')}`;
                      }
                      return 'Date not available';
                    })()}
                  </span>
                  {trip.type === 'ai-generated' && (
                    <div className="mt-1">
                      <span className="text-xs text-purple-600 font-medium">
                        AI-powered itinerary with interactive map
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleViewTrip(trip)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors text-white ${
                    trip.type === 'ai-generated' 
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {trip.type === 'ai-generated' ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>View AI Itinerary</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>View Trip</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Trip Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/plan')}
          className="btn-primary"
        >
          Plan Another Trip
        </button>
      </div>
    </div>
  );
};

export default SavedTrips;
