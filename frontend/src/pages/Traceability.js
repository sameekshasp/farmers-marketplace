import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { traceabilityAPI } from '../services/api';
import {
  QrCode,
  Sprout,
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Leaf,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const Traceability = () => {
  const { t } = useTranslation();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [traceData, setTraceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      fetchTraceability();
    }
  }, [batchId]);

  const fetchTraceability = async () => {
    try {
      const response = await traceabilityAPI.get(`/${batchId}`);
      setTraceData(response.data);
    } catch (error) {
      toast.error('Failed to load traceability data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <ShieldCheck className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Product Traceability</h1>
            </div>
            <p className="text-primary-100">Track your food from farm to table</p>
          </div>

          {/* Batch ID */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Batch ID</p>
                <p className="font-mono text-lg font-medium text-gray-900">{batchId}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <QrCode className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          {traceData ? (
            <div className="p-6">
              {/* Timeline */}
              <div className="space-y-6">
                {/* Harvest */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 pb-6 border-l-2 border-green-200 ml-5 -translate-x-5 pl-4">
                    <h3 className="font-semibold text-gray-900">Harvested</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(traceData.harvest_date)}
                    </p>
                    {traceData.farmer && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{traceData.farmer.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{traceData.farmer.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quality Check */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 pb-6 border-l-2 border-blue-200 ml-5 -translate-x-5 pl-4">
                    <h3 className="font-semibold text-gray-900">Quality Verified</h3>
                    <p className="text-sm text-gray-600">Quality check passed</p>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">Organic Certified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Packaging */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 pb-6 border-l-2 border-purple-200 ml-5 -translate-x-5 pl-4">
                    <h3 className="font-semibold text-gray-900">Packaged</h3>
                    <p className="text-sm text-gray-600">Freshly packed for delivery</p>
                    {traceData.storage_conditions && (
                      <p className="mt-2 text-sm text-gray-600">
                        Storage: {traceData.storage_conditions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 ml-5 -translate-x-5 pl-4">
                    <h3 className="font-semibold text-gray-900">Ready for Delivery</h3>
                    <p className="text-sm text-gray-600">On its way to you</p>
                    {traceData.transport_info && (
                      <p className="mt-2 text-sm text-gray-600">
                        Transport: {traceData.transport_info}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {traceData.product && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{traceData.product.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium capitalize">{traceData.product.category}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Certifications */}
              {traceData.certifications && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Leaf className="h-4 w-4 mr-2" />
                    Certifications
                  </h3>
                  <p className="text-sm text-green-800">{traceData.certifications}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Traceability Data</h3>
              <p className="text-gray-600">Traceability information for this batch is not available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Traceability;
