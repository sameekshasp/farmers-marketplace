import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.get(`/user/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
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

  if (!order) return null;

  const canCancel = order.status === 'pending' || order.status === 'confirmed';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN')}
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
              className="px-4 py-2 border rounded text-red-600 hover:bg-red-50 border-red-600"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary-600" /> Order Tracking
          </h2>
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
            
            {/* Steps */}
            {[
              { label: 'Placed', status: 'pending', icon: Package },
              { label: 'Confirmed', status: 'confirmed', icon: CheckCircle },
              { label: 'Shipped', status: 'shipped', icon: Truck },
              { label: 'Delivered', status: 'delivered', icon: CheckCircle }
            ].map((step, index, arr) => {
              const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
              const currentStatusIndex = orderStatuses.indexOf(order.status);
              const stepStatusIndex = orderStatuses.indexOf(step.status);
              
              const isCompleted = currentStatusIndex >= stepStatusIndex && order.status !== 'cancelled';
              const isCurrent = order.status === step.status;
              const isCancelled = order.status === 'cancelled';

              const Icon = step.icon;

              return (
                <div key={step.label} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    isCancelled ? 'bg-gray-100 border-gray-200 text-gray-400' :
                    isCompleted ? 'bg-primary-600 border-white text-white shadow-md' : 
                    'bg-white border-gray-200 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                    isCancelled ? 'text-gray-400' :
                    isCompleted ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {order.status === 'cancelled' && (
             <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-700">
                <XCircle className="h-5 w-5 mr-3" />
                <span className="font-semibold">This order has been cancelled.</span>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">₹{order.total_price}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Delivery Address
              </h3>
              <div className="text-gray-700 space-y-1">
                <p>{order.delivery_address}</p>
                <p>{order.delivery_city}, {order.delivery_state}</p>
                <p>{order.delivery_pincode}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Payment
              </h3>
              <p className="text-gray-700 capitalize">{order.payment_method || 'Cash on Delivery'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
