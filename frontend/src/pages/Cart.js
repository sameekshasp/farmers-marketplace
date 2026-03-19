import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, itemCount, isLoading, loadCart, updateCartItem, removeFromCart } = useCart();

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stock_quantity) {
      toast.error(`Only ${item.stock_quantity} items available`);
      return;
    }
    await updateCartItem(item.cart_id, newQuantity);
  };

  const handleRemove = async (cartId) => {
    await removeFromCart(cartId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your cart</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Looks like you haven't added any items yet</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({itemCount} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.cart_id} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-600">{item.farm_name}</p>
                  <p className="text-primary-600 font-medium">₹{item.price} / {item.unit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.cart_id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn btn-primary py-3 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full mt-3 btn btn-secondary py-2"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
