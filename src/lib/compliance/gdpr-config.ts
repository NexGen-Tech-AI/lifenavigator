// GDPR Compliance Configuration
// Implements all requirements for personal data protection

export const GDPRConfig = {
  // Lawful Basis for Processing
  lawfulBasis: {
    consent: {
      required: true,
      explicit: true,
      granular: true,
      withdrawable: true,
      ageVerification: 16
    },
    legitimateInterests: {
      documented: true,
      balancingTest: true,
      optOut: true
    },
    contract: {
      necessary: true,
      documented: true
    }
  },
  
  // Data Subject Rights
  dataSubjectRights: {
    // Right to Access
    access: {
      enabled: true,
      responseTime: '30 days',
      format: ['PDF', 'JSON', 'CSV'],
      verification: true,
      free: true
    },
    
    // Right to Rectification
    rectification: {
      enabled: true,
      userEditable: true,
      auditTrail: true
    },
    
    // Right to Erasure (Right to be Forgotten)
    erasure: {
      enabled: true,
      responseTime: '30 days',
      exceptions: ['legal', 'legitimate'],
      confirmation: true
    },
    
    // Right to Data Portability
    portability: {
      enabled: true,
      formats: ['JSON', 'CSV', 'XML'],
      machineReadable: true,
      directTransfer: true
    },
    
    // Right to Object
    objection: {
      enabled: true,
      marketing: true,
      profiling: true,
      automated: true
    },
    
    // Right to Restrict Processing
    restriction: {
      enabled: true,
      reasons: ['accuracy', 'unlawful', 'legal', 'objection'],
      notification: true
    }
  },
  
  // Privacy by Design
  privacyByDesign: {
    dataMinimization: true,
    purposeLimitation: true,
    defaultPrivacy: true,
    endToEndSecurity: true,
    transparencyDefault: true,
    userControl: true,
    proactiveCompliance: true
  },
  
  // Data Protection
  dataProtection: {
    encryption: {
      atRest: 'AES-256-GCM',
      inTransit: 'TLS 1.3',
      keyManagement: 'HSM'
    },
    pseudonymization: true,
    anonymization: {
      techniques: ['hashing', 'tokenization', 'aggregation'],
      irreversible: true
    },
    accessControls: {
      rbac: true,
      needToKnow: true,
      logging: true
    }
  },
  
  // Consent Management
  consentManagement: {
    types: [
      'dataProcessing',
      'marketing',
      'cookies',
      'profiling',
      'thirdPartySharing'
    ],
    requirements: {
      clear: true,
      specific: true,
      informed: true,
      unambiguous: true,
      affirmative: true
    },
    withdrawal: {
      easy: true,
      immediate: true,
      consequences: true
    },
    records: {
      who: true,
      when: true,
      what: true,
      how: true,
      version: true
    }
  },
  
  // Data Breach Notification
  breachNotification: {
    supervisoryAuthority: {
      timeline: '72 hours',
      unduedelay: true,
      content: [
        'Nature of breach',
        'Categories of data',
        'Approximate number affected',
        'Consequences',
        'Measures taken',
        'DPO contact'
      ]
    },
    dataSubjects: {
      highRisk: true,
      timeline: 'without undue delay',
      clearLanguage: true,
      content: [
        'DPO contact',
        'Likely consequences',
        'Measures taken',
        'Recommendations'
      ]
    }
  },
  
  // International Transfers
  internationalTransfers: {
    mechanisms: [
      'adequacy',
      'SCCs',
      'BCRs',
      'certification'
    ],
    safeguards: true,
    assessment: true,
    documentation: true
  },
  
  // Record Keeping
  recordKeeping: {
    processingActivities: {
      controller: true,
      processor: true,
      details: [
        'purposes',
        'categories',
        'recipients',
        'transfers',
        'retention',
        'security'
      ]
    },
    retention: {
      defined: true,
      justified: true,
      automated: true,
      review: 'annual'
    }
  },
  
  // Data Protection Officer
  dpo: {
    required: true,
    contact: 'dpo@lifenavigator.ai',
    independent: true,
    resourced: true,
    accessible: true
  },
  
  // Privacy Impact Assessment
  dpia: {
    required: ['highRisk', 'largescale', 'systematic'],
    methodology: true,
    consultation: true,
    review: 'regular'
  }
};

// GDPR Data Categories
export const GDPRDataCategories = {
  personal: [
    'name',
    'email',
    'phone',
    'address',
    'dateOfBirth',
    'gender',
    'nationality'
  ],
  
  special: [
    'racial',
    'ethnic',
    'political',
    'religious',
    'philosophical',
    'tradeUnion',
    'genetic',
    'biometric',
    'health',
    'sexLife',
    'sexualOrientation'
  ],
  
  criminal: [
    'offenses',
    'convictions',
    'securityMeasures'
  ],
  
  financial: [
    'bankAccount',
    'creditCard',
    'income',
    'tax',
    'debt',
    'transactions'
  ]
};

// GDPR Compliance Checklist
export const GDPRChecklist = {
  governance: [
    'Appoint DPO',
    'Create privacy team',
    'Document processing',
    'Conduct DPIA',
    'Implement policies'
  ],
  
  rights: [
    'Access mechanism',
    'Rectification process',
    'Erasure procedure',
    'Portability tools',
    'Objection handling',
    'Restriction capability'
  ],
  
  consent: [
    'Consent forms',
    'Withdrawal mechanism',
    'Consent records',
    'Age verification',
    'Granular options'
  ],
  
  security: [
    'Encryption implemented',
    'Access controls',
    'Incident response',
    'Breach notification',
    'Regular testing'
  ],
  
  transparency: [
    'Privacy policy',
    'Cookie policy',
    'Processing notices',
    'Third-party disclosure',
    'Contact information'
  ]
};