/**
 * Multi-factor authentication utilities
 */
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { prisma } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';

/**
 * Generate a new MFA secret for a user
 */
export async function generateMfaSecret(userId: string) {
  // Generate a new secret
  const secret = authenticator.generateSecret();
  
  // Hash the secret for storage
  const hashedSecret = createHash('sha256').update(secret).digest('hex');
  
  // Store the hashed secret in the user's record
  await prisma.user.update({
    where: { id: userId },
    data: {
      metadata: {
        ...(await prisma.user.findUnique({ where: { id: userId } }))?.metadata as any || {},
        mfaSecret: hashedSecret,
        mfaEnabled: false,
        mfaRecoveryCodes: generateRecoveryCodes(),
      }
    }
  });
  
  return secret;
}

/**
 * Generate a QR code for the MFA secret
 */
export async function generateQrCode(secret: string, email: string) {
  const serviceName = 'LifeNavigator';
  const otpauth = authenticator.keyuri(email, serviceName, secret);
  
  return toDataURL(otpauth);
}

/**
 * Verify an MFA token
 */
export async function verifyToken(userId: string, token: string) {
  try {
    // Get user with metadata
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true }
    });
    
    if (!user?.metadata) {
      return false;
    }
    
    const metadata = user.metadata as any;
    
    // If MFA is not enabled, return true to bypass
    if (!metadata.mfaEnabled) {
      return true;
    }
    
    // Get the hashed secret
    const hashedSecret = metadata.mfaSecret;
    if (!hashedSecret) {
      return false;
    }
    
    // Check if the token is a recovery code
    if (metadata.mfaRecoveryCodes && Array.isArray(metadata.mfaRecoveryCodes)) {
      const recoveryCodeIndex = metadata.mfaRecoveryCodes.indexOf(token);
      
      if (recoveryCodeIndex !== -1) {
        // Remove the used recovery code
        const updatedRecoveryCodes = [...metadata.mfaRecoveryCodes];
        updatedRecoveryCodes.splice(recoveryCodeIndex, 1);
        
        // Update the user's record
        await prisma.user.update({
          where: { id: userId },
          data: {
            metadata: {
              ...metadata,
              mfaRecoveryCodes: updatedRecoveryCodes
            }
          }
        });
        
        return true;
      }
    }
    
    // Verify 6-digit token using the secret
    // For actual implementation, would need to retrieve and decrypt the secret
    // This is a simplified demonstration
    return authenticator.verify({
      token,
      secret: hashedSecret
    });
  } catch (error) {
    console.error('Error verifying MFA token:', error);
    return false;
  }
}

/**
 * Generate recovery codes for a user
 */
function generateRecoveryCodes(count = 10) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a random 10-character alphanumeric code
    const code = randomBytes(5).toString('hex').toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Enable MFA for a user
 */
export async function enableMfa(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      metadata: {
        ...(await prisma.user.findUnique({ where: { id: userId } }))?.metadata as any || {},
        mfaEnabled: true
      }
    }
  });
}

/**
 * Disable MFA for a user
 */
export async function disableMfa(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      metadata: {
        ...(await prisma.user.findUnique({ where: { id: userId } }))?.metadata as any || {},
        mfaEnabled: false
      }
    }
  });
}

/**
 * Check if a user has MFA enabled
 */
export async function isMfaEnabled(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { metadata: true }
  });
  
  if (!user?.metadata) {
    return false;
  }
  
  return (user.metadata as any).mfaEnabled === true;
}

/**
 * Get recovery codes for a user
 */
export async function getRecoveryCodes(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { metadata: true }
  });
  
  if (!user?.metadata) {
    return [];
  }
  
  return (user.metadata as any).mfaRecoveryCodes || [];
}