// CSRF token management for Django API calls
import config from './api';

let csrfToken = null;

export const getCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch(config.endpoints.csrf, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
};

export const makeApiCall = async (url, options = {}) => {
  const token = await getCsrfToken();
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'X-CSRFToken': token }),
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

export const clearCsrfToken = () => {
  csrfToken = null;
};
