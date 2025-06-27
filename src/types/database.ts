/**
 * Database types for the comprehensive schema
 * This extends the auto-generated Supabase types with our custom types
 */

import type { Database } from './supabase'

// Export the database types for easier access
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// User types
export type User = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

// Financial types
export type FinancialAccount = Tables['financial_accounts']['Row']
export type FinancialAccountInsert = Tables['financial_accounts']['Insert']
export type FinancialAccountUpdate = Tables['financial_accounts']['Update']

export type Transaction = Tables['transactions']['Row']
export type TransactionInsert = Tables['transactions']['Insert']
export type TransactionUpdate = Tables['transactions']['Update']

// Document types
export type Document = Tables['documents']['Row']
export type DocumentInsert = Tables['documents']['Insert']
export type DocumentUpdate = Tables['documents']['Update']

// Health types
export type HealthRecord = Tables['health_records']['Row']
export type HealthRecordInsert = Tables['health_records']['Insert']
export type HealthRecordUpdate = Tables['health_records']['Update']

// Career types
export type CareerProfile = Tables['career_profiles']['Row']
export type CareerProfileInsert = Tables['career_profiles']['Insert']
export type CareerProfileUpdate = Tables['career_profiles']['Update']

// Integration types
export type Integration = Tables['integrations']['Row']
export type IntegrationInsert = Tables['integrations']['Insert']
export type IntegrationUpdate = Tables['integrations']['Update']

// Audit types
export type AuditLog = Tables['audit_logs']['Row']
export type AuditLogInsert = Tables['audit_logs']['Insert']

// Enum types
export type SubscriptionTier = 'FREE' | 'PRO' | 'AI_AGENT' | 'FAMILY'
export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'LOAN' | 'MORTGAGE' | 'INVESTMENT' | 'RETIREMENT' | 'CRYPTO' | 'OTHER'
export type TransactionCategory = 'INCOME' | 'HOUSING' | 'TRANSPORTATION' | 'FOOD' | 'UTILITIES' | 'INSURANCE' | 'HEALTHCARE' | 'PERSONAL' | 'ENTERTAINMENT' | 'EDUCATION' | 'SHOPPING' | 'INVESTMENT' | 'OTHER'
export type DocumentType = 'TAX_RETURN' | 'W2' | '1099' | 'BANK_STATEMENT' | 'INVESTMENT_STATEMENT' | 'INSURANCE_POLICY' | 'MEDICAL_RECORD' | 'RECEIPT' | 'CONTRACT' | 'OTHER'
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REQUIRES_REVIEW'
export type HealthRecordType = 'APPOINTMENT' | 'LAB_RESULT' | 'PRESCRIPTION' | 'VACCINATION' | 'PROCEDURE' | 'DIAGNOSIS' | 'INSURANCE_CLAIM' | 'OTHER'
export type CareerStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED'

// Financial summary type
export interface AccountsSummary {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

// Input types for API
export type CreateAccountInput = FinancialAccountInsert
export type CreateTransactionInput = TransactionInsert

// Helper types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    shareDataForInsights: boolean
    allowAnonymousAnalytics: boolean
  }
}

export interface EncryptedField<T = string> {
  encrypted: string
  keyId: string
  algorithm: string
  _decrypted?: T // Only available after decryption
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Plaid specific types
export interface PlaidTokenExchange {
  publicToken: string
  accountId?: string
  metadata?: {
    institution: {
      name: string
      institutionId: string
    }
    accounts: Array<{
      id: string
      name: string
      mask: string
      type: string
      subtype: string
    }>
  }
}

// Document processing types
export interface DocumentMetadata {
  fileName: string
  fileType: string
  fileSize: number
  pageCount?: number
  extractedText?: string
  confidence?: number
  parsedData?: {
    dates?: string[]
    amounts?: number[]
    accounts?: string[]
    categories?: string[]
  }
}

// Health data types (for encrypted storage)
export interface HealthDetails {
  symptoms?: string[]
  medications?: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    weight?: number
    temperature?: number
  }
  notes?: string
}

// Career data types
export interface Education {
  degree: string
  field: string
  institution: string
  startDate: string
  endDate?: string
  gpa?: number
}

export interface Certification {
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  url?: string
}

// Integration status types
export type IntegrationProvider = 'plaid' | 'google' | 'stripe' | 'coinbase' | 'robinhood' | 'mint'

export interface IntegrationStatus {
  provider: IntegrationProvider
  isActive: boolean
  lastSync?: string
  error?: string
  accountCount?: number
}