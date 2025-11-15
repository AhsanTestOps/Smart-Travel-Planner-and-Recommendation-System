import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFreeTripContext } from '../context/FreeTripContext';

const FreeMapDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionTrips, fetchSessionTrips, sessionId } = useFreeTripContext();
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Get trip data from navigation state or context
  useEffect(() => {
    if (location.state?.freeTrip) {
      setSelectedTrip(location.state.freeTrip);
    }
    
    // Fetch all trips for this session
    fetchSessionTrips();
  }, [location.state, fetchSessionTrips]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Trip List */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Free Trips</h2>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              + Plan New Trip
            </button>
          </div>

          {sessionTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🗺️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No trips planned yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start planning your first free trip!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Plan Your First Trip
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTrip?.id === trip.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {trip.destination}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 {formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
                        <p>⏱️ {calculateDuration(trip.start_date, trip.end_date)} days</p>
                        {trip.budget && (
                          <p>💰 {trip.currency} {trip.budget}</p>
                        )}
                        <p>👥 {trip.adults} adults{trip.children > 0 && `, ${trip.children} children`}</p>
                      </div>
                    </div>
                    {selectedTrip?.id === trip.id && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Session Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Session Info</h4>
            <p className="text-xs text-gray-500">
              Session ID: {sessionId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your trips are saved for this browser session
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Map and Trip Details */}
      <div className="flex-1 flex flex-col">
        {/* Trip Details Header */}
        {selectedTrip && (
          <div className="bg-white border-b border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🌍 {selectedTrip.destination}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📅 {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}</span>
              <span>⏱️ {calculateDuration(selectedTrip.start_date, selectedTrip.end_date)} days</span>
              {selectedTrip.budget && (
                <span>💰 {selectedTrip.currency} {selectedTrip.budget}</span>
              )}
              <span>👥 {selectedTrip.adults} adults{selectedTrip.children > 0 && `, ${selectedTrip.children} children`}</span>
            </div>
            
            {selectedTrip.description && (
              <p className="mt-3 text-gray-700">
                {selectedTrip.description}
              </p>
            )}

            {selectedTrip.interests && selectedTrip.interests.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">Interests: </span>
                <div className="inline-flex flex-wrap gap-2 mt-1">
                  {selectedTrip.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 relative">
          {selectedTrip ? (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center">
                <div className="text-8xl mb-4">🗺️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Map View for {selectedTrip.destination}
                </h2>
                <p className="text-gray-600 mb-6">
                  Interactive map integration coming soon!
                </p>
                
                {/* Trip Summary Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Trip Summary</h3>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-medium">{selectedTrip.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{calculateDuration(selectedTrip.start_date, selectedTrip.end_date)} days</span>
                    </div>
                    {selectedTrip.accommodation_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accommodation:</span>
                        <span className="font-medium capitalize">{selectedTrip.accommodation_type}</span>
                      </div>
                    )}
                    {selectedTrip.transportation_mode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transport:</span>
                        <span className="font-medium capitalize">{selectedTrip.transportation_mode.replace('_', ' ')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(selectedTrip.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-8xl mb-4">🗺️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select a trip to view on map
                </h2>
                <p className="text-gray-600">
                  Choose a trip from the left sidebar to see details and map view
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeMapDisplay;
