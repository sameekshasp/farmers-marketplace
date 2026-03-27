import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import {
  Star,
  MapPin,
  ShoppingCart,
  User,
  Calendar,
  QrCode,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  Heart,
  Share2,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    async () => {
      const response = await productsAPI.get(`/${id}`);
      return response.data;
    },
    { staleTime: 300000 }
  );

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1) return;
    if (product && newQty > product.quantity) {
      toast.error(`Only ${product.quantity} available`);
      return;
    }
    setQuantity(newQty);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    setIsAddingToCart(true);
    const result = await addToCart(id, quantity);
    setIsAddingToCart(false);
    if (result.success) {
      setQuantity(1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on Farmers Marketplace`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load product details</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-gray-900 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Product Image */}
            <div className="lg:w-1/2 p-6">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 p-6 lg:pl-8">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm text-primary-600 font-medium uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center space-x-2">
                  <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{product.avg_rating || 0}</span>
                  <span className="text-gray-500">({product.total_reviews || 0} reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <p className="text-3xl font-bold text-primary-600 mb-4">
                ₹{product.price} <span className="text-lg text-gray-500 font-normal">/ {product.unit}</span>
              </p>

              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{product.description}</p>

              {/* Batch & Traceability */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Batch ID</span>
                  <Link to={`/traceability/${product.batch_id}`} className="text-primary-600 hover:text-primary-700 text-sm flex items-center">
                    <QrCode className="h-4 w-4 mr-1" /> Trace Product
                  </Link>
                </div>
                <p className="font-mono text-sm">{product.batch_id}</p>
                {product.harvest_date && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Harvested: {new Date(product.harvest_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Farmer Info */}
              <div className="flex items-center space-x-3 mb-6 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.farmer_name}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {product.farm_location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{product.farmer_rating || '4.5'}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              {product.quantity > 0 ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 btn btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        <span>Add to Cart - ₹{(product.price * quantity).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button disabled className="w-full btn btn-secondary py-3 disabled:opacity-50 cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
