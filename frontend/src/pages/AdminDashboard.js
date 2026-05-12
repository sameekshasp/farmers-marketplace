import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Loader2,
  CheckCircle,
  XCircle,
  BarChart2,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Category colour map ──────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Vegetables: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: '🥦' },
  Fruits: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: '🍎' },
  Lettuce: { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200', icon: '🥬' },
  Seeds: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: '🌱' },
  'Fibre & Protein': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', icon: '💪' },
};

const getCategoryStyle = (cat) =>
  CATEGORY_COLORS[cat] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: '📦' };

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color = 'text-primary-600', bg = 'bg-primary-50' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`${bg} p-3 rounded-lg`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!data) return null;

  const { overview, by_category, product_details, orders, users: userStats } = data;

  // ── Filtered product list ──────────────────────────────────────────────────
  const filteredProducts = product_details.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.farm_name.toLowerCase().includes(search.toLowerCase());

    const matchCategory = !filterCategory || p.category === filterCategory;

    const isSold = Number(p.total_sold_qty) > 0;
    const matchStatus =
      !filterStatus ||
      (filterStatus === 'sold' && isSold) ||
      (filterStatus === 'unsold' && !isSold) ||
      (filterStatus === 'available' && p.is_available && p.current_stock > 0) ||
      (filterStatus === 'unavailable' && (!p.is_available || p.current_stock === 0));

    return matchSearch && matchCategory && matchStatus;
  });

  const allCategories = [...new Set(product_details.map((p) => p.category))].sort();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'By Category', icon: Filter },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name}. Here's what's happening on the marketplace.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Products"
            value={overview.total_products}
            icon={Package}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Available"
            value={overview.available_products}
            sub="In stock & active"
            icon={CheckCircle}
            color="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            label="Out of Stock / Inactive"
            value={overview.unavailable_products}
            icon={XCircle}
            color="text-red-500"
            bg="bg-red-50"
          />
          <StatCard
            label="Total Revenue"
            value={`₹${Number(orders.total_revenue || 0).toLocaleString('en-IN')}`}
            sub="From delivered orders"
            icon={DollarSign}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Products Sold"
            value={overview.sold_products}
            sub="At least 1 order"
            icon={TrendingUp}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            label="Never Sold"
            value={overview.never_sold_products}
            sub="No orders yet"
            icon={ShoppingBag}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Total Orders"
            value={orders.total_orders}
            sub={`${orders.delivered_orders} delivered`}
            icon={ShoppingBag}
            color="text-sky-600"
            bg="bg-sky-50"
          />
          <StatCard
            label="Total Users"
            value={userStats.total_users}
            sub={`${userStats.total_farmers} farmers · ${userStats.total_buyers} buyers`}
            icon={Users}
            color="text-violet-600"
            bg="bg-violet-50"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Order status breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'Pending', value: orders.pending_orders, color: 'bg-yellow-100 text-yellow-800' },
                  { label: 'Confirmed', value: orders.confirmed_orders, color: 'bg-blue-100 text-blue-800' },
                  { label: 'Preparing', value: orders.preparing_orders, color: 'bg-indigo-100 text-indigo-800' },
                  { label: 'Shipped', value: orders.shipped_orders, color: 'bg-purple-100 text-purple-800' },
                  { label: 'Delivered', value: orders.delivered_orders, color: 'bg-green-100 text-green-800' },
                  { label: 'Cancelled', value: orders.cancelled_orders, color: 'bg-red-100 text-red-800' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-lg p-3 text-center ${color}`}>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs font-medium mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category summary cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {by_category.map((cat) => {
                  const style = getCategoryStyle(cat.category);
                  return (
                    <div
                      key={cat.category}
                      className={`rounded-xl border ${style.border} ${style.bg} p-4`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{style.icon}</span>
                        <h3 className={`font-semibold ${style.text}`}>{cat.category}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Total Products</p>
                          <p className="font-bold text-gray-900">{cat.total_products}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Stock</p>
                          <p className="font-bold text-gray-900">{Number(cat.total_quantity || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Available</p>
                          <p className="font-bold text-green-700">{cat.available_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Unavailable</p>
                          <p className="font-bold text-red-600">{cat.unavailable_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Price</p>
                          <p className="font-bold text-gray-900">₹{Number(cat.avg_price || 0).toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price Range</p>
                          <p className="font-bold text-gray-900">₹{cat.min_price}–₹{cat.max_price}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, farms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="sold">Sold (has orders)</option>
                <option value="unsold">Never Sold</option>
                <option value="available">In Stock</option>
                <option value="unavailable">Out of Stock</option>
              </select>
            </div>

            <p className="text-sm text-gray-500 mb-3">
              Showing {filteredProducts.length} of {product_details.length} products
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-600">Product</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Farm</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Price</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Stock</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Sold Qty</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Revenue</th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        No products match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const style = getCategoryStyle(p.category);
                      const isSold = Number(p.total_sold_qty) > 0;
                      const inStock = p.is_available && p.current_stock > 0;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                              {style.icon} {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div>{p.farm_name}</div>
                            <div className="text-xs text-gray-400">{p.farm_location}</div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            ₹{Number(p.price).toFixed(2)}/{p.unit}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={p.current_stock > 0 ? 'text-green-700 font-medium' : 'text-red-500 font-medium'}>
                              {p.current_stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={isSold ? 'text-indigo-700 font-medium' : 'text-gray-400'}>
                              {Number(p.total_sold_qty).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                            ₹{Number(p.total_revenue).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                inStock
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {by_category.map((cat) => {
              const style = getCategoryStyle(cat.category);
              const catProducts = product_details.filter((p) => p.category === cat.category);
              return (
                <div key={cat.category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Category header */}
                  <div className={`${style.bg} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{style.icon}</span>
                      <div>
                        <h2 className={`text-lg font-bold ${style.text}`}>{cat.category}</h2>
                        <p className="text-sm text-gray-500">
                          {cat.total_products} products · {Number(cat.total_quantity || 0).toLocaleString()} units in stock
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">Avg Price</p>
                      <p className={`text-xl font-bold ${style.text}`}>₹{Number(cat.avg_price || 0).toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Products in this category */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-2 font-medium text-gray-600">Product</th>
                          <th className="px-4 py-2 font-medium text-gray-600">Farm</th>
                          <th className="px-4 py-2 font-medium text-gray-600 text-right">Price</th>
                          <th className="px-4 py-2 font-medium text-gray-600 text-right">Stock</th>
                          <th className="px-4 py-2 font-medium text-gray-600 text-right">Sold</th>
                          <th className="px-4 py-2 font-medium text-gray-600 text-right">Revenue</th>
                          <th className="px-4 py-2 font-medium text-gray-600 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {catProducts.map((p) => {
                          const isSold = Number(p.total_sold_qty) > 0;
                          const inStock = p.is_available && p.current_stock > 0;
                          return (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{p.farm_name}</td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                ₹{Number(p.price).toFixed(2)}/{p.unit}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={p.current_stock > 0 ? 'text-green-700 font-medium' : 'text-red-500 font-medium'}>
                                  {p.current_stock}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={isSold ? 'text-indigo-700 font-medium' : 'text-gray-400'}>
                                  {Number(p.total_sold_qty).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                                ₹{Number(p.total_revenue).toLocaleString('en-IN')}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
