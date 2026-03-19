import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  farmerProfile: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        farmerProfile: action.payload.farmerProfile,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        farmerProfile: action.payload.farmerProfile,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        farmerProfile: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        farmerProfile: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in localStorage and axios defaults
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete authAPI.defaults.headers.common['Authorization'];
    }
  };

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      return;
    }

    setAuthToken(token);
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

    try {
      const response = await authAPI.get('/profile');
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Load user error:', error);
      setAuthToken(null);
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
    }
  };

  // Login
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await authAPI.post('/login', credentials);
      const { user, farmerProfile, token } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, farmerProfile, token },
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return { success: false, message };
    }
  };

  // Register
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const response = await authAPI.post('/register', userData);
      const { user, token } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, farmerProfile: null, token },
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE });
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.put('/profile', profileData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: response.data.user,
      });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is farmer
  const isFarmer = () => hasRole('farmer');

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is buyer
  const isBuyer = () => hasRole('buyer');

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
    hasRole,
    isFarmer,
    isAdmin,
    isBuyer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
