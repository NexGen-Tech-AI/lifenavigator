'use client'

import { useState } from 'react'
import { X, Lock, Sparkles } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { 
  FeatureKey, 
  FEATURES, 
  TIER_CONFIG, 
  SubscriptionTier,
  hasFeatureAccess 
} from '@/lib/features/access-control'

interface FeatureUpgradePromptProps {
  feature: FeatureKey
  onClose?: () => void
  className?: string
}

export function FeatureUpgradePrompt({ 
  feature, 
  onClose,
  className = ''
}: FeatureUpgradePromptProps) {
  const { subscriptionTier } = useUser()
  const [showModal, setShowModal] = useState(true)
  
  const featureInfo = FEATURES[feature]
  const currentTier = subscriptionTier || 'FREE'
  
  // Find the minimum tier needed for this feature
  const requiredTier = featureInfo.availableIn[0] as SubscriptionTier
  const tierInfo = TIER_CONFIG[requiredTier]
  
  const handleClose = () => {
    setShowModal(false)
    onClose?.()
  }
  
  if (!showModal || hasFeatureAccess(currentTier, feature)) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl ${className}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upgrade Required
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {featureInfo.name}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {featureInfo.description}
            </p>
          </div>
          
          <div className="border dark:border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">
                {tierInfo.name} Plan
              </h5>
              {tierInfo.price !== null && (
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${tierInfo.price}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {tierInfo.description}
            </p>
            <ul className="space-y-2">
              {tierInfo.highlights.slice(0, 3).map((highlight, idx) => (
                <li key={idx} className="flex items-start text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard/settings/subscription'}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upgrade Now
            </button>
            <button
              onClick={handleClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
          
          {requiredTier === 'PILOT' && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Join our pilot program for early access to this feature!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline feature lock indicator
 */
export function FeatureLockBadge({ 
  feature,
  className = '' 
}: {
  feature: FeatureKey
  className?: string
}) {
  const { subscriptionTier } = useUser()
  const currentTier = subscriptionTier || 'FREE'
  
  if (hasFeatureAccess(currentTier, feature)) {
    return null
  }
  
  const featureInfo = FEATURES[feature]
  const requiredTier = featureInfo.availableIn[0]
  
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${className}`}>
      <Lock className="w-3 h-3 mr-1" />
      {requiredTier}
    </span>
  )
}