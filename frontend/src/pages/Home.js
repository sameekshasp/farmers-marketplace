import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { 
  Search, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Leaf,
  Truck,
  Shield,
  Users,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery(
    'featuredProducts',
    async () => {
      const response = await productsAPI.get('?limit=8');
      return response.data.products;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch nearby farmers
  const { data: nearbyFarmers, isLoading: farmersLoading } = useQuery(
    'nearbyFarmers',
    async () => {
      const response = await fetch('/api/farmers?limit=6');
      const data = await response.json();
      return data.farmers;
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleAddToCart = async (productId, productName) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      // Success toast is shown in the context
    }
  };

  const categories = [
    { name: 'Fruits', icon: '🍎', color: 'bg-red-100 text-red-600' },
    { name: 'Vegetables', icon: '🥬', color: 'bg-green-100 text-green-600' },
    { name: 'Dairy', icon: '🥛', color: 'bg-blue-100 text-blue-600' },
    { name: 'Grains', icon: '🌾', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Spices', icon: '🌶️', color: 'bg-orange-100 text-orange-600' },
    { name: 'Organic', icon: '🌿', color: 'bg-emerald-100 text-emerald-600' },
  ];

  const features = [
    {
      icon: Leaf,
      title: '100% Fresh Produce',
      description: 'Direct from farms to your table, ensuring maximum freshness and nutrition.',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service to get your produce fresh at your doorstep.',
    },
    {
      icon: Shield,
      title: 'Fully Traceable',
      description: 'Track your product journey from farm to table with QR code technology.',
    },
    {
      icon: Users,
      title: 'Support Local Farmers',
      description: 'Connect directly with local farmers and support sustainable agriculture.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                {t('home.title')}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t('home.subtitle')}
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="btn btn-primary text-lg px-6 py-3 flex items-center space-x-2"
                >
                  <span>Browse Products</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/farmers"
                  className="btn btn-outline text-lg px-6 py-3 flex items-center space-x-2"
                >
                  <span>Find Farmers</span>
                  <MapPin className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Fresh vegetables and fruits"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">100% Organic</p>
                    <p className="text-sm text-gray-600">Certified Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.categories')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of fresh farm products organized by categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('home.featuredProducts')}
              </h2>
              <p className="text-lg text-gray-600">
                Fresh and high-quality products from our trusted farmers
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <div key={product.id} className="product-card bg-white rounded-lg overflow-hidden">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-200 overflow-hidden">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {product.farm_location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{product.farmer_rating || '4.5'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary-600">
                          ₹{product.price}
                        </p>
                        <p className="text-xs text-gray-500">per {product.unit}</p>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product.id, product.name)}
                        disabled={product.quantity === 0}
                        className="btn btn-primary text-sm px-3 py-2 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.whyChooseUs')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing you with the best farm-fresh experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Farmers Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('home.nearbyFarmers')}
              </h2>
              <p className="text-lg text-gray-600">
                Connect with local farmers in your area
              </p>
            </div>
            <Link
              to="/farmers"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All Farmers</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {farmersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyFarmers?.slice(0, 6).map((farmer) => (
                <div key={farmer.id} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {farmer.farm_name || farmer.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {farmer.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{farmer.rating || '4.5'}</span>
                          <span className="text-gray-500">({farmer.total_reviews || 0})</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {farmer.total_products || 0} products
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
