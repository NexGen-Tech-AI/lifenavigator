// src/app/email/page.tsx
'use client';

import { useState } from 'react';

export default function EmailPage() {
  const [emailAccounts, setEmailAccounts] = useState([
    {
      id: '1',
      provider: 'Gmail',
      email: 'thomas.riffe@gmail.com',
      connected: true,
      lastSync: 'Just now'
    },
    {
      id: '2',
      provider: 'Outlook',
      email: 'thomas.riffe@outlook.com',
      connected: true,
      lastSync: '5 minutes ago'
    },
    {
      id: '3',
      provider: 'Work',
      email: 'thomas.riffe@company.com',
      connected: true,
      lastSync: '10 minutes ago'
    }
  ]);

  const toggleEmailConnection = (id: string) => {
    setEmailAccounts(
      emailAccounts.map(account => 
        account.id === id ? { ...account, connected: !account.connected } : account
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Email Accounts</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
            Connect New Email
          </button>
        </div>

        <div className="space-y-4">
          {emailAccounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{account.provider}</h3>
                <p className="text-sm text-gray-600">{account.email}</p>
                <p className="text-xs text-gray-500">Last synced: {account.lastSync}</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => toggleEmailConnection(account.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    account.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {account.connected ? 'Connected' : 'Connect'}
                </button>
                <button className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-800">
                  Settings
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-medium mb-2">What you can do</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Connect multiple email accounts in one place
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Receive notifications for all accounts
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Smart filtering and organization
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Life Navigator AI assistance with your emails
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}