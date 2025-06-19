export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          subscription_tier: 'FREE' | 'PRO' | 'AI_AGENT' | 'FAMILY'
          subscription_expires_at: string | null
          is_demo_account: boolean
          onboarding_completed: boolean
          mfa_enabled: boolean
          mfa_secret: string | null
          password_changed_at: string
          failed_login_attempts: number
          locked_until: string | null
          preferences: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          subscription_tier?: 'FREE' | 'PRO' | 'AI_AGENT' | 'FAMILY'
          subscription_expires_at?: string | null
          is_demo_account?: boolean
          onboarding_completed?: boolean
          mfa_enabled?: boolean
          mfa_secret?: string | null
          password_changed_at?: string
          failed_login_attempts?: number
          locked_until?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          subscription_tier?: 'FREE' | 'PRO' | 'AI_AGENT' | 'FAMILY'
          subscription_expires_at?: string | null
          is_demo_account?: boolean
          onboarding_completed?: boolean
          mfa_enabled?: boolean
          mfa_secret?: string | null
          password_changed_at?: string
          failed_login_attempts?: number
          locked_until?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          deleted_at?: string | null
        }
      }
      financial_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          institution_name: string
          account_type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'LOAN' | 'MORTGAGE' | 'INVESTMENT' | 'RETIREMENT' | 'CRYPTO' | 'OTHER'
          account_number_encrypted: string | null
          routing_number_encrypted: string | null
          plaid_account_id: string | null
          plaid_access_token_encrypted: string | null
          plaid_item_id: string | null
          current_balance: number | null
          available_balance: number | null
          credit_limit: number | null
          last_synced_at: string | null
          is_active: boolean
          is_manual: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_name: string
          account_type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'LOAN' | 'MORTGAGE' | 'OTHER'
          institution_name: string
          institution_id?: string | null
          account_number?: string | null
          routing_number?: string | null
          current_balance: number
          available_balance?: number | null
          credit_limit?: number | null
          minimum_payment?: number | null
          apr?: number | null
          data_source?: 'MANUAL' | 'PLAID' | 'DOCUMENT' | 'CSV_IMPORT'
          plaid_item_id?: string | null
          plaid_account_id?: string | null
          is_active?: boolean
          is_hidden?: boolean
          last_synced?: string | null
          sync_error?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_name?: string
          account_type?: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'LOAN' | 'MORTGAGE' | 'OTHER'
          institution_name?: string
          institution_id?: string | null
          account_number?: string | null
          routing_number?: string | null
          current_balance?: number
          available_balance?: number | null
          credit_limit?: number | null
          minimum_payment?: number | null
          apr?: number | null
          data_source?: 'MANUAL' | 'PLAID' | 'DOCUMENT' | 'CSV_IMPORT'
          plaid_item_id?: string | null
          plaid_account_id?: string | null
          is_active?: boolean
          is_hidden?: boolean
          last_synced?: string | null
          sync_error?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          transaction_date: string
          post_date: string | null
          amount: number
          description: string
          original_description: string | null
          category_id: string | null
          subcategory: string | null
          merchant_id: string | null
          data_source: 'MANUAL' | 'PLAID' | 'DOCUMENT' | 'CSV_IMPORT'
          plaid_transaction_id: string | null
          document_id: string | null
          is_pending: boolean
          is_recurring: boolean
          recurring_transaction_id: string | null
          notes: string | null
          tags: string[]
          location: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          transaction_date: string
          post_date?: string | null
          amount: number
          description: string
          original_description?: string | null
          category_id?: string | null
          subcategory?: string | null
          merchant_id?: string | null
          data_source?: 'MANUAL' | 'PLAID' | 'DOCUMENT' | 'CSV_IMPORT'
          plaid_transaction_id?: string | null
          document_id?: string | null
          is_pending?: boolean
          is_recurring?: boolean
          recurring_transaction_id?: string | null
          notes?: string | null
          tags?: string[]
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          transaction_date?: string
          post_date?: string | null
          amount?: number
          description?: string
          original_description?: string | null
          category_id?: string | null
          subcategory?: string | null
          merchant_id?: string | null
          data_source?: 'MANUAL' | 'PLAID' | 'DOCUMENT' | 'CSV_IMPORT'
          plaid_transaction_id?: string | null
          document_id?: string | null
          is_pending?: boolean
          is_recurring?: boolean
          recurring_transaction_id?: string | null
          notes?: string | null
          tags?: string[]
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      plaid_items: {
        Row: {
          id: string
          user_id: string
          access_token: string
          item_id: string
          institution_id: string
          institution_name: string
          is_active: boolean
          last_successful_sync: string | null
          last_sync_error: string | null
          webhook_url: string | null
          consent_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          item_id: string
          institution_id: string
          institution_name: string
          is_active?: boolean
          last_successful_sync?: string | null
          last_sync_error?: string | null
          webhook_url?: string | null
          consent_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          item_id?: string
          institution_id?: string
          institution_name?: string
          is_active?: boolean
          last_successful_sync?: string | null
          last_sync_error?: string | null
          webhook_url?: string | null
          consent_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          storage_key: string
          document_type: 'BANK_STATEMENT' | 'CREDIT_CARD_STATEMENT' | 'INVESTMENT_STATEMENT' | 'TAX_DOCUMENT' | 'RECEIPT' | 'INVOICE' | 'OTHER'
          uploaded_at: string
          processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW'
          processed_at: string | null
          processing_error: string | null
          extracted_data: Json | null
          confidence: number | null
          page_count: number | null
          parsed_accounts: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: string
          file_size: number
          file_url: string
          storage_key: string
          document_type: 'BANK_STATEMENT' | 'CREDIT_CARD_STATEMENT' | 'INVESTMENT_STATEMENT' | 'TAX_DOCUMENT' | 'RECEIPT' | 'INVOICE' | 'OTHER'
          uploaded_at?: string
          processing_status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW'
          processed_at?: string | null
          processing_error?: string | null
          extracted_data?: Json | null
          confidence?: number | null
          page_count?: number | null
          parsed_accounts?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_url?: string
          storage_key?: string
          document_type?: 'BANK_STATEMENT' | 'CREDIT_CARD_STATEMENT' | 'INVESTMENT_STATEMENT' | 'TAX_DOCUMENT' | 'RECEIPT' | 'INVOICE' | 'OTHER'
          uploaded_at?: string
          processing_status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW'
          processed_at?: string | null
          processing_error?: string | null
          extracted_data?: Json | null
          confidence?: number | null
          page_count?: number | null
          parsed_accounts?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          period: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
          category_id: string | null
          account_id: string | null
          start_date: string
          end_date: string | null
          is_active: boolean
          current_spent: number
          last_calculated: string | null
          alert_enabled: boolean
          alert_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          period: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
          category_id?: string | null
          account_id?: string | null
          start_date: string
          end_date?: string | null
          is_active?: boolean
          current_spent?: number
          last_calculated?: string | null
          alert_enabled?: boolean
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          period?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
          category_id?: string | null
          account_id?: string | null
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          current_spent?: number
          last_calculated?: string | null
          alert_enabled?: boolean
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string
          goal_type: 'SAVINGS' | 'DEBT_PAYOFF' | 'INVESTMENT' | 'PURCHASE' | 'EMERGENCY_FUND' | 'RETIREMENT' | 'OTHER'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          account_id: string | null
          is_completed: boolean
          completed_at: string | null
          last_calculated: string | null
          milestones: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date: string
          goal_type: 'SAVINGS' | 'DEBT_PAYOFF' | 'INVESTMENT' | 'PURCHASE' | 'EMERGENCY_FUND' | 'RETIREMENT' | 'OTHER'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          account_id?: string | null
          is_completed?: boolean
          completed_at?: string | null
          last_calculated?: string | null
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string
          goal_type?: 'SAVINGS' | 'DEBT_PAYOFF' | 'INVESTMENT' | 'PURCHASE' | 'EMERGENCY_FUND' | 'RETIREMENT' | 'OTHER'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          account_id?: string | null
          is_completed?: boolean
          completed_at?: string | null
          last_calculated?: string | null
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}