'use client';

import React from 'react';

export default function BudgetPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Budget Planner</h1>
      
      {/* Budget management would be implemented here */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Management</h2>
        <p className="text-gray-500 mb-4">Create and track budgets to help manage your spending and achieve your financial goals.</p>
        
        <div className="p-4 bg-blue-50 rounded-md">
          <p className="text-blue-800">This page is under development. Budget planning features will be available soon.</p>
        </div>
      </div>
    </div>
  );
}