'use client';

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AccountType, CreateAccountInput } from '@/types/database';
import { useCreateAccount } from '@/hooks/useAccounts';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'CHECKING', label: 'Checking Account' },
  { value: 'SAVINGS', label: 'Savings Account' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'INVESTMENT', label: 'Investment Account' },
  { value: 'LOAN', label: 'Loan' },
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'OTHER', label: 'Other' },
];

export default function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
  const createAccount = useCreateAccount();
  const [formData, setFormData] = useState<CreateAccountInput>({
    accountName: '',
    accountType: 'CHECKING',
    institutionName: '',
    currentBalance: 0,
    availableBalance: undefined,
    creditLimit: undefined,
    apr: undefined,
    accountNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAccount.mutateAsync(formData);
      onClose();
      // Reset form
      setFormData({
        accountName: '',
        accountType: 'CHECKING',
        institutionName: '',
        currentBalance: 0,
        availableBalance: undefined,
        creditLimit: undefined,
        apr: undefined,
        accountNumber: '',
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'currentBalance' || name === 'availableBalance' || 
               name === 'creditLimit' || name === 'apr' 
               ? parseFloat(value) || 0 
               : value
    }));
  };

  const showCreditFields = formData.accountType === 'CREDIT_CARD';
  const showLoanFields = ['LOAN', 'MORTGAGE'].includes(formData.accountType);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Add New Account
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Account Name */}
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Name
              </label>
              <input
                type="text"
                id="accountName"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Main Checking"
              />
            </div>

            {/* Account Type */}
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Name */}
            <div>
              <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank/Institution Name
              </label>
              <input
                type="text"
                id="institutionName"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Chase Bank"
              />
            </div>

            {/* Current Balance */}
            <div>
              <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Balance
              </label>
              <input
                type="number"
                id="currentBalance"
                name="currentBalance"
                value={formData.currentBalance}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Credit Card Fields */}
            {showCreditFields && (
              <>
                <div>
                  <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    id="creditLimit"
                    name="creditLimit"
                    value={formData.creditLimit || ''}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="apr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    APR (%)
                  </label>
                  <input
                    type="number"
                    id="apr"
                    name="apr"
                    value={formData.apr || ''}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Account Number (Last 4) */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number (Last 4 digits)
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                maxLength={4}
                pattern="[0-9]*"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="1234"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAccount.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAccount.isPending ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}