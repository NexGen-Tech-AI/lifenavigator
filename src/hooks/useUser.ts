'use client'

import { DEMO_USER } from '@/lib/demo/demo-data'

export function useUser() {
  // ALWAYS return demo data for demo deployment
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

export function useAuth() {
  // Demo mode - no real auth needed
  return {
    signOut: async () => {
      window.location.href = '/dashboard'
    },
    updateProfile: async () => {
      // No-op in demo mode
    }
  }
}