// HIPAA Compliance Configuration
// Implements all required safeguards for PHI protection

export const HIPAAConfig = {
  // Administrative Safeguards
  administrative: {
    // Security Officer
    securityOfficer: {
      name: 'Security Team',
      email: 'security@lifenavigator.ai',
      responsibilities: [
        'Develop and implement security policies',
        'Conduct risk assessments',
        'Manage security incidents',
        'Oversee training programs'
      ]
    },
    
    // Workforce Training
    training: {
      required: true,
      frequency: 'annual',
      topics: [
        'PHI handling procedures',
        'Password management',
        'Incident reporting',
        'Physical security',
        'Email security'
      ]
    },
    
    // Access Management
    accessControl: {
      minimumPasswordLength: 12,
      passwordComplexity: {
        uppercase: true,
        lowercase: true,
        numbers: true,
        special: true
      },
      mfaRequired: true,
      sessionTimeout: 900000, // 15 minutes
      maxLoginAttempts: 5,
      accountLockoutDuration: 1800000, // 30 minutes
    },
    
    // Audit Controls
    auditControls: {
      logAllAccess: true,
      logRetentionYears: 6,
      regularReviews: 'monthly',
      integrityChecks: true
    }
  },
  
  // Physical Safeguards
  physical: {
    facilityAccess: {
      badgeRequired: true,
      visitorEscort: true,
      securityCameras: true
    },
    workstationUse: {
      automaticLogoff: true,
      screenLock: true,
      clearDeskPolicy: true
    },
    deviceControls: {
      encryption: true,
      remoteWipe: true,
      inventoryTracking: true
    }
  },
  
  // Technical Safeguards
  technical: {
    accessControl: {
      uniqueUserIdentification: true,
      automaticLogoff: 900000, // 15 minutes
      encryptionInTransit: 'TLS 1.3',
      encryptionAtRest: 'AES-256-GCM'
    },
    auditLogs: {
      enabled: true,
      includePHIAccess: true,
      tamperResistant: true,
      regularReview: true
    },
    integrity: {
      electronicSignatures: true,
      dataBackups: true,
      disasterRecovery: true,
      businessContinuity: true
    },
    transmission: {
      encryptionRequired: true,
      secureMessaging: true,
      vpnRequired: true
    }
  },
  
  // Organizational Requirements
  organizational: {
    businessAssociates: {
      agreementsRequired: true,
      securityReview: true,
      ongoingMonitoring: true
    },
    policies: {
      written: true,
      reviewed: 'annually',
      incidentResponse: true,
      breachNotification: true
    }
  },
  
  // Breach Notification Requirements
  breachNotification: {
    individualNotice: {
      timeline: '60 days',
      method: ['email', 'mail'],
      content: [
        'Description of breach',
        'Types of information involved',
        'Steps individuals should take',
        'What entity is doing',
        'Contact information'
      ]
    },
    mediaNotice: {
      threshold: 500,
      timeline: '60 days',
      jurisdiction: 'state'
    },
    hhsNotice: {
      timeline: '60 days',
      method: 'online portal'
    }
  }
};

// HIPAA Compliance Checklist
export const HIPAAChecklist = {
  administrativeSafeguards: [
    'Conduct risk assessment',
    'Implement security officer',
    'Workforce training program',
    'Access management procedures',
    'Security incident procedures',
    'Business associate agreements',
    'Data backup plan',
    'Disaster recovery plan',
    'Emergency mode operation plan',
    'Testing and revision procedures'
  ],
  
  physicalSafeguards: [
    'Facility access controls',
    'Workstation use policies',
    'Device and media controls',
    'Equipment disposal procedures',
    'Physical access logs'
  ],
  
  technicalSafeguards: [
    'Unique user identification',
    'Automatic logoff',
    'Encryption and decryption',
    'Audit logs and monitoring',
    'Integrity controls',
    'Transmission security',
    'Access control systems'
  ]
};

// PHI Data Classification
export const PHIDataTypes = {
  identifiers: [
    'name',
    'address',
    'birthDate',
    'phoneNumber',
    'email',
    'ssn',
    'medicalRecordNumber',
    'healthPlanNumber',
    'accountNumber',
    'licenseNumber',
    'vehicleIdentifier',
    'deviceIdentifier',
    'webUrl',
    'ipAddress',
    'biometricIdentifier',
    'photograph',
    'uniqueIdentifier'
  ],
  
  healthInformation: [
    'diagnosis',
    'treatment',
    'medication',
    'labResults',
    'procedures',
    'allergies',
    'immunizations',
    'vitalSigns',
    'medicalHistory',
    'insuranceInfo'
  ]
};

// Encryption requirements for PHI
export const PHIEncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyRotation: 90, // days
  keyDerivation: 'PBKDF2',
  iterations: 100000,
  saltLength: 64,
  tagLength: 16,
  ivLength: 16
};