import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const FreeTripContext = createContext();

export const useFreeTripContext = () => {
  const context = useContext(FreeTripContext);
  if (!context) {
    throw new Error('useFreeTripContext must be used within a FreeTripProvider');
  }
  return context;
};

export const FreeTripProvider = ({ children }) => {
  const [currentFreeTrip, setCurrentFreeTrip] = useState(null);
  const [sessionTrips, setSessionTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('freeTripSessionId');
    if (!storedSessionId) {
      storedSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('freeTripSessionId', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Fetch trips for current session
  useEffect(() => {
    if (sessionId) {
      fetchSessionTrips();
    }
  }, [sessionId]);

  const fetchSessionTrips = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/free-trips/session/${sessionId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setSessionTrips(data.trips);
        console.log('Fetched session trips:', data.trips);
      }
    } catch (err) {
      console.error('Error fetching session trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveFreeTrip = async (tripData) => {
    try {
      const submitData = {
        ...tripData,
        session_id: sessionId,
      };

      const data = await apiService.freeTrips.create(submitData);
      
      if (data.success) {
        setCurrentFreeTrip(data.trip);
        setSessionTrips(prev => [data.trip, ...prev]);
        return data.trip;
      } else {
        throw new Error(data.error || 'Failed to save trip');
      }
    } catch (err) {
      console.error('Error saving free trip:', err);
      throw err;
    }
  };

  const updateCurrentFreeTrip = (tripData) => {
    setCurrentFreeTrip(tripData);
  };

  const clearSession = () => {
    localStorage.removeItem('freeTripSessionId');
    setSessionTrips([]);
    setCurrentFreeTrip(null);
    
    // Generate new session ID
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('freeTripSessionId', newSessionId);
    setSessionId(newSessionId);
  };

  const value = {
    currentFreeTrip,
    sessionTrips,
    loading,
    sessionId,
    saveFreeTrip,
    updateCurrentFreeTrip,
    fetchSessionTrips,
    clearSession,
  };

  return (
    <FreeTripContext.Provider value={value}>
      {children}
    </FreeTripContext.Provider>
  );
};
