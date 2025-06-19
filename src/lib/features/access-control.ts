/**
 * Feature Access Control System
 * Manages feature availability based on user subscription tiers
 */

export type SubscriptionTier = 'FREE' | 'PILOT' | 'PRO' | 'PREMIUM' | 'ENTERPRISE'

export type FeatureKey = 
  | 'manual_data_entry'
  | 'document_upload'
  | 'plaid_integration'
  | 'healthcare_api'
  | 'ai_insights'
  | 'family_sharing'
  | 'advanced_analytics'
  | 'custom_integrations'
  | 'priority_support'
  | 'data_export'
  | 'api_access'
  | 'microservices'

interface FeatureDefinition {
  name: string
  description: string
  availableIn: SubscriptionTier[]
  limits?: {
    [tier: string]: number | boolean
  }
}

export const FEATURES: Record<FeatureKey, FeatureDefinition> = {
  manual_data_entry: {
    name: 'Manual Data Entry',
    description: 'Manually input financial and health data',
    availableIn: ['FREE', 'PILOT', 'PRO', 'PREMIUM', 'ENTERPRISE']
  },
  document_upload: {
    name: 'Document Upload',
    description: 'Upload and store documents',
    availableIn: ['FREE', 'PILOT', 'PRO', 'PREMIUM', 'ENTERPRISE'],
    limits: {
      FREE: 10, // 10 documents max
      PILOT: 100,
      PRO: 1000,
      PREMIUM: -1, // unlimited
      ENTERPRISE: -1
    }
  },
  plaid_integration: {
    name: 'Bank Account Connection',
    description: 'Connect bank accounts via Plaid',
    availableIn: ['PILOT', 'PRO', 'PREMIUM', 'ENTERPRISE'],
    limits: {
      PILOT: 3, // 3 accounts
      PRO: 10,
      PREMIUM: -1,
      ENTERPRISE: -1
    }
  },
  healthcare_api: {
    name: 'Healthcare Integrations',
    description: 'Connect to healthcare providers',
    availableIn: ['PRO', 'PREMIUM', 'ENTERPRISE']
  },
  ai_insights: {
    name: 'AI-Powered Insights',
    description: 'Get AI recommendations and predictions',
    availableIn: ['PILOT', 'PRO', 'PREMIUM', 'ENTERPRISE'],
    limits: {
      PILOT: 10, // 10 insights per month
      PRO: 100,
      PREMIUM: -1,
      ENTERPRISE: -1
    }
  },
  family_sharing: {
    name: 'Family Sharing',
    description: 'Share access with family members',
    availableIn: ['PREMIUM', 'ENTERPRISE'],
    limits: {
      PREMIUM: 5, // 5 family members
      ENTERPRISE: -1
    }
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed reports and trends',
    availableIn: ['PRO', 'PREMIUM', 'ENTERPRISE']
  },
  custom_integrations: {
    name: 'Custom Integrations',
    description: 'Build custom integrations',
    availableIn: ['ENTERPRISE']
  },
  priority_support: {
    name: 'Priority Support',
    description: '24/7 priority customer support',
    availableIn: ['PREMIUM', 'ENTERPRISE']
  },
  data_export: {
    name: 'Data Export',
    description: 'Export data in various formats',
    availableIn: ['FREE', 'PILOT', 'PRO', 'PREMIUM', 'ENTERPRISE'],
    limits: {
      FREE: 1, // 1 export per month
      PILOT: 10,
      PRO: -1,
      PREMIUM: -1,
      ENTERPRISE: -1
    }
  },
  api_access: {
    name: 'API Access',
    description: 'Access to developer APIs',
    availableIn: ['PRO', 'PREMIUM', 'ENTERPRISE'],
    limits: {
      PRO: 1000, // requests per day
      PREMIUM: 10000,
      ENTERPRISE: -1
    }
  },
  microservices: {
    name: 'Microservices',
    description: 'Access to all microservices',
    availableIn: ['FREE', 'PILOT', 'PRO', 'PREMIUM', 'ENTERPRISE'] // Available to all
  }
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: FeatureKey
): boolean {
  const featureConfig = FEATURES[feature]
  if (!featureConfig) return false
  
  return featureConfig.availableIn.includes(userTier)
}

/**
 * Get the limit for a feature based on user tier
 */
export function getFeatureLimit(
  userTier: SubscriptionTier,
  feature: FeatureKey
): number | boolean | null {
  const featureConfig = FEATURES[feature]
  if (!featureConfig || !featureConfig.limits) return null
  
  return featureConfig.limits[userTier] ?? null
}

/**
 * Get all features available for a tier
 */
export function getTierFeatures(tier: SubscriptionTier): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, config]) => config.availableIn.includes(tier))
    .map(([key]) => key as FeatureKey)
}

/**
 * Tier pricing and descriptions
 */
export const TIER_CONFIG = {
  FREE: {
    name: 'Free',
    price: 0,
    description: 'Basic features with manual data entry',
    highlights: [
      'Manual data entry',
      'Basic document storage (10 files)',
      'Monthly data export',
      'Access to microservices'
    ]
  },
  PILOT: {
    name: 'Pilot Program',
    price: 0, // Free during pilot
    description: 'Early access to premium features',
    highlights: [
      'Everything in Free',
      'Plaid bank connections (3 accounts)',
      'AI insights (10/month)',
      'Extended document storage (100 files)',
      'Priority pilot feedback channel'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 19.99,
    description: 'Professional features for individuals',
    highlights: [
      'Everything in Pilot',
      'Unlimited AI insights',
      'Healthcare integrations',
      'Advanced analytics',
      'API access (1000 req/day)',
      'Unlimited data exports'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    price: 39.99,
    description: 'Complete solution for families',
    highlights: [
      'Everything in Pro',
      'Family sharing (5 members)',
      'Priority support',
      'Higher API limits (10k req/day)',
      'Unlimited everything'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null, // Custom pricing
    description: 'Custom solutions for organizations',
    highlights: [
      'Everything in Premium',
      'Custom integrations',
      'Dedicated support',
      'Unlimited API access',
      'SLA guarantees',
      'On-premise deployment options'
    ]
  }
}

/**
 * Feature gates for UI components
 */
export function FeatureGate({ 
  feature, 
  userTier, 
  children,
  fallback = null 
}: {
  feature: FeatureKey
  userTier: SubscriptionTier
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  if (hasFeatureAccess(userTier, feature)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}

/**
 * Hook for feature access checks
 */
export function useFeatureAccess(feature: FeatureKey, userTier: SubscriptionTier) {
  const hasAccess = hasFeatureAccess(userTier, feature)
  const limit = getFeatureLimit(userTier, feature)
  const featureInfo = FEATURES[feature]
  
  return {
    hasAccess,
    limit,
    featureName: featureInfo?.name,
    description: featureInfo?.description,
    requiredTiers: featureInfo?.availableIn || []
  }
}