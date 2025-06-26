'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { DEMO_USER } from '@/lib/demo/demo-data'

export function useUser() {
  // Check if we're in demo mode - multiple detection methods
  const isDemoMode = typeof window !== 'undefined' && (
    window.location.hostname.includes('demo') ||
    window.location.hostname.includes('mrxm1q5s5') ||
    window.location.search.includes('demo=true') ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  )
  
  // In demo mode, return mock user data
  if (isDemoMode) {
    return {
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        user_metadata: {
          name: DEMO_USER.name,
          avatar_url: null
        }
      },
      profile: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        is_demo_account: true,
        subscription_tier: 'PRO',
        onboarding_completed: true
      },
      loading: false,
      isAuthenticated: true,
      isDemoAccount: true,
      subscriptionTier: 'PRO',
      onboardingCompleted: true
    }
  }
  
  const { user, userProfile, loading } = useSupabase()
  const supabase = createClient()
  
  // Fetch additional user data if needed
  const { data: extendedProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user?.id && !userProfile
  })
  
  return {
    user: user,
    profile: userProfile || extendedProfile,
    loading: loading || profileLoading,
    isAuthenticated: !!user,
    isDemoAccount: userProfile?.is_demo_account || false,
    subscriptionTier: userProfile?.subscription_tier || 'FREE',
    onboardingCompleted: userProfile?.onboarding_completed || false
  }
}

export function useAuth() {
  const supabase = createClient()
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    window.location.href = '/auth/login'
  }
  
  const updateProfile = async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
    
    if (error) throw error
  }
  
  return {
    signOut,
    updateProfile
  }
}