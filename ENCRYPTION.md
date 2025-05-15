# Field-Level Encryption Guide

This document outlines the field-level encryption implementation in the LifeNavigator application. Field-level encryption is used to protect sensitive data stored in the database.

## Overview

LifeNavigator implements field-level encryption using AES-256-GCM, a strong encryption algorithm that provides both confidentiality and data integrity. The encryption is implemented at two levels:

1. **Prisma Middleware** - Automatically encrypts/decrypts sensitive fields when reading from or writing to the database
2. **Service Layer** - Manual encryption/decryption for models not going through Prisma or when Prisma middleware is disabled

## Key Concepts

### Encryption Algorithm

- **AES-256-GCM** (Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode)
- Provides authenticated encryption with additional authenticated data (AEAD)
- Uses a unique Initialization Vector (IV) for each encryption operation
- Includes an authentication tag to verify data integrity

### Key Management

- **Master Key**: A root key used to derive or encrypt other keys
- **Salt**: Used in key derivation to protect against rainbow table attacks
- **Envelope Encryption**: For some operations, data is encrypted with a Data Encryption Key (DEK), which is itself encrypted with the Master Key

### Context Binding

- Each encrypted field includes the model name and field name as Additional Authenticated Data (AAD)
- This prevents encrypted data from being moved from one field/model to another

## Setup

1. Set the following environment variables:

```
ENCRYPTION_MASTER_KEY=your-master-key-for-field-level-encryption-at-least-32-chars
ENCRYPTION_SALT=your-salt-for-key-derivation
ENABLE_FIELD_ENCRYPTION=true
```

## Encrypted Models and Fields

The following models and fields are encrypted:

### Prisma Models
- **User**: `metadata`
- **Account**: `refresh_token`, `access_token`, `id_token`, `session_state`
- **IntegrationToken**: `accessToken`, `refreshToken`, `scopes`
- **CareerRecord**: `salaryRange`
- **EmailConnection**: `credentials`
- **EmailMessage**: `subject`, `body`, `htmlBody`, `to`, `cc`, `bcc`
- **HealthRecord**: `bloodType`, `allergies`, `medications`
- **TaxProfile**: `w4`, `income`, `deductions`, `credits`
- **SecureDocument**: Custom encryption handling

### TypeScript Models
- **VitalSign**: `value`, `notes`
- **MedicalAppointment**: `reason`, `notes`
- **FinancialAccount**: `accountNumber`, `maskedAccountNumber`
- **Health Data**: All medical measurements
- **Tax Data**: All financial and tax-related information

## Implementation Details

### Prisma Middleware

The middleware is implemented in `src/lib/encryption/prisma-middleware.ts`. It intercepts Prisma operations to:

1. Encrypt sensitive fields before writing to the database
2. Decrypt sensitive fields after reading from the database

```typescript
// Enable middleware
if (process.env.ENABLE_FIELD_ENCRYPTION === 'true') {
  applyEncryptionMiddleware(prisma);
}
```

### Model Encryption Utilities

For TypeScript models or when middleware is disabled, use the utilities in `src/lib/encryption/model-encryption.ts`:

```typescript
// Encrypt fields in an object
const encryptedData = encryptObjectFields(data, 'ModelName', ['sensitiveField1', 'sensitiveField2']);

// Decrypt fields in an object
const decryptedData = decryptObjectFields(data, 'ModelName', ['sensitiveField1', 'sensitiveField2']);
```

### Core Encryption Utilities

Low-level encryption functions are in `src/lib/encryption/index.ts`:

```typescript
// Encrypt a string
const encrypted = encryptData(plaintext, 'contextString');

// Decrypt a string
const decrypted = decryptData(encryptedData, 'contextString');

// Check if a string is encrypted
const isEncrypted = isEncrypted(data);
```

## Security Considerations

1. **Key Rotation**: Implement a key rotation strategy for long-term protection
2. **Environment Security**: Ensure environment variables are securely stored
3. **Memory Protection**: Sensitive data should be cleared from memory when no longer needed
4. **Backup Security**: Encrypted data in backups remains protected, but master keys must be securely backed up separately
5. **Logging**: Avoid logging decrypted sensitive information

## Testing

When testing with encryption enabled:

1. Set `ENABLE_FIELD_ENCRYPTION=true` in your test environment
2. Set consistent test keys in your test environment variables
3. Verify that data is correctly encrypted in the database
4. Verify that data is correctly decrypted when retrieved

## Performance Considerations

Field-level encryption adds some processing overhead. To minimize impact:

1. Only encrypt truly sensitive fields
2. Use connection pooling with the database
3. Consider caching for frequently accessed encrypted data
4. Monitor performance metrics for encrypted vs non-encrypted operations

---

## Technical Deep-Dive

### Encryption Format

Encrypted data follows this format:
`{iv (16 bytes)}{auth tag (16 bytes)}{ciphertext}`

This is then encoded as a base64 string.

### Encryption Context

Context binding is implemented using Additional Authenticated Data (AAD):
`${modelName}:${fieldName}`

This context is not stored with the encrypted data but must be provided during decryption.

### Key Derivation

The master key is derived using PBKDF2:

```typescript
const key = crypto.pbkdf2Sync(
  masterKeyString,
  process.env.ENCRYPTION_SALT || 'default-salt',
  100000, // iterations
  32, // key length (256 bits)
  'sha256'
);
```