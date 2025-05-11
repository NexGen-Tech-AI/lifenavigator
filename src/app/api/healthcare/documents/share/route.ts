import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { shareDocument } from '@/lib/services/documentService';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const data = await req.json();
    const { documentId, recipientEmail, accessLevel, expirationDays } = data;
    
    if (!documentId || !recipientEmail) {
      return NextResponse.json({ 
        error: 'Document ID and recipient email are required' 
      }, { status: 400 });
    }
    
    // Validate access level
    if (accessLevel && !['view', 'download', 'edit'].includes(accessLevel)) {
      return NextResponse.json({ 
        error: 'Invalid access level. Must be one of: view, download, edit' 
      }, { status: 400 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    
    // Verify ownership
    const document = await prisma.secureDocument.findFirst({
      where: {
        id: documentId,
        healthRecord: {
          userId: user.id
        }
      }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }
    
    // Share document
    const shareLink = await shareDocument(
      documentId, 
      recipientEmail, 
      (accessLevel || 'view') as 'view' | 'download' | 'edit',
      expirationDays || 7
    );
    
    return NextResponse.json({
      message: 'Document shared successfully',
      shareLink,
      expiresAt: new Date(Date.now() + (expirationDays || 7) * 24 * 60 * 60 * 1000)
    });
    
  } catch (error: any) {
    console.error('Error sharing document:', error);
    return NextResponse.json({ 
      error: 'Failed to share document', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get share ID
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('id');
    
    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    
    // Verify ownership of the document that was shared
    const share = await prisma.documentShare.findFirst({
      where: {
        id: shareId
      },
      include: {
        secureDocument: {
          include: {
            healthRecord: true
          }
        }
      }
    });
    
    if (!share || share.secureDocument.healthRecord.userId !== user.id) {
      return NextResponse.json({ error: 'Share not found or access denied' }, { status: 404 });
    }
    
    // Delete the share
    await prisma.documentShare.delete({
      where: { id: shareId }
    });
    
    // Check if there are any remaining shares for this document
    const remainingShares = await prisma.documentShare.findFirst({
      where: { documentId: share.documentId }
    });
    
    // If no more shares, update the document's shared status
    if (!remainingShares) {
      await prisma.secureDocument.update({
        where: { id: share.documentId },
        data: { shared: false }
      });
    }
    
    return NextResponse.json({
      message: 'Share revoked successfully'
    });
    
  } catch (error: any) {
    console.error('Error revoking share:', error);
    return NextResponse.json({ 
      error: 'Failed to revoke share', 
      details: error.message 
    }, { status: 500 });
  }
}