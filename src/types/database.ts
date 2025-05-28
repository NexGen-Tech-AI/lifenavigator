/**
 * Database type definitions for LifeNavigator
 * These types match the Prisma schema and are used throughout the application
 */

import { 
  UserRole, 
  SubscriptionTier, 
  SubscriptionStatus,
  AccountType,
  DataSource,
  DocumentType,
  ProcessingStatus,
  BudgetPeriod,
  GoalType,
  GoalPriority,
  InsightType,
  RecurringFrequency,
  NotificationType,
  ExportFormat,
  ExportStatus,
  AuditEventType,
  MfaMethod
} from '@prisma/client';

// Re-export enums for convenience
export {
  UserRole,
  SubscriptionTier,
  SubscriptionStatus,
  AccountType,
  DataSource,
  DocumentType,
  ProcessingStatus,
  BudgetPeriod,
  GoalType,
  GoalPriority,
  InsightType,
  RecurringFrequency,
  NotificationType,
  ExportFormat,
  ExportStatus,
  AuditEventType,
  MfaMethod
};

// ==================== USER & AUTH TYPES ====================

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: Date | null;
  isPilotMember: boolean;
  pilotDiscount: number | null;
  referralCode: string | null;
  referredBy: string | null;
  isDemoAccount: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends User {
  financialAccounts: FinancialAccount[];
  stripeCustomer: StripeCustomer | null;
  waitlistEntry: WaitlistEntry | null;
}

// ==================== FINANCIAL ACCOUNT TYPES ====================

export interface FinancialAccount {
  id: string;
  userId: string;
  accountName: string;
  accountType: AccountType;
  institutionName: string;
  institutionId: string | null;
  accountNumber: string | null;
  routingNumber: string | null;
  currentBalance: number;
  availableBalance: number | null;
  creditLimit: number | null;
  minimumPayment: number | null;
  apr: number | null;
  dataSource: DataSource;
  plaidItemId: string | null;
  plaidAccountId: string | null;
  isActive: boolean;
  isHidden: boolean;
  lastSynced: Date | null;
  syncError: string | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialAccountWithTransactions extends FinancialAccount {
  transactions: Transaction[];
  _count: {
    transactions: number;
  };
}

// ==================== TRANSACTION TYPES ====================

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  transactionDate: Date;
  postDate: Date | null;
  amount: number;
  description: string;
  originalDescription: string | null;
  categoryId: string | null;
  subcategory: string | null;
  merchantId: string | null;
  dataSource: DataSource;
  plaidTransactionId: string | null;
  documentId: string | null;
  isPending: boolean;
  isRecurring: boolean;
  recurringTransactionId: string | null;
  notes: string | null;
  tags: string[];
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithRelations extends Transaction {
  account: FinancialAccount;
  category: Category | null;
  merchant: Merchant | null;
  document: Document | null;
}

// ==================== CATEGORY & MERCHANT TYPES ====================

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  parentId: string | null;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
}

export interface CategoryWithHierarchy extends Category {
  parent: Category | null;
  children: Category[];
}

export interface Merchant {
  id: string;
  userId: string | null;
  name: string;
  displayName: string | null;
  categoryId: string | null;
  logo: string | null;
  website: string | null;
  isVerified: boolean;
}

// ==================== DOCUMENT TYPES ====================

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  storageKey: string;
  documentType: DocumentType;
  uploadedAt: Date;
  processingStatus: ProcessingStatus;
  processedAt: Date | null;
  processingError: string | null;
  extractedData: any | null;
  confidence: number | null;
  pageCount: number | null;
  parsedAccounts: any | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== BUDGET & GOAL TYPES ====================

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  categoryId: string | null;
  accountId: string | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  currentSpent: number;
  lastCalculated: Date | null;
  alertEnabled: boolean;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetWithRelations extends Budget {
  category: Category | null;
  account: FinancialAccount | null;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  goalType: GoalType;
  priority: GoalPriority;
  accountId: string | null;
  isCompleted: boolean;
  completedAt: Date | null;
  lastCalculated: Date | null;
  milestones: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalWithAccount extends Goal {
  account: FinancialAccount | null;
}

// ==================== INSIGHT TYPES ====================

export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  category: string;
  title: string;
  description: string;
  aiGenerated: boolean;
  confidence: number | null;
  relatedData: any | null;
  isRead: boolean;
  isDismissed: boolean;
  isActionable: boolean;
  actionUrl: string | null;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PLAID TYPES ====================

export interface PlaidItem {
  id: string;
  userId: string;
  accessToken: string; // Encrypted in DB
  itemId: string;
  institutionId: string;
  institutionName: string;
  isActive: boolean;
  lastSuccessfulSync: Date | null;
  lastSyncError: string | null;
  webhookUrl: string | null;
  consentExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaidWebhookEvent {
  id: string;
  plaidItemId: string;
  webhookType: string;
  webhookCode: string;
  itemId: string;
  error: any | null;
  newTransactions: number | null;
  removedTransactions: string[];
  processed: boolean;
  createdAt: Date;
}

// ==================== SUBSCRIPTION TYPES ====================

export interface StripeCustomer {
  id: string;
  userId: string;
  stripeCustomerId: string;
  subscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  defaultPaymentMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  userId: string | null;
  position: number;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  signedUpAt: Date | null;
  convertedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any | null;
  isRead: boolean;
  readAt: Date | null;
  channels: string[];
  emailSent: boolean;
  pushSent: boolean;
  createdAt: Date;
}

// ==================== SNAPSHOT TYPES ====================

export interface FinancialSnapshot {
  id: string;
  userId: string;
  snapshotDate: Date;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  accountBalances: any;
  categorySpending: any;
  createdAt: Date;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ==================== FORM INPUT TYPES ====================

export interface CreateAccountInput {
  accountName: string;
  accountType: AccountType;
  institutionName: string;
  currentBalance: number;
  availableBalance?: number;
  creditLimit?: number;
  apr?: number;
  accountNumber?: string; // Last 4 digits only
}

export interface CreateTransactionInput {
  accountId: string;
  transactionDate: Date;
  amount: number;
  description: string;
  categoryId?: string;
  merchantId?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateBudgetInput {
  name: string;
  amount: number;
  period: BudgetPeriod;
  categoryId?: string;
  accountId?: string;
  startDate: Date;
  endDate?: Date;
  alertEnabled?: boolean;
  alertThreshold?: number;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: Date;
  goalType: GoalType;
  priority?: GoalPriority;
  accountId?: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardData {
  user: User;
  accounts: FinancialAccountWithTransactions[];
  recentTransactions: TransactionWithRelations[];
  budgets: BudgetWithRelations[];
  goals: GoalWithAccount[];
  insights: Insight[];
  snapshot: FinancialSnapshot | null;
  notifications: Notification[];
}

export interface AccountsSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  accountsByType: {
    type: AccountType;
    count: number;
    totalBalance: number;
  }[];
}

export interface SpendingAnalysis {
  totalSpent: number;
  spendingByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  spendingTrend: {
    date: string;
    amount: number;
  }[];
}

// ==================== INTEGRATION TYPES ====================

export interface PlaidLinkTokenRequest {
  userId: string;
  products?: string[];
  countryCodes?: string[];
  language?: string;
}

export interface PlaidLinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface PlaidExchangeTokenRequest {
  publicToken: string;
  userId: string;
}

export interface DocumentUploadRequest {
  userId: string;
  documentType: DocumentType;
  file: File;
}

export interface DocumentParsingResult {
  accounts?: {
    accountName: string;
    accountNumber: string;
    balance: number;
  }[];
  transactions?: {
    date: string;
    description: string;
    amount: number;
    balance?: number;
  }[];
  confidence: number;
}