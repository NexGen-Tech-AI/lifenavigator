'use client'

import React, { createContext, useContext } from 'react'
import { DEMO_USER, DEMO_FINANCIAL_PROFILE } from '@/lib/demo/demo-data'

interface DemoContextType {
  isDemoMode: boolean
  demoUser: typeof DEMO_USER
  demoProfile: typeof DEMO_FINANCIAL_PROFILE
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoUser: DEMO_USER,
  demoProfile: DEMO_FINANCIAL_PROFILE
})

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  
  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        demoUser: DEMO_USER,
        demoProfile: DEMO_FINANCIAL_PROFILE
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  return useContext(DemoContext)
}