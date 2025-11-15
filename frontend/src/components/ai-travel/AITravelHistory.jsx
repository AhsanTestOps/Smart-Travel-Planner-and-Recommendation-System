import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  MapPin, Calendar, DollarSign, Users, Clock, 
  Plus, Trash2, RefreshCw, Eye, Sparkles,
  Loader2, AlertTriangle, Filter
} from 'lucide-react';
import { useAITravel } from '../../context/AITravelContext';
import { useAuth } from '../../context/AuthContext';

const AITravelHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    allItineraries,
    loading,
    fetchUserItineraries,
    fetchSessionItineraries,
    deleteItinerary,
    clearSession
  } = useAITravel();
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserItineraries();
    } else {
      fetchSessionItineraries();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }
    
    setDeleteLoading(id);
    try {
      await deleteItinerary(id);
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleClearSession = () => {
    if (confirm('This will clear all your session itineraries. Are you sure?')) {
      clearSession();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFilteredAndSortedItineraries = () => {
    let filtered = allItineraries;
    
    // Apply filters
    if (filter === 'upcoming') {
      filtered = filtered.filter(item => new Date(item.start_date) > new Date());
    } else if (filter === 'past') {
      filtered = filtered.filter(item => new Date(item.end_date) < new Date());
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'departure':
          return new Date(a.start_date) - new Date(b.start_date);
        case 'destination':
          return a.destination.localeCompare(b.destination);
        default:
          return 0;
      }
    });
  };

  const filteredItineraries = getFilteredAndSortedItineraries();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Travel History
          </h1>
          <p className="text-gray-600 mt-1">
            {isAuthenticated 
              ? 'Your saved AI-generated itineraries' 
              : 'Your session itineraries (create an account to save permanently)'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate('/ai-travel/generate')}>
            <Plus className="mr-2 h-4 w-4" />
            Generate New
          </Button>
          {!isAuthenticated && allItineraries.length > 0 && (
            <Button onClick={handleClearSession} variant="outline">
              Clear Session
            </Button>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            💡 <strong>Create an account</strong> to save your itineraries permanently and access them from any device!
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Sorting */}
      {allItineraries.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filter:</span>
                <div className="flex gap-1">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'past', label: 'Past' }
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      onClick={() => setFilter(value)}
                      variant={filter === value ? "default" : "outline"}
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="departure">Departure Date</option>
                  <option value="destination">Destination A-Z</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && allItineraries.length === 0 && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your itineraries...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItineraries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {allItineraries.length === 0 
                ? "No AI itineraries yet" 
                : `No ${filter} itineraries found`}
            </h3>
            <p className="text-gray-600 mb-6">
              {allItineraries.length === 0
                ? "Create your first AI-powered travel itinerary to get started!"
                : `Try adjusting your filter to see ${filter === 'upcoming' ? 'past' : filter === 'past' ? 'upcoming' : 'all'} itineraries.`}
            </p>
            {allItineraries.length === 0 && (
              <Button onClick={() => navigate('/ai-travel/generate')}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Your First Itinerary
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itineraries Grid */}
      {filteredItineraries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItineraries.map((itinerary) => {
            const duration = getDuration(itinerary.start_date, itinerary.end_date);
            const isUpcoming = new Date(itinerary.start_date) > new Date();
            const isPast = new Date(itinerary.end_date) < new Date();
            
            return (
              <Card 
                key={itinerary.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/ai-travel/itinerary/${itinerary.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <CardTitle className="text-lg flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        {itinerary.destination}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                      </div>
                    </div>
                    <Badge 
                      variant={isUpcoming ? "default" : isPast ? "secondary" : "outline"}
                      className="shrink-0"
                    >
                      {isUpcoming ? "Upcoming" : isPast ? "Past" : "Current"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          {duration} {duration === 1 ? 'day' : 'days'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          {itinerary.group_size}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(itinerary.budget_usd)}
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-fit capitalize">
                      {itinerary.travel_style.replace('_', ' ')}
                    </Badge>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-gray-500">
                        Generated {formatDate(itinerary.created_at)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ai-travel/itinerary/${itinerary.id}`);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleDelete(itinerary.id, e)}
                          disabled={deleteLoading === itinerary.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleteLoading === itinerary.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Refresh Button */}
      {!loading && allItineraries.length > 0 && (
        <div className="text-center mt-8">
          <Button
            onClick={isAuthenticated ? fetchUserItineraries : fetchSessionItineraries}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default AITravelHistory;
