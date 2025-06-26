'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser-client'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type SupabaseContext = {
  user: User | null
  userProfile: Database['public']['Tables']['profiles']['Row'] | null
  loading: boolean
}

const Context = createContext<SupabaseContext>({
  user: null,
  userProfile: null,
  loading: true,
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Check if we're in demo mode
  const isDemoMode = typeof window !== 'undefined' && (
    window.location.hostname.includes('demo') ||
    window.location.hostname.includes('mrxm1q5s5') ||
    window.location.search.includes('demo=true') ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  )
  
  // In demo mode, don't initialize Supabase
  if (isDemoMode) {
    return (
      <Context.Provider value={{ user: null, userProfile: null, loading: false }}>
        {children}
      </Context.Provider>
    )
  }
  
  let supabase: any = null
  try {
    supabase = createBrowserClient()
  } catch (err: any) {
    console.error('Failed to create Supabase client:', err)
    setError(err.message)
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const authSubscription = supabase?.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      authSubscription?.data?.subscription?.unsubscribe()
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Supabase initialization error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Context.Provider value={{ user, userProfile, loading }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}