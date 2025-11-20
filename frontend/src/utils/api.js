// API Configuration and Helper Functions
// Use HTTPS domain for all environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.smarttravelplanner.app/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.smarttravelplanner.app';

// API Configuration
export const config = {
  API_BASE_URL,
  BACKEND_URL,
  endpoints: {
    // Authentication
    login: `${API_BASE_URL}/login/`,
    register: `${API_BASE_URL}/register/`,
    logout: `${API_BASE_URL}/logout/`,
    checkAuth: `${API_BASE_URL}/check-auth/`,
    csrf: `${API_BASE_URL}/csrf/`,
    
    // Trips
    trips: `${API_BASE_URL}/trips/`,
    tripCreate: `${API_BASE_URL}/trips/create/`,
    tripDetail: (id) => `${API_BASE_URL}/trips/${id}/`,
    
    // Free Trips
    freeTrips: `${API_BASE_URL}/free-trips/`,
    freeTripCreate: `${API_BASE_URL}/free-trips/create/`,
    freeTripDetail: (id) => `${API_BASE_URL}/free-trips/${id}/`,
    
    // AI Travel Features
    aiTravelGenerate: `${API_BASE_URL}/ai-travel/generate/`,
    aiTravelItinerary: (id) => `${API_BASE_URL}/ai-travel/itinerary/${id}/`,
    aiTravelMyItineraries: `${API_BASE_URL}/ai-travel/my-itineraries/`,
    aiTravelSession: (sessionId) => `${API_BASE_URL}/ai-travel/session/${sessionId}/`,
    aiTravelBudgetRegenerate: `${API_BASE_URL}/ai-travel/budget/regenerate/`,
  }
};

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to make authenticated API calls
export const makeApiCall = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      // Token might be expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Helper function for non-authenticated API calls
export const makePublicApiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  return fetch(url, mergedOptions);
};

// API Service Functions
export const apiService = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const response = await makePublicApiCall(config.endpoints.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },
    
    register: async (name, email, password) => {
      const response = await makePublicApiCall(config.endpoints.register, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      return response.json();
    },
    
    logout: async () => {
      const response = await makeApiCall(config.endpoints.logout, {
        method: 'POST',
      });
      return response.json();
    },
    
    checkAuth: async () => {
      const response = await makeApiCall(config.endpoints.checkAuth);
      return response.json();
    },
  },
  
  // Trips
  trips: {
    getAll: async () => {
      const response = await makeApiCall(config.endpoints.trips);
      return response.json();
    },
    
    create: async (tripData) => {
      const response = await makeApiCall(config.endpoints.tripCreate, {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
      return response.json();
    },
    
    getById: async (id) => {
      const response = await makeApiCall(config.endpoints.tripDetail(id));
      return response.json();
    },
    
    update: async (id, tripData) => {
      const response = await makeApiCall(config.endpoints.tripDetail(id), {
        method: 'PUT',
        body: JSON.stringify(tripData),
      });
      return response.json();
    },
    
    delete: async (id) => {
      const response = await makeApiCall(config.endpoints.tripDetail(id), {
        method: 'DELETE',
      });
      return response.ok;
    },
  },
  
  // Free Trips
  freeTrips: {
    create: async (tripData) => {
      const response = await makePublicApiCall(config.endpoints.freeTripCreate, {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
      return response.json();
    },
    
    getAll: async () => {
      const response = await makePublicApiCall(config.endpoints.freeTrips);
      return response.json();
    },
    
    getById: async (id) => {
      const response = await makePublicApiCall(config.endpoints.freeTripDetail(id));
      return response.json();
    },
  },
  
  // AI Travel Features
  aiTravel: {
    generateItinerary: async (tripData) => {
      // Try authenticated call first, fallback to public if not authenticated
      try {
        const response = await makeApiCall(config.endpoints.aiTravelGenerate, {
          method: 'POST',
          body: JSON.stringify(tripData),
        });
        return response.json();
      } catch (error) {
        // If authentication fails or user is not logged in, try public call
        if (error.message === 'Authentication required') {
          const response = await makePublicApiCall(config.endpoints.aiTravelGenerate, {
            method: 'POST',
            body: JSON.stringify(tripData),
          });
          return response.json();
        }
        throw error;
      }
    },
    
    getItinerary: async (id) => {
      console.log('🌐 API Service: Making request to get itinerary:', id);
      const url = config.endpoints.aiTravelItinerary(id);
      console.log('🔗 API Service: URL:', url);
      
      // Try authenticated call first, fallback to public if not authenticated
      try {
        const response = await makeApiCall(url);
        const data = await response.json();
        
        console.log('📡 API Service: Response received:', {
          status: response.status,
          ok: response.ok,
          success: data?.success,
          hasItinerary: !!data?.itinerary,
          error: data?.error
        });
        
        return data;
      } catch (error) {
        // If authentication fails, try public call
        if (error.message === 'Authentication required') {
          const response = await makePublicApiCall(url);
          const data = await response.json();
          
          console.log('📡 API Service: Public response received:', {
            status: response.status,
            ok: response.ok,
            success: data?.success,
            hasItinerary: !!data?.itinerary,
            error: data?.error
          });
          
          return data;
        }
        throw error;
      }
    },
    
    getUserItineraries: async () => {
      const response = await makeApiCall(config.endpoints.aiTravelMyItineraries);
      return response.json();
    },
    
    getSessionItineraries: async (sessionId) => {
      const response = await makePublicApiCall(config.endpoints.aiTravelSession(sessionId));
      return response.json();
    },
    
    regenerateBudget: async (itineraryId, options = {}) => {
      // Use authenticated call for proper user association
      const response = await makeApiCall(config.endpoints.aiTravelBudgetRegenerate, {
        method: 'POST',
        body: JSON.stringify({
          itinerary_id: itineraryId,
          ...options
        }),
      });
      return response.json();
    },
    
    deleteItinerary: async (id) => {
      // Use authenticated call for proper user association
      const response = await makeApiCall(`${config.endpoints.aiTravelItinerary(id)}delete/`, {
        method: 'DELETE',
      });
      return response.ok;
    },
  },
};

export default config;
