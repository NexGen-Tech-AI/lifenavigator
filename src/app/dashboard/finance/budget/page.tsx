'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BudgetPlanner from '@/components/domain/finance/BudgetPlanner';
import { IntegrationModal } from '@/components/integrations/components/IntegrationModal';
import { PROVIDER_CONFIG } from '@/lib/integrations/providers';

// Get only the budget-related integrations
const budgetIntegrations = PROVIDER_CONFIG.filter(
  (provider) => provider.category === 'finance' && 
  (provider.id === 'ynab' || provider.id === 'mint' || provider.id === 'plaid')
);

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'categories'>('overview');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  // Handle opening integration modal
  const openIntegrationModal = (providerId: string) => {
    setSelectedProvider(providerId);
    setIsIntegrationModalOpen(true);
  };

  // Handle closing integration modal
  const closeIntegrationModal = () => {
    setIsIntegrationModalOpen(false);
    setSelectedProvider(null);
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Budget Planner</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your budget to help you achieve your financial goals</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Budget sections">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Create Budget
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Categories
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      {activeTab === 'overview' && (
        <>
          <BudgetPlanner />
          
          {/* Integrations section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Budget Data</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Connect external services to import your budget data
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetIntegrations.map((provider) => (
                  <div
                    key={provider.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openIntegrationModal(provider.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">{provider.name}</h4>
                      {provider.connected ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{provider.description}</p>
                    <button
                      className="mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 focus:outline-none"
                    >
                      {provider.connected ? 'Manage Connection' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Create New Budget</h2>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="budget-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Budget Name
              </label>
              <input
                type="text"
                id="budget-name"
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Monthly Budget June 2025"
              />
            </div>
            
            <div>
              <label htmlFor="total-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Budget Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="total-amount"
                  className="block w-full pl-7 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="is-active"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="is-active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Set as active budget
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="mr-3 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Budget
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Budget Categories</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { name: 'Housing', allocated: 2000, spent: 1950 },
                  { name: 'Food', allocated: 800, spent: 920 },
                  { name: 'Transportation', allocated: 400, spent: 385 },
                  { name: 'Utilities', allocated: 300, spent: 310 },
                  { name: 'Entertainment', allocated: 200, spent: 250 },
                  { name: 'Healthcare', allocated: 150, spent: 125 },
                  { name: 'Shopping', allocated: 300, spent: 450 },
                  { name: 'Personal', allocated: 100, spent: 85 },
                  { name: 'Savings', allocated: 500, spent: 500 }
                ].map((category, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${category.allocated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${category.spent}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      category.allocated - category.spent >= 0 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${category.allocated - category.spent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add Category
            </button>
          </div>
        </div>
      )}
      
      {/* Integration Modal */}
      {selectedProvider && (
        <IntegrationModal
          providerId={selectedProvider}
          isOpen={isIntegrationModalOpen}
          onClose={closeIntegrationModal}
        />
      )}
    </div>
  );
}