import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOAD_CART_SUCCESS: 'LOAD_CART_SUCCESS',
  ADD_TO_CART_SUCCESS: 'ADD_TO_CART_SUCCESS',
  UPDATE_CART_SUCCESS: 'UPDATE_CART_SUCCESS',
  REMOVE_FROM_CART_SUCCESS: 'REMOVE_FROM_CART_SUCCESS',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  CART_ERROR: 'CART_ERROR',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CART_ACTIONS.LOAD_CART_SUCCESS:
      return {
        ...state,
        items: action.payload.cartItems,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        isLoading: false,
      };

    case CART_ACTIONS.ADD_TO_CART_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };

    case CART_ACTIONS.UPDATE_CART_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        isLoading: false,
      };

    case CART_ACTIONS.REMOVE_FROM_CART_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        isLoading: false,
      };

    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
      };

    case CART_ACTIONS.CART_ERROR:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart
  const loadCart = async () => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await cartAPI.get('/');
      dispatch({
        type: CART_ACTIONS.LOAD_CART_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Load cart error:', error);
      dispatch({ type: CART_ACTIONS.CART_ERROR });
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      await cartAPI.post('/add', { productId, quantity });
      dispatch({ type: CART_ACTIONS.ADD_TO_CART_SUCCESS });
      await loadCart(); // Reload cart to get updated state
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.CART_ERROR });
      return { success: false, message };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartId, quantity) => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      await cartAPI.put(`/${cartId}`, { quantity });
      await loadCart(); // Reload cart to get updated state
      toast.success('Cart updated!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.CART_ERROR });
      return { success: false, message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartId) => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      await cartAPI.delete(`/${cartId}`);
      await loadCart(); // Reload cart to get updated state
      toast.success('Item removed from cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.CART_ERROR });
      return { success: false, message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      await cartAPI.delete('/');
      dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
      toast.success('Cart cleared!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      dispatch({ type: CART_ACTIONS.CART_ERROR });
      return { success: false, message };
    }
  };

  // Get cart summary
  const getCartSummary = async () => {
    try {
      const response = await cartAPI.get('/summary');
      return response.data;
    } catch (error) {
      console.error('Get cart summary error:', error);
      return { itemCount: 0, totalPrice: 0 };
    }
  };

  // Calculate item quantity in cart
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isItemInCart = (productId) => {
    return state.items.some(item => item.product_id === productId);
  };

  // Get total items count
  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    ...state,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    getItemQuantity,
    isItemInCart,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
