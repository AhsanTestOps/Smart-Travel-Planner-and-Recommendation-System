import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTripContext } from '../context/TripContext';
import { makeApiCall } from '../utils/csrf';
import config from '../utils/api';
import { 
  MapPin, Calendar, Users, DollarSign, Plus, Clock, Target, X, TrendingUp, 
  Globe, Star, BarChart3, Activity, PieChart, ArrowUpRight, Sparkles,
  Briefcase, Heart, Camera, Mountain, Ship, Plane, Car, Home
} from 'lucide-react';

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

  // Calculate enhanced statistics
  const totalTrips = savedTrips?.length || 0;
  const upcomingTrips = savedTrips?.filter(trip => new Date(trip.start_date) > new Date()).length || 0;
  const uniqueDestinations = savedTrips ? new Set(savedTrips.map(trip => trip.destination)).size : 0;
  const totalBudget = savedTrips?.reduce((sum, trip) => {
    const tripBudget = parseFloat(trip.budget_per_person || 0) * (trip.travelers || 1);
    return sum + tripBudget;
  }, 0) || 0;
  const averageBudget = totalTrips > 0 ? totalBudget / totalTrips : 0;
  const monthlyTrends = getMonthlyTripTrends(savedTrips);
  const destinationStats = getDestinationStats(savedTrips);

  // Helper functions for analytics
  function getMonthlyTripTrends(trips) {
    if (!trips || trips.length === 0) return [];
    const monthCounts = {};
    trips.forEach(trip => {
      const month = new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  }

  function getDestinationStats(trips) {
    if (!trips || trips.length === 0) return [];
    const destCounts = {};
    trips.forEach(trip => {
      destCounts[trip.destination] = (destCounts[trip.destination] || 0) + 1;
    });
    return Object.entries(destCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 border-8 border-transparent border-r-indigo-400 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Loading your dashboard</h3>
            <p className="text-gray-600">Preparing your travel insights...</p>
          </div>
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Good {getTimeOfDay()}, {user?.first_name || user?.name || 'Explorer'}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard Overview • Last updated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchTrips()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </button>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Trips"
            value={totalTrips}
            icon={MapPin}
            color="blue"
            trend={totalTrips > 0 ? "+12%" : null}
            description="All planned trips"
          />
          <StatCard
            title="Upcoming"
            value={upcomingTrips}
            icon={Calendar}
            color="emerald"
            trend={upcomingTrips > 0 ? "This month" : null}
            description="Trips ahead"
          />
          <StatCard
            title="Destinations"
            value={uniqueDestinations}
            icon={Globe}
            color="purple"
            trend={uniqueDestinations > 2 ? "Diverse" : null}
            description="Unique places"
          />
          <StatCard
            title="Total Investment"
            value={`$${totalBudget.toLocaleString()}`}
            icon={DollarSign}
            color="amber"
            trend={totalBudget > 0 ? "Planned" : null}
            description="Travel budget"
          />
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Trends Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Travel Analytics</h3>
                    <p className="text-sm text-gray-600">Trip planning insights</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Live Data
                </span>
              </div>
            </div>
            <div className="p-6">
              {monthlyTrends.length > 0 ? (
                <TripTrendsChart trends={monthlyTrends} />
              ) : (
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Start planning trips to see analytics</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Destinations */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Destinations</h3>
                  <p className="text-sm text-gray-600">Most visited</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {destinationStats.length > 0 ? (
                <div className="space-y-4">
                  {destinationStats.map((dest, index) => (
                    <div key={dest.destination} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{dest.destination}</span>
                      </div>
                      <span className="text-sm text-gray-600">{dest.count} trips</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No destinations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Trip Cards */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Travel Portfolio</h3>
                  <p className="text-gray-600">Manage and explore your trips</p>
                </div>
              </div>
              {totalTrips > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 shadow-sm border border-gray-200">
                    {totalTrips} {totalTrips === 1 ? 'Trip' : 'Trips'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    ${averageBudget.toLocaleString()} Avg
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {!savedTrips || savedTrips.length === 0 ? (
              <EmptyState onCreateTrip={() => setShowTripForm(true)} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {savedTrips.map((trip) => (
                  <EnhancedTripCard key={trip.id} trip={trip} />
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

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
};

// Professional Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, description }) => {
  const colorClasses = {
    blue: {
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    emerald: {
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    purple: {
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100'
    },
    amber: {
      gradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl shadow-lg ${colors.border} border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 ${colors.gradient} rounded-xl shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Trip Trends Chart Component
const TripTrendsChart = ({ trends }) => {
  const maxCount = Math.max(...trends.map(t => t.count));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Trips per Month</span>
        <span>Max: {maxCount}</span>
      </div>
      <div className="space-y-3">
        {trends.map((trend) => (
          <div key={trend.month} className="flex items-center space-x-4">
            <div className="w-12 text-sm font-medium text-gray-700">{trend.month}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(trend.count / maxCount) * 100}%` }}
              ></div>
            </div>
            <div className="w-8 text-sm font-semibold text-gray-900">{trend.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Trip Card Component
const EnhancedTripCard = ({ trip }) => {
  const getDestinationIcon = (destination) => {
    const dest = destination.toLowerCase();
    if (dest.includes('beach') || dest.includes('island')) return Ship;
    if (dest.includes('mountain') || dest.includes('hill')) return Mountain;
    if (dest.includes('city')) return Briefcase;
    return Plane;
  };

  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isUpcoming = new Date(trip.start_date) > new Date();
  const isPast = new Date(trip.end_date) < new Date();
  const isOngoing = !isUpcoming && !isPast;

  const statusConfig = {
    upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Upcoming', icon: Calendar },
    ongoing: { color: 'bg-green-100 text-green-800 border-green-200', label: 'In Progress', icon: Activity },
    completed: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Completed', icon: Star }
  };

  const status = isUpcoming ? 'upcoming' : isOngoing ? 'ongoing' : 'completed';
  const config = statusConfig[status];
  const DestIcon = getDestinationIcon(trip.destination);
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Card Header */}
      <div className="relative p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-md">
              <DestIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{trip.destination}</h4>
              <p className="text-sm text-gray-600">{getDaysCount(trip.start_date, trip.end_date)} days</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} border`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">
                {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span>{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              <span>{new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center text-sm text-gray-900">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              <span className="font-semibold">${parseFloat(trip.budget_per_person || 0).toLocaleString()}/person</span>
            </div>
          </div>
        </div>

        {/* Interests Tags */}
        {trip.interests && trip.interests.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {trip.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {interest}
                </span>
              ))}
              {trip.interests.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  +{trip.interests.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onCreateTrip }) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <Globe className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready for your first adventure?</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        Start planning your dream destination and create unforgettable memories. Your journey begins with a single click.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={onCreateTrip}
          className="inline-flex items-center px-8 py-4 border border-transparent shadow-lg text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Plan Your First Trip
        </button>
        <button className="inline-flex items-center px-6 py-4 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
          <Sparkles className="h-5 w-5 mr-2" />
          Explore Ideas
        </button>
      </div>
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
