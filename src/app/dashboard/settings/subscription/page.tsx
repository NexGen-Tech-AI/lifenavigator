'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { TIER_CONFIG, SubscriptionTier, getTierFeatures, FEATURES } from '@/lib/features/access-control'
import { Check, X, Sparkles, Crown, Rocket, Building2 } from 'lucide-react'

const tierIcons = {
  FREE: null,
  PILOT: Rocket,
  PRO: Sparkles,
  PREMIUM: Crown,
  ENTERPRISE: Building2
}

export default function SubscriptionPage() {
  const { profile, subscriptionTier } = useUser()
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const currentTier = subscriptionTier || 'FREE'
  
  const handleUpgrade = async (tier: SubscriptionTier) => {
    setSelectedTier(tier)
    
    // For pilot program, redirect to application form
    if (tier === 'PILOT') {
      window.location.href = '/pilot-program/apply'
      return
    }
    
    // For paid tiers, would integrate with Stripe here
    alert(`Upgrade to ${tier} coming soon! Contact support@lifenavigator.ai for early access.`)
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your subscription and billing preferences
        </p>
      </div>
      
      {/* Current Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              {tierIcons[currentTier] && (
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  {tierIcons[currentTier] && <tierIcons[currentTier] className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {TIER_CONFIG[currentTier].name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {TIER_CONFIG[currentTier].description}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            {TIER_CONFIG[currentTier].price !== null ? (
              <>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${TIER_CONFIG[currentTier].price}
                </div>
                <div className="text-sm text-gray-500">per month</div>
              </>
            ) : (
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {currentTier === 'FREE' ? 'Free forever' : 'Custom pricing'}
              </div>
            )}
          </div>
        </div>
        
        {profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date() && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Trial ends on {new Date(profile.trial_ends_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
      
      {/* Available Plans */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.entries(TIER_CONFIG) as [SubscriptionTier, typeof TIER_CONFIG[SubscriptionTier]][])
          .filter(([tier]) => tier !== 'ENTERPRISE') // Hide enterprise for self-service
          .map(([tier, config]) => {
            const isCurrentTier = tier === currentTier
            const tierFeatures = getTierFeatures(tier)
            const Icon = tierIcons[tier]
            
            return (
              <div
                key={tier}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 transition-all ${
                  isCurrentTier
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {Icon && (
                      <Icon className={`w-5 h-5 ${
                        isCurrentTier ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                      }`} />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {config.name}
                    </h3>
                  </div>
                  {isCurrentTier && (
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {config.description}
                </p>
                
                <div className="mb-6">
                  {config.price !== null ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${config.price}
                      </span>
                      <span className="ml-1 text-gray-500">/month</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {tier === 'FREE' ? 'Free' : tier === 'PILOT' ? 'Free (Limited Time)' : 'Contact Us'}
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {config.highlights.slice(0, 5).map((highlight, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
                
                {!isCurrentTier && (
                  <button
                    onClick={() => handleUpgrade(tier)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      tier === 'PILOT'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tier === 'PILOT' ? 'Apply for Pilot' : `Upgrade to ${config.name}`}
                  </button>
                )}
              </div>
            )
          })}
      </div>
      
      {/* Feature Comparison */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Feature Comparison</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Feature
                </th>
                {(Object.keys(TIER_CONFIG) as SubscriptionTier[])
                  .filter(tier => tier !== 'ENTERPRISE')
                  .map(tier => (
                    <th key={tier} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {TIER_CONFIG[tier].name}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(FEATURES).map(([featureKey, feature], idx) => (
                <tr key={featureKey} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {feature.name}
                  </td>
                  {(Object.keys(TIER_CONFIG) as SubscriptionTier[])
                    .filter(tier => tier !== 'ENTERPRISE')
                    .map(tier => {
                      const hasAccess = feature.availableIn.includes(tier)
                      const limit = feature.limits?.[tier]
                      
                      return (
                        <td key={tier} className="px-6 py-4 text-center">
                          {hasAccess ? (
                            limit !== undefined ? (
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {limit === -1 ? 'Unlimited' : limit}
                              </span>
                            ) : (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            )
                          ) : (
                            <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Enterprise CTA */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Need more? Let's talk about Enterprise
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Custom integrations, dedicated support, and unlimited everything
        </p>
        <button
          onClick={() => window.location.href = 'mailto:enterprise@lifenavigator.ai'}
          className="inline-flex items-center px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Contact Sales
        </button>
      </div>
    </div>
  )
}