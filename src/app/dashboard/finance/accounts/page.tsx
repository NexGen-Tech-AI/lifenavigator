'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  DocumentArrowUpIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  HomeIcon,
  ChartBarIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/loaders/LoadingSpinner';
import { useAccounts } from '@/hooks/useAccounts';

interface Account {
  id: string;
  account_name: string;
  account_type: string;
  institution_name: string;
  current_balance: number;
  available_balance?: number;
  credit_limit?: number;
  minimum_payment?: number;
  apr?: number;
  currency: string;
  last_synced?: string;
  data_source: string;
}

interface AccountFormData {
  accountName: string;
  accountType: string;
  institutionName: string;
  currentBalance: string;
  availableBalance: string;
  creditLimit: string;
  minimumPayment: string;
  apr: string;
}

export default function AccountsPage() {
  const router = useRouter();
  const { accounts: accountsData, isLoading, refetch } = useAccounts();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<AccountFormData>({
    accountName: '',
    accountType: 'CHECKING',
    institutionName: '',
    currentBalance: '',
    availableBalance: '',
    creditLimit: '',
    minimumPayment: '',
    apr: ''
  });

  useEffect(() => {
    setAccounts(accountsData || []);
  }, [accountsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      accountName: formData.accountName,
      accountType: formData.accountType,
      institutionName: formData.institutionName,
      currentBalance: parseFloat(formData.currentBalance),
      availableBalance: formData.availableBalance ? parseFloat(formData.availableBalance) : undefined,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      minimumPayment: formData.minimumPayment ? parseFloat(formData.minimumPayment) : undefined,
      apr: formData.apr ? parseFloat(formData.apr) : undefined
    };

    try {
      const url = editingAccount ? `/api/v1/accounts/${editingAccount.id}` : '/api/v1/accounts';
      const method = editingAccount ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await refetch();
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.account_name,
      accountType: account.account_type,
      institutionName: account.institution_name,
      currentBalance: account.current_balance.toString(),
      availableBalance: account.available_balance?.toString() || '',
      creditLimit: account.credit_limit?.toString() || '',
      minimumPayment: account.minimum_payment?.toString() || '',
      apr: account.apr?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const response = await fetch(`/api/v1/accounts/${accountId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await refetch();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    // In a real implementation, this would upload to the server
    // and process the statement to extract account information
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setShowUploadModal(false);
      alert('Statement processing feature coming soon!');
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      accountType: 'CHECKING',
      institutionName: '',
      currentBalance: '',
      availableBalance: '',
      creditLimit: '',
      minimumPayment: '',
      apr: ''
    });
    setEditingAccount(null);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CHECKING':
      case 'SAVINGS':
        return <BuildingLibraryIcon className="w-5 h-5" />;
      case 'CREDIT_CARD':
        return <CreditCardIcon className="w-5 h-5" />;
      case 'INVESTMENT':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'LOAN':
      case 'MORTGAGE':
        return <HomeIcon className="w-5 h-5" />;
      default:
        return <WalletIcon className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotals = () => {
    const assets = accounts.filter(a => 
      ['CHECKING', 'SAVINGS', 'INVESTMENT'].includes(a.account_type)
    ).reduce((sum, a) => sum + a.current_balance, 0);

    const liabilities = accounts.filter(a => 
      ['CREDIT_CARD', 'LOAN', 'MORTGAGE'].includes(a.account_type)
    ).reduce((sum, a) => sum + Math.abs(a.current_balance), 0);

    return { assets, liabilities, netWorth: assets - liabilities };
  };

  const filteredAccounts = selectedFilter === 'all' 
    ? accounts 
    : accounts.filter(a => a.account_type === selectedFilter);

  const totals = calculateTotals();

  const accountTypeOptions = [
    { value: 'all', label: 'All Accounts' },
    { value: 'CHECKING', label: 'Checking' },
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'CREDIT_CARD', label: 'Credit Cards' },
    { value: 'INVESTMENT', label: 'Investments' },
    { value: 'LOAN', label: 'Loans' },
    { value: 'MORTGAGE', label: 'Mortgages' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Accounts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your financial accounts and track your net worth
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Assets</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totals.assets)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            +5.2% from last month
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Liabilities</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totals.liabilities)}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            -2.3% from last month
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Net Worth</h3>
          <p className={`text-2xl font-bold ${totals.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totals.netWorth)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            +8.7% from last month
          </p>
        </div>
      </div>

      {/* Action Buttons and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Account
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            Upload Statement
          </button>
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {accountTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedFilter === 'all' ? 'All Accounts' : accountTypeOptions.find(o => o.value === selectedFilter)?.label}
          </h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <LoadingSpinner />
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {selectedFilter === 'all' 
                ? 'No accounts added yet' 
                : `No ${accountTypeOptions.find(o => o.value === selectedFilter)?.label.toLowerCase()} accounts`}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              Add your first account
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAccounts.map((account) => (
              <div key={account.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getAccountIcon(account.account_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {account.account_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.institution_name} • {account.account_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        account.current_balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(account.current_balance))}
                      </p>
                      {account.credit_limit && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Limit: {formatCurrency(account.credit_limit)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Edit account"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete account"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {account.data_source === 'MANUAL' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-14">
                    Manually entered • Last updated {new Date().toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Account Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingAccount ? 'Edit Account' : 'Add Financial Account'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Chase Checking"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="INVESTMENT">Investment</option>
                  <option value="LOAN">Loan</option>
                  <option value="MORTGAGE">Mortgage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Chase Bank"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Balance
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              
              {(formData.accountType === 'CHECKING' || formData.accountType === 'SAVINGS') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Available Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.availableBalance}
                    onChange={(e) => setFormData({ ...formData, availableBalance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              )}
              
              {formData.accountType === 'CREDIT_CARD' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Credit Limit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Payment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minimumPayment}
                      onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      APR (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.apr}
                      onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
              
              {(formData.accountType === 'LOAN' || formData.accountType === 'MORTGAGE') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Payment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minimumPayment}
                      onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.apr}
                      onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Statement Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Bank Statement
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadProgress(0);
                  setIsUploading(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              {isUploading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400">Processing statement...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your statement here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.csv,.xls,.xlsx"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Supported formats: PDF, CSV, Excel. We'll extract account information and transactions automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}