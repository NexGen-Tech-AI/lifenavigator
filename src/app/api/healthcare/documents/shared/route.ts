import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/db';
import { decryptBuffer } from '@/lib/services/documentService';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

export async function GET(req: NextRequest) {
  try {
    // Get access code from query params
    const { searchParams } = new URL(req.url);
    const accessCode = searchParams.get('code');
    
    if (!accessCode) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
    }
    
    // Find the share by access code
    const share = await prisma.documentShare.findFirst({
      where: {
        accessCode,
        expiresAt: { gt: new Date() }
      },
      include: {
        secureDocument: true
      }
    });
    
    if (!share) {
      return NextResponse.json({ error: 'Invalid or expired access code' }, { status: 404 });
    }
    
    // Check if the user should have access to this document
    // (For documents that require login, you might want to check the user's email)
    const session = await getServerSession();
    const isAuthenticated = !!session?.user?.email;
    
    // For some types of shares, you might want to require authentication
    // This is a simple example where we allow unauthenticated access for "view" but require auth for others
    if (share.accessLevel !== 'view' && !isAuthenticated) {
      return NextResponse.json({ 
        error: 'Authentication required for this level of access',
        requiresAuth: true 
      }, { status: 401 });
    }
    
    // Mark as accessed if not already
    if (!share.accessed) {
      await prisma.documentShare.update({
        where: { id: share.id },
        data: {
          accessed: true,
          accessedAt: new Date()
        }
      });
    }
    
    // Log the access
    await prisma.documentAccessLog.create({
      data: {
        documentId: share.documentId,
        accessType: 'shared-view',
        // You could also log IP address, user agent, etc.
      }
    });
    
    // If this is just an info request, return the document metadata
    const infoOnly = searchParams.get('info') === 'true';
    if (infoOnly) {
      return NextResponse.json({
        document: {
          id: share.secureDocument.id,
          filename: share.secureDocument.filename,
          fileType: share.secureDocument.fileType,
          size: share.secureDocument.size,
          uploadDate: share.secureDocument.uploadDate,
          accessLevel: share.accessLevel
        },
        share: {
          recipientEmail: share.recipientEmail,
          expiresAt: share.expiresAt
        }
      });
    }
    
    // Get the document from S3
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: share.secureDocument.s3Bucket,
      Key: share.secureDocument.s3Key
    }));
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    // @ts-ignore - response.Body is a readable stream
    for await (const chunk of response.Body) {
      chunks.push(Buffer.from(chunk));
    }
    
    const encryptedBuffer = Buffer.concat(chunks);
    
    // Extract IV, AuthTag, and encrypted data
    // Format: [16 bytes IV][16 bytes AuthTag][Encrypted Data]
    const iv = encryptedBuffer.subarray(0, 16);
    const authTag = encryptedBuffer.subarray(16, 32);
    const encryptedData = encryptedBuffer.subarray(32);
    
    // Decrypt the data
    const decryptedBuffer = decryptBuffer(encryptedData, iv, authTag);
    
    // For view-only documents, we might want to add a watermark or other protection
    // This would involve modifying the decryptedBuffer for PDFs or images
    
    // Return the file
    const response2 = new NextResponse(decryptedBuffer);
    
    // Set appropriate headers based on document type
    response2.headers.set('Content-Type', share.secureDocument.mimeType);
    
    // For view in browser, use 'inline', for download use 'attachment'
    const disposition = share.accessLevel === 'download' ? 'attachment' : 'inline';
    response2.headers.set('Content-Disposition', 
      `${disposition}; filename="${encodeURIComponent(share.secureDocument.filename)}"`);
    
    return response2;
    
  } catch (error: any) {
    console.error('Error accessing shared document:', error);
    return NextResponse.json({ 
      error: 'Failed to access document', 
      details: error.message 
    }, { status: 500 });
  }
}