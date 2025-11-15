import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../utils/api';

const TripContext = createContext();

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};



export const TripProvider = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch trips from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips();
    } else {
      setSavedTrips([]);
    }
  }, [isAuthenticated]);

  // Listen for AI trip creation to refresh trips
  useEffect(() => {
    const handleAITripCreated = () => {
      if (isAuthenticated) {
        fetchTrips(); // Refresh trips when a new AI trip is created
      }
    };

    window.addEventListener('aiTripCreated', handleAITripCreated);
    return () => window.removeEventListener('aiTripCreated', handleAITripCreated);
  }, [isAuthenticated]);

  const fetchTrips = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Fetch regular trips
      const tripsData = await apiService.trips.getAll();
      let regularTrips = [];
      
      if (tripsData.success) {
        // Transform backend data to frontend format
        regularTrips = tripsData.trips.map(trip => ({
          ...trip,
          type: 'regular', // Add type to distinguish trip types
          // Extract recommendations from itinerary if it exists
          recommendations: trip.itinerary?.recommendations || []
        }));
      }

      // Fetch AI-generated trips
      const aiTripsData = await apiService.aiTravel.getUserItineraries();
      let aiTrips = [];
      
      if (aiTripsData.success) {
        // Transform AI trips to match regular trip format
        aiTrips = aiTripsData.itineraries.map(aiTrip => {
          // Extract activities from daily schedule
          const activities = [];
          const dailySchedule = aiTrip.itinerary_content?.daily_schedule || [];
          
          dailySchedule.forEach(day => {
            if (day.activities) {
              day.activities.forEach(activity => {
                // Parse cost from various formats
                let cost = 0;
                const rawCost = activity.estimated_cost || 0;
                
                if (typeof rawCost === 'string') {
                  // Extract number from string like "$50" or "50 USD"
                  const numbers = rawCost.match(/\d+\.?\d*/);
                  cost = numbers ? parseFloat(numbers[0]) : 0;
                } else if (typeof rawCost === 'number') {
                  cost = rawCost;
                }
                
                activities.push({
                  name: activity.activity || activity.title || 'Activity',
                  location: activity.location || aiTrip.destination,
                  estimatedCost: cost,
                  description: activity.description || '',
                  type: activity.type || 'activity',
                  time: activity.time || '',
                  duration: activity.duration || ''
                });
              });
            }
          });

          // Calculate total estimated cost
          let totalEstimatedCost = 0;
          
          // Try to get from itinerary content first
          if (aiTrip.itinerary_content?.total_estimated_cost) {
            totalEstimatedCost = aiTrip.itinerary_content.total_estimated_cost;
          }
          // Fallback to budget breakdown
          else if (aiTrip.budget_breakdown?.total_estimates?.mid_range_total) {
            totalEstimatedCost = aiTrip.budget_breakdown.total_estimates.mid_range_total;
          }
          // Fallback to budget breakdown budget_total
          else if (aiTrip.budget_breakdown?.total_estimates?.budget_total) {
            totalEstimatedCost = aiTrip.budget_breakdown.total_estimates.budget_total;
          }
          // Final fallback to sum of activity costs
          else {
            totalEstimatedCost = activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
          }

          return {
            id: aiTrip.id,
            type: 'ai-generated',
            destination: aiTrip.destination,
            start_date: aiTrip.start_date,
            end_date: aiTrip.end_date,
            startDate: aiTrip.start_date,
            endDate: aiTrip.end_date,
            travelers: aiTrip.adults + aiTrip.children,
            adults: aiTrip.adults,
            children: aiTrip.children,
            // Use budget_amount for budget display
            budget_per_person: aiTrip.budget_amount || 0,
            budget: aiTrip.budget_amount || 0,
            // Set total estimated cost
            total_estimated_cost: totalEstimatedCost,
            interests: typeof aiTrip.interests === 'string' 
              ? aiTrip.interests.split(',').map(i => i.trim()).filter(i => i.length > 0)
              : (aiTrip.interests || []),
            travel_style: aiTrip.travel_style,
            created_at: aiTrip.created_at,
            createdAt: aiTrip.created_at,
            // Use extracted activities as recommendations
            recommendations: activities,
            // Store original AI data for future reference
            aiTripData: aiTrip
          };
        });
      }

      // Combine both types of trips and sort by creation date
      const allTrips = [...regularTrips, ...aiTrips].sort((a, b) => 
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );

      setSavedTrips(allTrips);
      
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async (tripData) => {
    console.log('saveTrip called with:', tripData);
    console.log('isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.error('User not authenticated, cannot save trip');
      throw new Error('Must be logged in to save trips');
    }

    try {
      console.log('Attempting to save trip to backend...');
      const data = await apiService.trips.create(tripData);
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Trip saved successfully:', data.trip);
        // Transform the saved trip data to include recommendations
        const transformedTrip = {
          ...data.trip,
          recommendations: data.trip.itinerary?.recommendations || []
        };
        setSavedTrips(prev => [transformedTrip, ...prev]);
        return transformedTrip;
      } else {
        console.error('Backend returned error:', data.error);
        throw new Error(data.error || 'Failed to save trip');
      }
    } catch (err) {
      console.error('Error saving trip:', err);
      throw err;
    }
  };

  const deleteTrip = async (tripId) => {
    // For now, just remove from local state
    // TODO: Add backend delete endpoint
    setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  const updateCurrentTrip = (tripData) => {
    setCurrentTrip(tripData);
  };

  const value = {
    currentTrip,
    savedTrips,
    loading,
    saveTrip,
    deleteTrip,
    updateCurrentTrip,
    fetchTrips,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};
