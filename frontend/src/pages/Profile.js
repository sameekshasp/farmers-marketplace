import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import {
  User,
  Mail,
  Phone,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  LogOut,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.get('/user');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Package className="h-5 w-5 text-primary-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-primary-100 text-primary-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 capitalize mt-2">
                  {user.role}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {user.role === 'farmer' && (
                  <button
                    onClick={() => navigate('/farmer-dashboard')}
                    className="w-full btn btn-secondary flex items-center justify-center"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Farmer Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full btn btn-secondary text-red-600 hover:text-red-700 flex items-center justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Orders</h2>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                  <button onClick={() => navigate('/products')} className="btn btn-primary mt-4">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">Order #{order.id}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{order.items?.length || 0} items</span>
                        <span className="font-medium text-gray-900">₹{order.total_price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
