'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import { useAssets } from '@/contexts/AssetsContext';

interface Asset {
  id: string;
  name: string;
  type: string;
  value?: number;
  description?: string;
  created_at: string;
  documents?: Document[];
  thumbnail?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
}

export default function FinancialAssetsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { assets, setAssets } = useAssets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New asset form data
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'real_estate',
    value: '',
    description: ''
  });

  // No need for loading state - assets come from context
  // Demo mode - no auth check needed

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For demo purposes, add asset to local state
      const newAssetItem: Asset = {
        id: Date.now().toString(),
        name: newAsset.name,
        type: newAsset.type,
        value: parseFloat(newAsset.value) || 0,
        description: newAsset.description,
        created_at: new Date().toISOString(),
        documents: [],
        thumbnail: undefined
      };

      setAssets(prev => [...prev, newAssetItem]);
      
      // Reset form and close modal
      setNewAsset({ name: '', type: 'real_estate', value: '', description: '' });
      setShowAddModal(false);
      
      // Show success message
      alert('Asset added successfully!');
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedAsset) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileUrl = URL.createObjectURL(file);

      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        // First image becomes the thumbnail
        if (!selectedAsset.thumbnail) {
          setAssets(prev => prev.map(asset => {
            if (asset.id === selectedAsset.id) {
              return {
                ...asset,
                thumbnail: fileUrl
              };
            }
            return asset;
          }));
        }
      }

      // Always add as a document
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploaded_at: new Date().toISOString()
      };

      // Update the asset with the new document
      setAssets(prev => prev.map(asset => {
        if (asset.id === selectedAsset.id) {
          return {
            ...asset,
            documents: [...(asset.documents || []), newDocument]
          };
        }
        return asset;
      }));

      setShowUploadModal(false);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  // Remove loading state - assets are managed by context

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Financial Assets
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't added any assets yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/finance/assets/${asset.id}`)}
            >
              {/* Thumbnail Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {asset.thumbnail ? (
                  <img
                    src={asset.thumbnail}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                {/* Upload thumbnail button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAsset(asset);
                    setShowUploadModal(true);
                  }}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  title="Upload image"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              {/* Asset Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{asset.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {asset.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </p>
                {asset.value && (
                  <p className="text-lg font-medium text-green-600 dark:text-green-400 mb-4">
                    ${asset.value.toLocaleString()}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{asset.documents?.length || 0} documents</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAsset(asset);
                      setShowUploadModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    + Add Document
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Asset</h2>
            
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., Primary Residence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asset Type</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="real_estate">Real Estate</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="investment">Investment</option>
                  <option value="savings">Savings Account</option>
                  <option value="retirement">Retirement Account</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estimated Value</label>
                <input
                  type="number"
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="$0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  placeholder="Additional details about this asset..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Asset
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Upload Document for {selectedAsset.name}
            </h2>
            
            <FileUpload
              onUpload={handleFileUpload}
              acceptedTypes=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              maxSize={10 * 1024 * 1024} // 10MB
            />

            <button
              onClick={() => setShowUploadModal(false)}
              className="mt-4 w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}