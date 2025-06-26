'use client'

import { createContext, useContext } from 'react'

type SupabaseContext = {
  user: any | null
  userProfile: any | null
  loading: boolean
}

const Context = createContext<SupabaseContext>({
  user: null,
  userProfile: null,
  loading: false,
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // For demo deployment - no Supabase needed
  return (
    <Context.Provider value={{ user: null, userProfile: null, loading: false }}>
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