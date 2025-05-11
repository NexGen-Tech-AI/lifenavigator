import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { 
  listDocuments, 
  getDocument, 
  deleteDocument, 
  DocumentCategory 
} from '@/lib/services/documentService';
import { prisma } from '@/lib/db';

/**
 * GET - List documents with filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as DocumentCategory | undefined;
    const searchTerm = searchParams.get('search') || undefined;
    const favorite = searchParams.has('favorite') ? searchParams.get('favorite') === 'true' : undefined;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit') as string) : 20;
    const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset') as string) : 0;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    
    // Get documents
    const result = await listDocuments(user.id, {
      category,
      searchTerm,
      favorite,
      limit,
      offset
    });
    
    // Format the response
    const formattedDocuments = result.documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      fileType: doc.fileType,
      category: doc.category,
      size: doc.size,
      uploadDate: doc.uploadDate,
      lastAccessed: doc.lastAccessed,
      favorite: doc.favorite,
      shared: doc.shared,
      tags: doc.documentTags.map(tag => tag.name),
      shareCount: doc.documentShares.length,
      accessCount: doc._count.accessLogs
    }));
    
    return NextResponse.json({
      documents: formattedDocuments,
      totalCount: result.totalCount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(result.totalCount / limit)
    });
    
  } catch (error: any) {
    console.error('Error listing documents:', error);
    return NextResponse.json({ 
      error: 'Failed to list documents', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * DELETE - Delete a document
 */
export async function DELETE(req: NextRequest) {
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
    
    // Delete document
    await deleteDocument(documentId, user.id);
    
    return NextResponse.json({ message: 'Document deleted successfully' });
    
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ 
      error: 'Failed to delete document', 
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * PATCH - Update document properties
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const data = await req.json();
    const { id, favorite, tags, category } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
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
        id,
        healthRecord: {
          userId: user.id
        }
      },
      include: {
        documentTags: true
      }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }
    
    // Update document 
    const updates: any = {};
    
    if (favorite !== undefined) {
      updates.favorite = favorite;
    }
    
    if (category) {
      updates.category = category;
    }
    
    // Update the document
    const updatedDocument = await prisma.secureDocument.update({
      where: { id },
      data: updates
    });
    
    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Delete existing tags
      await prisma.documentTag.deleteMany({
        where: { documentId: id }
      });
      
      // Create new tags
      if (tags.length > 0) {
        await prisma.documentTag.createMany({
          data: tags.map(tag => ({
            documentId: id,
            name: tag
          }))
        });
      }
    }
    
    return NextResponse.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
    
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json({ 
      error: 'Failed to update document', 
      details: error.message 
    }, { status: 500 });
  }
}