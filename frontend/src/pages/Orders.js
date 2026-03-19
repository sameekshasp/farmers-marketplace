import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [id, user, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.get(`/user/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Failed to load order details');
      navigate('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await ordersAPI.put(`/user/${id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrderDetails();
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled': return <XCircle className="h-6 w-6 text-red-500" />;
      case 'shipped': return <Truck className="h-6 w-6 text-blue-500" />;
      case 'pending': return <Clock className="h-6 w-6 text-yellow-500" />;
      default: return <Package className="h-6 w-6 text-primary-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-primary-100 text-primary-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Profile
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              className="btn btn-secondary text-red-600 hover:text-red-700"
            >
              Cancel Order
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.farm_name} • {item.farm_location}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.price}</p>
                      <p className="text-sm text-gray-500">per {item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">₹{order.total_price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Delivery Address
              </h3>
              <div className="text-gray-700 space-y-1">
                <p>{order.delivery_address}</p>
                <p>{order.delivery_city}, {order.delivery_state}</p>
                <p>{order.delivery_pincode}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                Payment Method
              </h3>
              <p className="text-gray-700 capitalize">{order.payment_method || 'Cash on Delivery'}</p>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                Order Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.updated_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
