'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAssetById, updateAsset } = useAssets();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedAsset, setEditedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const foundAsset = getAssetById(params.id as string);
    if (foundAsset) {
      setAsset(foundAsset);
      setEditedAsset(foundAsset);
    }
    setIsLoading(false);
  }, [params.id, getAssetById]);

  const handleFileUpload = async (file: File) => {
    if (!asset) return;

    try {
      const fileUrl = URL.createObjectURL(file);

      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        // First image becomes the thumbnail
        if (!asset.thumbnail) {
          const updatedAsset = {
            ...asset,
            thumbnail: fileUrl
          };
          setAsset(updatedAsset);
          setEditedAsset(updatedAsset);
          updateAsset(asset.id, updatedAsset);
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

      const updatedAsset = {
        ...asset,
        documents: [...(asset.documents || []), newDocument]
      };
      setAsset(updatedAsset);
      setEditedAsset(updatedAsset);
      updateAsset(asset.id, updatedAsset);

      setShowUploadModal(false);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };

  const handleSaveEdit = () => {
    if (editedAsset) {
      updateAsset(editedAsset.id, editedAsset);
      setAsset(editedAsset);
      setEditMode(false);
      alert('Asset updated successfully!');
    }
  };

  const handleDeleteDocument = (docId: string) => {
    if (!asset || !confirm('Are you sure you want to delete this document?')) return;
    
    const updatedAsset = {
      ...asset,
      documents: asset.documents?.filter(doc => doc.id !== docId) || []
    };
    setAsset(updatedAsset);
    setEditedAsset(updatedAsset);
    updateAsset(asset.id, updatedAsset);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading asset details...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Asset not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/dashboard/finance/assets" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
          ← Back to Assets
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header Image */}
            <div className="relative h-64 lg:h-96 bg-gray-200 dark:bg-gray-700">
              {asset.thumbnail ? (
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Photo
              </button>
            </div>

            {/* Asset Details */}
            <div className="p-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Asset Name</label>
                    <input
                      type="text"
                      value={editedAsset?.name || ''}
                      onChange={(e) => setEditedAsset(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Value</label>
                    <input
                      type="number"
                      value={editedAsset?.value || ''}
                      onChange={(e) => setEditedAsset(prev => prev ? {...prev, value: parseFloat(e.target.value) || 0} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={editedAsset?.description || ''}
                      onChange={(e) => setEditedAsset(prev => prev ? {...prev, description: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedAsset(asset);
                      }}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {asset.name}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {asset.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                  </div>

                  {asset.value && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Value</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${asset.value.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {asset.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">{asset.description}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Documents */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Documents</h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add
              </button>
            </div>

            {asset.documents && asset.documents.length > 0 ? (
              <div className="space-y-3">
                {asset.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No documents uploaded yet.
              </p>
            )}
          </div>

          {/* Asset Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Type</dt>
                <dd className="font-medium">
                  {asset.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Added</dt>
                <dd className="font-medium">{new Date(asset.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">Asset ID</dt>
                <dd className="font-mono text-sm">{asset.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Upload Document
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