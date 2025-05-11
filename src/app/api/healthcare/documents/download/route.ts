import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { downloadDocument } from '@/lib/services/documentService';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get document ID
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    
    // Ensure the document exists and user has access
    const document = await prisma.secureDocument.findFirst({
      where: {
        id: documentId,
        healthRecord: {
          userId: user.id
        }
      }
    });
    
    if (!document) {
      // Check if the document is shared with this user
      const share = await prisma.documentShare.findFirst({
        where: {
          documentId,
          recipientEmail: user.email,
          expiresAt: { gt: new Date() },
          accessLevel: { in: ['download', 'edit'] }
        },
        include: {
          secureDocument: true
        }
      });
      
      if (!share) {
        return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
      }
    }
    
    // Download the document
    const result = await downloadDocument(documentId, user);
    
    // Return the file
    const response = new NextResponse(result.buffer);
    
    // Set appropriate headers
    response.headers.set('Content-Type', result.mimeType);
    response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(result.fileName)}"`);
    
    return response;
    
  } catch (error: any) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ 
      error: 'Failed to download document', 
      details: error.message 
    }, { status: 500 });
  }
}