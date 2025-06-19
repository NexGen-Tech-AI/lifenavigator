'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'
import { FeatureKey, getFeatureLimit, hasFeatureAccess } from '@/lib/features/access-control'

interface FeatureUsage {
  feature_key: string
  usage_count: number
  usage_limit: number
  period_start: string
  period_end: string
}

export function useFeatureUsage(featureKey: FeatureKey) {
  const { user, subscriptionTier } = useUser()
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const currentTier = subscriptionTier || 'FREE'
  const hasAccess = hasFeatureAccess(currentTier, featureKey)
  const defaultLimit = getFeatureLimit(currentTier, featureKey) as number
  
  // Get current usage
  const { data: usage, isLoading } = useQuery({
    queryKey: ['feature-usage', user?.id, featureKey],
    queryFn: async () => {
      if (!user?.id || !hasAccess) return null
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const { data, error } = await supabase
        .from('feature_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_key', featureKey)
        .gte('period_start', startOfMonth.toISOString())
        .single()
      
      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching usage:', error)
        return null
      }
      
      return data as FeatureUsage | null
    },
    enabled: !!user?.id && hasAccess
  })
  
  // Increment usage mutation
  const incrementUsage = useMutation({
    mutationFn: async () => {
      if (!user?.id || !hasAccess) {
        throw new Error('No access to this feature')
      }
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      // Upsert usage record
      const { data, error } = await supabase
        .from('feature_usage')
        .upsert({
          user_id: user.id,
          feature_key: featureKey,
          usage_count: (usage?.usage_count || 0) + 1,
          usage_limit: defaultLimit,
          period_start: startOfMonth.toISOString(),
          period_end: endOfMonth.toISOString()
        }, {
          onConflict: 'user_id,feature_key,period_start'
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-usage', user?.id, featureKey] })
    }
  })
  
  const currentUsage = usage?.usage_count || 0
  const limit = usage?.usage_limit || defaultLimit
  const hasReachedLimit = limit > 0 && currentUsage >= limit
  const remainingUsage = limit > 0 ? Math.max(0, limit - currentUsage) : null
  const usagePercentage = limit > 0 ? (currentUsage / limit) * 100 : 0
  
  return {
    hasAccess,
    currentUsage,
    limit,
    hasReachedLimit,
    remainingUsage,
    usagePercentage,
    isLoading,
    incrementUsage: incrementUsage.mutate,
    isIncrementing: incrementUsage.isPending,
    canUseFeature: hasAccess && !hasReachedLimit
  }
}

/**
 * Hook to track and enforce feature limits
 */
export function useFeatureLimiter(featureKey: FeatureKey) {
  const usage = useFeatureUsage(featureKey)
  
  const checkAndIncrement = async (): Promise<boolean> => {
    if (!usage.canUseFeature) {
      return false
    }
    
    try {
      await usage.incrementUsage()
      return true
    } catch (error) {
      console.error('Failed to increment usage:', error)
      return false
    }
  }
  
  return {
    ...usage,
    checkAndIncrement
  }
}