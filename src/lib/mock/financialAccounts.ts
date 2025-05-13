import { AccountGroup, FinancialAccount, Asset, EnhancedTransaction } from '@/types/financial';

export const mockAccounts: FinancialAccount[] = [
  // Bank accounts
  {
    id: 'acc_1',
    userId: 'user_1',
    name: 'Checking Account',
    type: 'bank',
    subtype: 'checking',
    institution: {
      id: 'inst_1',
      name: 'Chase Bank',
      logo: '/images/banks/chase.svg',
    },
    balance: 5243.87,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••4567',
    isPrimary: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_2',
    userId: 'user_1',
    name: 'Savings Account',
    type: 'bank',
    subtype: 'savings',
    institution: {
      id: 'inst_1',
      name: 'Chase Bank',
      logo: '/images/banks/chase.svg',
    },
    balance: 12750.42,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••7890',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_3',
    userId: 'user_1',
    name: 'Emergency Fund',
    type: 'bank',
    subtype: 'savings',
    institution: {
      id: 'inst_2',
      name: 'Bank of America',
      logo: '/images/banks/bofa.svg',
    },
    balance: 25000.00,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••2345',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Credit cards
  {
    id: 'acc_4',
    userId: 'user_1',
    name: 'Platinum Card',
    type: 'credit',
    institution: {
      id: 'inst_3',
      name: 'American Express',
      logo: '/images/banks/amex.svg',
    },
    balance: -1250.84,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••1005',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_5',
    userId: 'user_1',
    name: 'Cash Rewards Card',
    type: 'credit',
    institution: {
      id: 'inst_2',
      name: 'Bank of America',
      logo: '/images/banks/bofa.svg',
    },
    balance: -3420.56,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••4332',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Investment accounts
  {
    id: 'acc_6',
    userId: 'user_1',
    name: 'Brokerage Account',
    type: 'investment',
    institution: {
      id: 'inst_4',
      name: 'Fidelity',
      logo: '/images/banks/fidelity.svg',
    },
    balance: 68240.92,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••7812',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_7',
    userId: 'user_1',
    name: 'Robo-advisor Portfolio',
    type: 'investment',
    institution: {
      id: 'inst_5',
      name: 'Betterment',
      logo: '/images/banks/betterment.svg',
    },
    balance: 42315.28,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••9045',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Retirement accounts
  {
    id: 'acc_8',
    userId: 'user_1',
    name: '401(k)',
    type: 'retirement',
    institution: {
      id: 'inst_4',
      name: 'Fidelity',
      logo: '/images/banks/fidelity.svg',
    },
    balance: 187500.34,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••4478',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_9',
    userId: 'user_1',
    name: 'Roth IRA',
    type: 'retirement',
    institution: {
      id: 'inst_6',
      name: 'Vanguard',
      logo: '/images/banks/vanguard.svg',
    },
    balance: 43280.15,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••3325',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Loan accounts
  {
    id: 'acc_10',
    userId: 'user_1',
    name: 'Mortgage',
    type: 'loan',
    subtype: 'mortgage',
    institution: {
      id: 'inst_7',
      name: 'Wells Fargo',
      logo: '/images/banks/wells-fargo.svg',
    },
    balance: -320450.72,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••9954',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_11',
    userId: 'user_1',
    name: 'Auto Loan',
    type: 'loan',
    subtype: 'auto',
    institution: {
      id: 'inst_2',
      name: 'Bank of America',
      logo: '/images/banks/bofa.svg',
    },
    balance: -18420.33,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••1187',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'acc_12',
    userId: 'user_1',
    name: 'Student Loan',
    type: 'loan',
    subtype: 'student',
    institution: {
      id: 'inst_8',
      name: 'Nelnet',
      logo: '/images/banks/nelnet.svg',
    },
    balance: -25340.88,
    currency: 'USD',
    lastUpdated: new Date(),
    maskedAccountNumber: '••••6653',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  
  // Crypto accounts
  {
    id: 'acc_13',
    userId: 'user_1',
    name: 'Crypto Wallet',
    type: 'crypto',
    institution: {
      id: 'inst_9',
      name: 'Coinbase',
      logo: '/images/banks/coinbase.svg',
    },
    balance: 8752.61,
    currency: 'USD',
    lastUpdated: new Date(),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getAccountsByType = (accounts: FinancialAccount[], type: string) => {
  return accounts.filter(account => account.type === type);
};

export const getAccountsByInstitution = (accounts: FinancialAccount[]): AccountGroup[] => {
  const groups: {[key: string]: AccountGroup} = {};
  
  accounts.forEach(account => {
    const institutionId = account.institution.id;
    
    if (!groups[institutionId]) {
      groups[institutionId] = {
        institution: account.institution,
        accounts: []
      };
    }
    
    groups[institutionId].accounts.push(account);
  });
  
  return Object.values(groups);
};

export const getNetWorth = (accounts: FinancialAccount[]): number => {
  return accounts.reduce((total, account) => total + account.balance, 0);
};

// Mock Assets
export const mockAssets: Asset[] = [
  {
    id: 'asset_1',
    userId: 'user_1',
    name: 'Primary Residence',
    type: 'real_estate',
    value: 450000,
    currency: 'USD',
    purchaseDate: new Date('2018-04-15'),
    purchasePrice: 380000,
    appreciationRate: 4.3,
    location: '123 Main St, Anytown, USA',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'asset_2',
    userId: 'user_1',
    name: 'Rental Property',
    type: 'real_estate',
    value: 325000,
    currency: 'USD',
    purchaseDate: new Date('2020-08-10'),
    purchasePrice: 290000,
    appreciationRate: 3.8,
    location: '456 Oak St, Somewhere, USA',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'asset_3',
    userId: 'user_1',
    name: 'Tesla Model 3',
    type: 'vehicle',
    value: 38000,
    currency: 'USD',
    purchaseDate: new Date('2021-06-22'),
    purchasePrice: 49000,
    details: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2021,
      color: 'Red',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'asset_4',
    userId: 'user_1',
    name: 'Art Collection',
    type: 'collectible',
    value: 25000,
    currency: 'USD',
    details: {
      items: 12,
      insurance: true,
      primaryArtist: 'Various modern artists',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'asset_5',
    userId: 'user_1',
    name: 'Small Business',
    type: 'business',
    value: 150000,
    currency: 'USD',
    details: {
      businessName: 'Tech Solutions LLC',
      ownership: '100%',
      industry: 'Technology Consulting',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Transactions
export const mockTransactions: EnhancedTransaction[] = [
  {
    id: 'tx_1',
    accountId: 'acc_1',
    date: new Date('2023-05-01'),
    description: 'Salary Deposit',
    category: 'Income',
    amount: 4200.00,
    currency: 'USD',
    isIncome: true,
    isPending: false,
    merchant: {
      name: 'ACME Corp',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_2',
    accountId: 'acc_1',
    date: new Date('2023-05-03'),
    description: 'Grocery Store',
    category: 'Food & Dining',
    amount: 82.47,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Whole Foods',
      logo: '/images/merchants/wholefoods.svg',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_3',
    accountId: 'acc_4',
    date: new Date('2023-05-02'),
    description: 'Dinner with friends',
    category: 'Food & Dining',
    amount: 78.12,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Olive Garden',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_4',
    accountId: 'acc_1',
    date: new Date('2023-05-05'),
    description: 'Monthly Netflix subscription',
    category: 'Entertainment',
    amount: 15.99,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Netflix',
      logo: '/images/merchants/netflix.svg',
    },
    tags: ['subscription'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_5',
    accountId: 'acc_1',
    date: new Date('2023-05-10'),
    description: 'Gas station fill-up',
    category: 'Transportation',
    amount: 58.23,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Shell',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_6',
    accountId: 'acc_5',
    date: new Date('2023-05-08'),
    description: 'Amazon purchase',
    category: 'Shopping',
    amount: 142.56,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Amazon',
      logo: '/images/merchants/amazon.svg',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_7',
    accountId: 'acc_1',
    date: new Date('2023-05-15'),
    description: 'Mortgage payment',
    category: 'Housing',
    amount: 1850.00,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Wells Fargo',
    },
    tags: ['housing', 'recurring'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_8',
    accountId: 'acc_2',
    date: new Date('2023-05-01'),
    description: 'Transfer to savings',
    category: 'Transfer',
    amount: 500.00,
    currency: 'USD',
    isIncome: true,
    isPending: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_9',
    accountId: 'acc_4',
    date: new Date('2023-05-12'),
    description: 'Electronics purchase',
    category: 'Shopping',
    amount: 349.99,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'Best Buy',
      logo: '/images/merchants/bestbuy.svg',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tx_10',
    accountId: 'acc_1',
    date: new Date('2023-05-20'),
    description: 'Utility bill payment',
    category: 'Utilities',
    amount: 145.32,
    currency: 'USD',
    isIncome: false,
    isPending: false,
    merchant: {
      name: 'City Power & Water',
    },
    tags: ['utilities', 'recurring'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getTransactionsByAccount = (transactions: EnhancedTransaction[], accountId: string) => {
  return transactions.filter(transaction => transaction.accountId === accountId);
};

export const getTransactionsByDateRange = (
  transactions: EnhancedTransaction[], 
  startDate: Date, 
  endDate: Date
) => {
  return transactions.filter(transaction => {
    const txDate = new Date(transaction.date);
    return txDate >= startDate && txDate <= endDate;
  });
};