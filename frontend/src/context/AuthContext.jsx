import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, makeApiCall } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to make API calls with token
const makeAuthenticatedApiCall = makeApiCall;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status with backend on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const data = await apiService.auth.checkAuth();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Also ensure we have the token
        const token = localStorage.getItem('authToken');
        if (!token) {
          // If no token but user is authenticated, we might have a session issue
          console.warn('User authenticated but no token found');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid tokens
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('LOGIN DEBUG: Starting login for', email);
      const data = await apiService.auth.login(email, password);
      console.log('LOGIN DEBUG: Login response:', data);
      
      if (data.success) {
        console.log('LOGIN DEBUG: Login successful, saving token and user');
        // Store the token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      console.error('LOGIN DEBUG: Login error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const data = await apiService.auth.register(name, email, password);
      
      if (data.success) {
        // Store the token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus,
    refreshAuth: checkAuthStatus,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
