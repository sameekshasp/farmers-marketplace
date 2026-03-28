import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { Package, Truck, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrdersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrdersList = async () => {
    try {
      setIsLoading(true);
      let response;
      if (user.role === 'admin') {
        response = await ordersAPI.get('/admin');
      } else if (user.role === 'farmer') {
        response = await ordersAPI.get('/farmer');
      } else {
        response = await ordersAPI.get('/user');
      }
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Could not load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' };
      case 'shipped': return { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'pending': return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' };
      default: return { icon: Package, color: 'text-primary-600', bg: 'bg-primary-100' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === 'admin' ? 'Platform Orders' : user.role === 'farmer' ? 'Sold Orders' : 'My Purchases'}
            </h1>
            <p className="text-gray-500 mt-1">
              {user.role === 'admin' && 'Monitor all transactions across the marketplace.'}
              {user.role === 'farmer' && 'Manage and track products you have sold.'}
              {user.role === 'buyer' && 'View your order history and track deliveries.'}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">Looks like there are no orders to display yet.</p>
            {user.role === 'buyer' && (
              <Link to="/products" className="btn btn-primary">Start Shopping</Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    {user.role !== 'buyer' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const StatusConfig = getStatusConfig(order.status);
                    const StatusIcon = StatusConfig.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        {user.role !== 'buyer' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{order.customer_name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{order.customer_phone || ''}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${StatusConfig.bg} ${StatusConfig.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{user.role === 'farmer' ? (order.order_total || order.total_price) : order.total_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user.role === 'buyer' ? (
                            <Link to={`/orders/${order.id}`} className="text-primary-600 hover:text-primary-900 inline-flex items-center">
                              View Details <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          ) : (
                             <span className="text-gray-400 text-xs italic">Read Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
