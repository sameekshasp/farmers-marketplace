import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import {
  CreditCard,
  MapPin,
  Truck,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, loadCart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Track recently placed order details for the success screen
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    if (user) loadCart();
    
    // Dynamically load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items, orderPlaced, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const executeOrderCreation = async (paymentStatus = 'cod') => {
    try {
      const deliveryAddress = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
      
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        delivery_address: deliveryAddress,
        delivery_city: formData.city,
        delivery_state: formData.state,
        delivery_pincode: formData.pincode,
        payment_method: formData.paymentMethod
      };

      const response = await ordersAPI.post('/', orderData);
      
      setPlacedOrderInfo({
        orderId: response.data.orderId || Math.floor(100000 + Math.random() * 900000),
        total: total,
        itemsCount: items.length,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
      });

      await clearCart();
      setOrderPlaced(true);
      toast.success('Order successfully placed!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to formalize order';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      // 1. Create Razorpay order on backend
      const { data: orderParams } = await ordersAPI.post('/payment/razorpay/create', { amount: total });

      // 2. Setup Razorpay options
      const options = {
        key: orderParams.key_id, // Safely injected from backend
        amount: orderParams.amount,
        currency: orderParams.currency,
        name: "Farmers Marketplace",
        description: "Fresh farm produce purchase",
        order_id: orderParams.id, // From backend
        handler: async function (response) {
          try {
            // 3. Verify payment signature on backend
            await ordersAPI.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            // 4. Create actual marketplace order if verified
            executeOrderCreation('razorpay_paid');
          } catch (verifyError) {
            setIsProcessing(false);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: "#059669" // Primary-600
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      toast.error('Could not initialize Razorpay checkout.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all delivery details');
      return;
    }

    setIsProcessing(true);

    if (formData.paymentMethod === 'razorpay') {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }
      handleRazorpayPayment();
    } else {
      executeOrderCreation('cod');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to securely checkout.</p>
          <button onClick={() => navigate('/login')} className="w-full btn btn-primary py-3">
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Beautiful E-commerce Success Screen
  if (orderPlaced && placedOrderInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full mx-auto">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden mt-8 transform transition-all duration-500 ease-out translate-y-0 opacity-100">
            {/* Header / Hero */}
            <div className="bg-green-600 px-6 py-12 text-center text-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Order Confirmed!</h1>
                  <p className="text-green-100 text-lg max-w-md mx-auto">Thank you for supporting local farmers. Your fresh produce is being prepared.</p>
               </div>
            </div>

            {/* Details Section */}
            <div className="p-8">
               <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
                    <p className="text-xl font-bold text-gray-900">#{placedOrderInfo.orderId}</p>
                  </div>
                  <div className="h-10 border-l border-gray-200 hidden sm:block"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Items</p>
                    <p className="text-xl font-bold text-gray-900">{placedOrderInfo.itemsCount}</p>
                  </div>
                  <div className="h-10 border-l border-gray-200 hidden sm:block"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-primary-600">₹{placedOrderInfo.total.toFixed(2)}</p>
                  </div>
               </div>

               {/* Tracking Simulation */}
               <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-gray-400" /> Track Delivery
                  </h3>
                  <div className="relative">
                    <div className="absolute top-4 left-4 h-full border-l-2 border-green-200" style={{ height: 'calc(100% - 2rem)' }}></div>
                    <ul className="space-y-6">
                      <li className="relative flex items-start">
                        <span className="flex-shrink-0 relative z-10 w-8 h-8 flex items-center justify-center bg-green-500 rounded-full text-white shadow ring-4 ring-white">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Order Placed</p>
                          <p className="text-sm text-gray-500">We received your order</p>
                        </div>
                      </li>
                      <li className="relative flex items-start">
                        <span className="flex-shrink-0 relative z-10 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full border-2 border-gray-300 ring-4 ring-white"></span>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">Processing</p>
                          <p className="text-sm text-gray-400">Farmers are preparing your harvest</p>
                        </div>
                      </li>
                      <li className="relative flex items-start">
                        <span className="flex-shrink-0 relative z-10 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full border-2 border-gray-300 ring-4 ring-white">
                           <Calendar className="w-4 h-4 text-gray-400" />
                        </span>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">Estimated Delivery</p>
                          <p className="text-sm text-primary-600 font-medium">{placedOrderInfo.deliveryDate}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 border-t pt-8">
                 <button onClick={() => navigate('/orders')} className="btn btn-secondary px-8 py-3 w-full sm:w-auto text-base">
                   Track Order Details
                 </button>
                 <button onClick={() => navigate('/products')} className="btn btn-primary px-8 py-3 w-full sm:w-auto text-base flex items-center justify-center shadow-md">
                   <Package className="w-5 h-5 mr-2"/> Continue Shopping
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <button onClick={() => navigate('/cart')} className="mb-6 text-gray-500 hover:text-primary-600 flex items-center transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Return to Cart
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Delivery & Payment Form */}
          <div className="flex-1 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Box 1: Delivery Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 text-primary-600 mr-2" /> Delivery Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                        required
                        placeholder="+91 99999 99999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN Code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                        required
                        placeholder="6-digit PIN"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                        placeholder="House/Flat No., Building Name, Street"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <CreditCard className="h-5 w-5 text-primary-600 mr-2" /> Payment Method
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  
                  {/* Option 1: Razorpay Online */}
                  <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'razorpay' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold ${formData.paymentMethod === 'razorpay' ? 'text-primary-900' : 'text-gray-900'}`}>Pay Online (Razorpay)</p>
                        <div className="flex gap-2 text-gray-400">
                           <CreditCard className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Cards, UPI, NetBanking, Wallets securely processed.</p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-4 flex-1">
                      <p className={`font-bold ${formData.paymentMethod === 'cod' ? 'text-primary-900' : 'text-gray-900'}`}>Cash on Delivery</p>
                      <p className="text-sm text-gray-500 mt-1">Pay with cash to the delivery executive when your order arrives.</p>
                    </div>
                    <Truck className={`w-6 h-6 mt-1 ${formData.paymentMethod === 'cod' ? 'text-primary-600' : 'text-gray-400'}`} />
                  </label>

                </div>
              </div>

              {/* Submit Button - Mobile Fixed Bottom / Desktop Inline */}
              <div className="pt-4 sticky bottom-0 bg-gray-50 rounded-t-xl z-20 pb-4 md:pb-0 md:bg-transparent md:static">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-600/30 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      Authenticating Server...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {formData.paymentMethod === 'razorpay' ? 'Proceed to Payment' : 'Confirm Order'} 
                      <span className="ml-2 font-black">• ₹{total.toFixed(2)}</span>
                    </span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Sticky Sidebar: Order Summary */}
          <div className="lg:w-96 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center">
                <Package className="w-5 h-5 mr-3 text-gray-400" /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.cart_id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent">
                    <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.product_name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.product_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Estimated Tax</span>
                  <span className="font-semibold text-gray-900">₹0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Delivery</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded text-sm tracking-wide">FREE</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-primary-600 tracking-tight">₹{total.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-medium">Inclusive of all taxes</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
