import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';

// Document interface
interface SecureDocument {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  category: string;
  size: number;
  uploadDate: string;
  lastAccessed: string;
  tags: string[];
  encrypted: boolean;
  favorite: boolean;
}

// Mock database for secure documents
let mockDocuments: SecureDocument[] = [
  {
    id: 'doc1',
    userId: 'user1',
    filename: 'Health_Insurance_Policy.pdf',
    fileType: 'PDF',
    category: 'insurance',
    size: 1200000,
    uploadDate: '2025-04-15',
    lastAccessed: '2025-05-08',
    tags: ['insurance', 'healthcare', 'policy'],
    encrypted: true,
    favorite: true
  },
  {
    id: 'doc2',
    userId: 'user1',
    filename: 'Passport_Scan.pdf',
    fileType: 'PDF',
    category: 'identification',
    size: 3800000,
    uploadDate: '2025-03-22',
    lastAccessed: '2025-05-02',
    tags: ['identification', 'travel', 'government'],
    encrypted: true,
    favorite: false
  }
];

/**
 * GET handler - Retrieve user documents
 */
export async function GET(req: NextRequest) {
  try {
    // Usually we would parse the session and get the user ID
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Filter documents to only show those belonging to this user
    // In this mock implementation, we just return all documents
    // In a real implementation, we'd filter by user ID
    const userId = token.sub || 'user1'; // Fall back to demo user if no sub
    const userDocuments = mockDocuments.filter(doc => doc.userId === userId);
    
    // Convert document sizes to readable format
    const formattedDocuments = userDocuments.map(doc => ({
      ...doc,
      size: formatBytes(doc.size),
    }));
    
    return NextResponse.json({
      documents: formattedDocuments
    });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json({ error: 'Failed to retrieve documents' }, { status: 500 });
  }
}

/**
 * POST handler - Upload a new document
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.filename || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // In a real implementation:
    // 1. We would handle file upload
    // 2. Encrypt the file
    // 3. Store it securely
    // 4. Create a database record
    
    // For this mock, just create a document record
    const newDocument: SecureDocument = {
      id: `doc${Date.now()}`,
      userId: token.sub || 'user1',
      filename: data.filename,
      fileType: data.fileType || 'PDF',
      category: data.category,
      size: data.size || 1000000, // Default 1MB
      uploadDate: new Date().toISOString().split('T')[0],
      lastAccessed: new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      encrypted: true, // Always encrypt documents
      favorite: false
    };
    
    // Add to our mock database
    mockDocuments.push(newDocument);
    
    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        ...newDocument,
        size: formatBytes(newDocument.size)
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

/**
 * DELETE handler - Delete a document
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Check if document exists and belongs to user
    const userId = token.sub || 'user1';
    const documentIndex = mockDocuments.findIndex(
      doc => doc.id === documentId && doc.userId === userId
    );
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Remove document from mock database
    mockDocuments.splice(documentIndex, 1);
    
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

/**
 * PATCH handler - Update document (favorite, tags, etc.)
 */
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Check if document exists and belongs to user
    const userId = token.sub || 'user1';
    const documentIndex = mockDocuments.findIndex(
      doc => doc.id === data.id && doc.userId === userId
    );
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Update document fields
    const updatedDocument = {
      ...mockDocuments[documentIndex],
      ...data,
      // Don't allow these fields to be modified directly
      id: mockDocuments[documentIndex].id,
      userId: mockDocuments[documentIndex].userId,
      fileType: mockDocuments[documentIndex].fileType,
      uploadDate: mockDocuments[documentIndex].uploadDate,
      size: mockDocuments[documentIndex].size,
      // Update lastAccessed
      lastAccessed: new Date().toISOString().split('T')[0]
    };
    
    mockDocuments[documentIndex] = updatedDocument;
    
    return NextResponse.json({
      message: 'Document updated successfully',
      document: {
        ...updatedDocument,
        size: formatBytes(updatedDocument.size)
      }
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// Helper function to format bytes into human-readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}