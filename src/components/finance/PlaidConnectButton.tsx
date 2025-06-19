'use client'

import { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { usePlaidLink } from 'react-plaid-link'
import { useUser } from '@/hooks/useUser'
import { hasFeatureAccess, getFeatureLimit } from '@/lib/features/access-control'
import { FeatureUpgradePrompt } from '@/components/features/FeatureUpgradePrompt'

export function PlaidConnectButton() {
  const { subscriptionTier } = useUser()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const currentTier = subscriptionTier || 'FREE'
  const hasAccess = hasFeatureAccess(currentTier, 'plaid_integration')
  const accountLimit = getFeatureLimit(currentTier, 'plaid_integration') as number
  
  // Get link token from API
  const getLinkToken = async () => {
    try {
      const response = await fetch('/api/v1/plaid/link', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.link_token) {
        setLinkToken(data.link_token)
      }
    } catch (error) {
      console.error('Failed to get link token:', error)
    }
  }
  
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      // Exchange public token for access token
      try {
        const response = await fetch('/api/v1/plaid/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            public_token,
            metadata 
          }),
        })
        
        if (response.ok) {
          // Refresh accounts list
          window.location.reload()
        }
      } catch (error) {
        console.error('Failed to exchange token:', error)
      }
    },
  })
  
  const handleConnect = async () => {
    if (!hasAccess) {
      setShowUpgradePrompt(true)
      return
    }
    
    setIsLoading(true)
    if (!linkToken) {
      await getLinkToken()
    }
    
    if (ready) {
      open()
    }
    setIsLoading(false)
  }
  
  return (
    <>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Connect Bank Account
          </>
        )}
      </button>
      
      {currentTier === 'PILOT' && accountLimit > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {accountLimit} account connections available in pilot
        </p>
      )}
      
      {showUpgradePrompt && (
        <FeatureUpgradePrompt
          feature="plaid_integration"
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </>
  )
}

/**
 * Manual account entry form for free tier
 */
export function ManualAccountForm() {
  const [formData, setFormData] = useState({
    institution_name: '',
    account_name: '',
    account_type: 'CHECKING',
    current_balance: '',
    currency: 'USD'
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/v1/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          current_balance: parseFloat(formData.current_balance),
          is_manual: true
        }),
      })
      
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to add account:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
        <Building2 className="w-5 h-5 mr-2" />
        Add Account Manually
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Institution Name
          </label>
          <input
            type="text"
            required
            value={formData.institution_name}
            onChange={(e) => setFormData({...formData, institution_name: e.target.value})}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Chase Bank"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Account Name
          </label>
          <input
            type="text"
            required
            value={formData.account_name}
            onChange={(e) => setFormData({...formData, account_name: e.target.value})}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Main Checking"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Account Type
          </label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData({...formData, account_type: e.target.value})}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="INVESTMENT">Investment</option>
            <option value="LOAN">Loan</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Balance
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.current_balance}
            onChange={(e) => setFormData({...formData, current_balance: e.target.value})}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="0.00"
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Add Account
      </button>
    </form>
  )
}