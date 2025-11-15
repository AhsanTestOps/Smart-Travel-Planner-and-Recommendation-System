import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { useAuth } from './AuthContext';

const AITravelContext = createContext();

export const useAITravel = () => {
  const context = useContext(AITravelContext);
  if (!context) {
    throw new Error('useAITravel must be used within an AITravelProvider');
  }
  return context;
};

export const AITravelProvider = ({ children }) => {
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [userItineraries, setUserItineraries] = useState([]);
  const [sessionItineraries, setSessionItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(null);
  
  const { isAuthenticated } = useAuth();

  // Initialize session ID for anonymous users
  useEffect(() => {
    let storedSessionId = localStorage.getItem('aiTravelSessionId');
    if (!storedSessionId) {
      storedSessionId = 'ai_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('aiTravelSessionId', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Fetch user itineraries when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserItineraries();
    } else {
      setUserItineraries([]);
      if (sessionId) {
        fetchSessionItineraries();
      }
    }
  }, [isAuthenticated, sessionId]);

  const fetchUserItineraries = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await apiService.aiTravel.getUserItineraries();
      if (data.success) {
        setUserItineraries(data.itineraries);
      } else {
        console.error('Error fetching user itineraries:', data.error);
      }
    } catch (err) {
      console.error('Error fetching user itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionItineraries = async () => {
    if (!sessionId) return;
    
    try {
      const data = await apiService.aiTravel.getSessionItineraries(sessionId);
      if (data.success) {
        setSessionItineraries(data.itineraries);
      }
    } catch (err) {
      console.error('Error fetching session itineraries:', err);
    }
  };

  const generateAIItinerary = async (tripData) => {
    setLoading(true);
    setGenerationProgress('Initializing AI generation...');
    
    try {
      // Add session ID for anonymous users
      const submitData = {
        ...tripData,
        ...(isAuthenticated ? {} : { session_id: sessionId })
      };

      setGenerationProgress('Generating personalized itinerary...');
      const data = await apiService.aiTravel.generateItinerary(submitData);
      
      if (data.success) {
        setCurrentItinerary(data.itinerary);
        setGenerationProgress('Calculating budget estimates...');
        
        // Refresh the appropriate list
        if (isAuthenticated) {
          await fetchUserItineraries();
        } else {
          await fetchSessionItineraries();
        }
        
        setGenerationProgress('Complete! ✨');
        setTimeout(() => setGenerationProgress(null), 2000);
        
        // Trigger a custom event to notify TripContext to refresh
        window.dispatchEvent(new CustomEvent('aiTripCreated', { 
          detail: { itinerary: data.itinerary } 
        }));
        
        return data.itinerary;
      } else {
        throw new Error(data.error || 'Failed to generate AI itinerary');
      }
    } catch (err) {
      console.error('Error generating AI itinerary:', err);
      setGenerationProgress(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getItinerary = async (id) => {
    setLoading(true);
    console.log('🔄 AITravelContext: Getting itinerary with ID:', id);
    
    try {
      const data = await apiService.aiTravel.getItinerary(id);
      console.log('📥 AITravelContext: Raw API response:', {
        success: data?.success,
        hasItinerary: !!data?.itinerary,
        itineraryKeys: data?.itinerary ? Object.keys(data.itinerary) : [],
        contentExists: !!data?.itinerary?.itinerary_content,
        contentKeys: data?.itinerary?.itinerary_content ? Object.keys(data.itinerary.itinerary_content) : []
      });
      
      if (data.success) {
        console.log('✅ AITravelContext: Setting current itinerary');
        console.log('📋 Full itinerary data structure:', JSON.stringify(data, null, 2));
        setCurrentItinerary(data.itinerary);
        return data.itinerary;
      } else {
        console.error('❌ AITravelContext: API returned success=false:', data.error);
        throw new Error(data.error || 'Failed to fetch itinerary');
      }
    } catch (err) {
      console.error('💥 AITravelContext: Exception in getItinerary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const regenerateBudget = async (itineraryId, options = {}) => {
    setLoading(true);
    setGenerationProgress('Regenerating budget estimate...');
    
    try {
      const data = await apiService.aiTravel.regenerateBudget(itineraryId, options);
      
      if (data.success) {
        // Update current itinerary if it matches
        if (currentItinerary && currentItinerary.id === itineraryId) {
          setCurrentItinerary(prev => ({
            ...prev,
            detailed_budget: data.budget
          }));
        }
        
        setGenerationProgress('Budget updated! 💰');
        setTimeout(() => setGenerationProgress(null), 2000);
        
        return data.budget;
      } else {
        throw new Error(data.error || 'Failed to regenerate budget');
      }
    } catch (err) {
      console.error('Error regenerating budget:', err);
      setGenerationProgress(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id) => {
    try {
      const success = await apiService.aiTravel.deleteItinerary(id);
      if (success) {
        // Remove from appropriate list
        if (isAuthenticated) {
          setUserItineraries(prev => prev.filter(item => item.id !== id));
        } else {
          setSessionItineraries(prev => prev.filter(item => item.id !== id));
        }
        
        // Clear current itinerary if it matches
        if (currentItinerary && currentItinerary.id === id) {
          setCurrentItinerary(null);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      throw err;
    }
  };

  const clearSession = () => {
    localStorage.removeItem('aiTravelSessionId');
    setSessionItineraries([]);
    setCurrentItinerary(null);
    
    // Generate new session ID
    const newSessionId = 'ai_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('aiTravelSessionId', newSessionId);
    setSessionId(newSessionId);
  };

  const updateCurrentItinerary = (itinerary) => {
    setCurrentItinerary(itinerary);
  };

  const value = {
    // State
    currentItinerary,
    userItineraries,
    sessionItineraries,
    loading,
    sessionId,
    generationProgress,
    
    // Actions
    generateAIItinerary,
    getItinerary,
    regenerateBudget,
    deleteItinerary,
    fetchUserItineraries,
    fetchSessionItineraries,
    clearSession,
    updateCurrentItinerary,
    
    // Computed values
    allItineraries: isAuthenticated ? userItineraries : sessionItineraries,
  };

  return (
    <AITravelContext.Provider value={value}>
      {children}
    </AITravelContext.Provider>
  );
};
