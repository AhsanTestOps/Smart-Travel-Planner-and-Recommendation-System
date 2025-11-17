import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTripContext } from '../context/TripContext';
import { makeApiCall } from '../utils/csrf';
import config from '../utils/api';
import { MapPin, Calendar, Users, DollarSign, Plus, Clock, Target, X } from 'lucide-react';

const Dashboard = () => {
  const { user, checkAuthStatus } = useAuth();
  const { savedTrips, fetchTrips, loading } = useTripContext();
  const [showTripForm, setShowTripForm] = useState(false);

  useEffect(() => {
    // Check authentication status and fetch trips
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleTripCreated = () => {
    // Refresh the trips list after creating a new trip
    fetchTrips();
    setShowTripForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const totalTrips = savedTrips?.length || 0;
  const totalBudget = savedTrips?.reduce((sum, trip) => sum + (parseFloat(trip.budget_per_person) * trip.travelers), 0) || 0;
  const averageBudget = totalTrips > 0 ? totalBudget / totalTrips : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Traveler'}!</h1>
              <p className="mt-1 text-gray-600">Plan your next adventure or manage your existing trips.</p>
            </div>
            <button
              onClick={() => setShowTripForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalTrips}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Trips</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {savedTrips?.filter(trip => new Date(trip.start_date) > new Date()).length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Destinations Visited</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {savedTrips ? new Set(savedTrips.map(trip => trip.destination)).size : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${totalBudget.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Trips</h3>
          </div>
          <div className="p-6">
            {!savedTrips || savedTrips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by planning your first trip.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowTripForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Plan Your First Trip
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {savedTrips.map((trip) => (
                  <div key={trip.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">{trip.destination}</h4>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Planned
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ${trip.budget_per_person} per person
                      </div>
                    </div>

                    {trip.interests && trip.interests.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {trip.interests.slice(0, 3).map((interest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {interest}
                            </span>
                          ))}
                          {trip.interests.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{trip.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Created {formatDate(trip.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Planning Form Modal */}
      {showTripForm && (
        <TripPlanningModal
          onClose={() => setShowTripForm(false)}
          onTripCreated={handleTripCreated}
        />
      )}
    </div>
  );
};

// Trip Planning Modal Component
const TripPlanningModal = ({ onClose, onTripCreated }) => {
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    travelers: 1,
    interests: [],
    budget_per_person: 1000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const interestOptions = [
    'Adventure', 'Culture', 'Shopping', 'Relaxation', 'Food & Drink',
    'Nightlife', 'Nature', 'History', 'Art', 'Sports'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await makeApiCall(config.endpoints.tripCreate, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (data.success) {
        onTripCreated(data.trip);
      } else {
        setError(data.error || 'Failed to create trip');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Plan Your Dream Trip</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where are you going?
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Enter destination"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Number of Travelers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Travelers
            </label>
            <select
              name="travelers"
              value={formData.travelers}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'traveler' : 'travelers'}</option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Interests
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget per person ($)
            </label>
            <div className="space-y-4">
              <input
                type="range"
                name="budget_per_person"
                min="100"
                max="5000"
                step="100"
                value={formData.budget_per_person}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>$100</span>
                <span className="font-medium text-primary-600">${formData.budget_per_person}</span>
                <span>$5000</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {loading ? 'Creating...' : 'Generate Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
