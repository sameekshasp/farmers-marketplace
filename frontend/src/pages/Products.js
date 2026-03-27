import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Search,
  ShoppingCart,
  Star,
  MapPin,
  Grid,
  List,
} from 'lucide-react';

import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['products', searchParams.toString()],
    async () => {
      const response = await productsAPI.get('', { params: Object.fromEntries(searchParams) });
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    async () => {
      const response = await productsAPI.get('/categories');
      return response.data;
    },
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    if (selectedLocation) params.set('location', selectedLocation);
    if (sortBy !== 'newest') params.set('sort', sortBy);

    setSearchParams(params);
  }, [searchQuery, selectedCategory, priceRange, selectedLocation, sortBy, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery(searchQuery.trim());
    }
  };

  const handleAddToCart = async (productId, productName) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      // Success toast is shown in the context
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSelectedLocation('');
    setSortBy('newest');
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory,
    priceRange.min,
    priceRange.max,
    selectedLocation,
  ].filter(Boolean).length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load products</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">
                {productsData?.pagination?.total || 0} products found
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* View Mode and Sort */}
            <div className="flex items-center space-x-4">
              {/* View Mode */}
              <div className="flex items-center space-x-2 border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar - always visible */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={!selectedCategory}
                      onChange={() => setSelectedCategory('')}
                      className="mr-2"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories?.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="mr-2"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="input text-sm flex-1"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="input text-sm flex-1"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="input text-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : productsData?.products?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {productsData?.products?.map((product) => (
                  <div key={product.id} className="product-card bg-white rounded-lg overflow-hidden">
                    {viewMode === 'grid' ? (
                      // Grid View
                      <>
                        <Link to={`/products/${product.id}`}>
                          <div className="aspect-square bg-gray-200 overflow-hidden">
                            <img
                              src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}
                              alt={product.name}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'; }}
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
                      </>
                    ) : (
                      // List View
                      <div className="flex p-4 space-x-4">
                        <Link to={`/products/${product.id}`} className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={product.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}
                              alt={product.name}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'; }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600 flex items-center mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {product.farm_location} • {product.farm_name}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {product.description}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold text-primary-600">
                                ₹{product.price}
                              </p>
                              <p className="text-xs text-gray-500">per {product.unit}</p>

                              <button
                                onClick={() => handleAddToCart(product.id, product.name)}
                                disabled={product.quantity === 0}
                                className="btn btn-primary text-sm px-3 py-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {productsData?.pagination && productsData.pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  disabled={!productsData.pagination.page || productsData.pagination.page <= 1}
                  onClick={() => {
                    const newPage = Math.max(1, productsData.pagination.page - 1);
                    searchParams.set('page', newPage);
                    setSearchParams(searchParams);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {productsData.pagination.page} of {productsData.pagination.pages}
                </span>

                <button
                  disabled={productsData.pagination.page >= productsData.pagination.pages}
                  onClick={() => {
                    const newPage = Math.min(productsData.pagination.pages, productsData.pagination.page + 1);
                    searchParams.set('page', newPage);
                    setSearchParams(searchParams);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
