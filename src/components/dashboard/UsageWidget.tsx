'use client'

import { useFeatureUsage } from '@/hooks/useFeatureUsage'
import { FeatureKey, FEATURES } from '@/lib/features/access-control'
import { TrendingUp, FileText, Link2 } from 'lucide-react'

const featureIcons = {
  plaid_integration: Link2,
  ai_insights: TrendingUp,
  document_upload: FileText
}

interface UsageWidgetProps {
  feature: FeatureKey
  className?: string
}

export function UsageWidget({ feature, className = '' }: UsageWidgetProps) {
  const { 
    hasAccess, 
    currentUsage, 
    limit, 
    usagePercentage,
    remainingUsage 
  } = useFeatureUsage(feature)
  
  if (!hasAccess || limit === -1) return null
  
  const Icon = featureIcons[feature as keyof typeof featureIcons]
  const featureInfo = FEATURES[feature]
  
  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'text-red-600 dark:text-red-400'
    if (usagePercentage >= 75) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {featureInfo.name}
          </h3>
        </div>
        <span className={`text-sm font-semibold ${getUsageColor()}`}>
          {currentUsage}/{limit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            usagePercentage >= 90 
              ? 'bg-red-500' 
              : usagePercentage >= 75 
              ? 'bg-yellow-500' 
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      
      {remainingUsage !== null && remainingUsage <= 3 && remainingUsage > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {remainingUsage} remaining this month
        </p>
      )}
    </div>
  )
}

export function UsageDashboard() {
  const features: FeatureKey[] = ['plaid_integration', 'ai_insights', 'document_upload']
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map(feature => (
        <UsageWidget key={feature} feature={feature} />
      ))}
    </div>
  )
}