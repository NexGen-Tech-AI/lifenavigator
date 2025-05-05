'use client';

import React from 'react';

export default function AccountsPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Financial Accounts</h1>
      
      {/* Account management would be implemented here */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Connected Accounts</h2>
        <p className="text-gray-500 mb-4">View and manage all your connected financial accounts.</p>
        
        <div className="p-4 bg-blue-50 rounded-md">
          <p className="text-blue-800">This page is under development. Account management features will be available soon.</p>
        </div>
      </div>
    </div>
  );
}