'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface AssetsContextType {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  getAssetById: (id: string) => Asset | undefined;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(() => {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('financial-assets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved assets:', e);
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever assets change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('financial-assets', JSON.stringify(assets));
    }
  }, [assets]);

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  };

  return (
    <AssetsContext.Provider value={{ assets, setAssets, getAssetById, updateAsset }}>
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetsContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetsProvider');
  }
  return context;
}