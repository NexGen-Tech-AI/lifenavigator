import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get feature name from query params
    const { searchParams } = new URL(request.url)
    const featureName = searchParams.get('feature')

    if (!featureName) {
      // Return all features and their access status
      const { data: features, error: featuresError } = await supabase
        .from('feature_usage')
        .select('*')
        .eq('user_id', user.id)

      if (featuresError) {
        console.error('Error fetching features:', featuresError)
        return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 })
      }

      // Get user tier
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
      }

      // Calculate access for each feature
      const featureAccess = features.map(feature => {
        const hasAccess = checkFeatureAccess(feature, userData.subscription_tier)
        const remainingUsage = feature.monthly_limit 
          ? feature.monthly_limit - feature.current_month_usage 
          : null

        return {
          feature: feature.feature_name,
          category: feature.feature_category,
          hasAccess,
          requiresTier: feature.requires_tier,
          currentUsage: feature.current_month_usage,
          monthlyLimit: feature.monthly_limit,
          remainingUsage,
          lastUsed: feature.last_used_at
        }
      })

      return NextResponse.json({
        userTier: userData.subscription_tier,
        features: featureAccess
      })
    } else {
      // Check access for specific feature
      const { data: feature, error: featureError } = await supabase
        .from('feature_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_name', featureName)
        .single()

      if (featureError && featureError.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching feature:', featureError)
        return NextResponse.json({ error: 'Failed to fetch feature' }, { status: 500 })
      }

      // Get user tier
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
      }

      if (!feature) {
        // Feature not tracked yet, assume free access
        return NextResponse.json({
          feature: featureName,
          hasAccess: true,
          userTier: userData.subscription_tier
        })
      }

      const hasAccess = checkFeatureAccess(feature, userData.subscription_tier)
      const remainingUsage = feature.monthly_limit 
        ? feature.monthly_limit - feature.current_month_usage 
        : null

      return NextResponse.json({
        feature: feature.feature_name,
        hasAccess,
        requiresTier: feature.requires_tier,
        userTier: userData.subscription_tier,
        currentUsage: feature.current_month_usage,
        monthlyLimit: feature.monthly_limit,
        remainingUsage,
        reason: !hasAccess ? getAccessDeniedReason(feature, userData.subscription_tier) : null
      })
    }
  } catch (error) {
    console.error('Feature access check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function checkFeatureAccess(feature: any, userTier: string): boolean {
  // Check tier requirement
  if (feature.requires_tier && feature.requires_tier !== 'FREE') {
    const tierHierarchy = ['FREE', 'PRO', 'AI_AGENT', 'FAMILY']
    const userTierIndex = tierHierarchy.indexOf(userTier)
    const requiredTierIndex = tierHierarchy.indexOf(feature.requires_tier)
    
    if (userTierIndex < requiredTierIndex) {
      return false
    }
  }

  // Check usage limit
  if (feature.monthly_limit && feature.current_month_usage >= feature.monthly_limit) {
    return false
  }

  return true
}

function getAccessDeniedReason(feature: any, userTier: string): string {
  if (feature.requires_tier && feature.requires_tier !== 'FREE' && userTier === 'FREE') {
    return `This feature requires ${feature.requires_tier} tier`
  }

  if (feature.monthly_limit && feature.current_month_usage >= feature.monthly_limit) {
    return `Monthly limit of ${feature.monthly_limit} reached`
  }

  return 'Access denied'
}