import axios from 'axios';

// Base URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = axios.create({
  baseURL: `${BASE_URL}/auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = axios.create({
  baseURL: `${BASE_URL}/products`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cart API
export const cartAPI = axios.create({
  baseURL: `${BASE_URL}/cart`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Orders API
export const ordersAPI = axios.create({
  baseURL: `${BASE_URL}/orders`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reviews API
export const reviewsAPI = axios.create({
  baseURL: `${BASE_URL}/reviews`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Forum API
export const forumAPI = axios.create({
  baseURL: `${BASE_URL}/forum`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Traceability API
export const traceabilityAPI = axios.create({
  baseURL: `${BASE_URL}/trace`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Farmers API
export const farmersAPI = axios.create({
  baseURL: `${BASE_URL}/farmers`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors to all API instances
[authAPI, productsAPI, cartAPI, ordersAPI, reviewsAPI, forumAPI, traceabilityAPI, farmersAPI].forEach(apiInstance => {
  // Request interceptor
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
});

// Default export
export default api;
