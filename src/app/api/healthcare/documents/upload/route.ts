import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { uploadDocument, DocumentCategory } from '@/lib/services/documentService';
import { prisma } from '@/lib/db';

// Maximum file size (30 MB)
const MAX_FILE_SIZE = 30 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse form data
    const formData = await req.formData();
    
    // Get file from form data
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }
    
    // Get other form fields
    const category = formData.get('category') as DocumentCategory;
    const tags = formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : [];
    
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        healthData: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
    
    // Get or create health record
    let healthRecord = user.healthData[0];
    if (!healthRecord) {
      healthRecord = await prisma.healthRecord.create({
        data: {
          userId: user.id
        }
      });
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload document
    const documentId = await uploadDocument({
      file: buffer,
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      mimeType: file.type,
      category,
      tags,
      healthRecordId: healthRecord.id,
      userId: user.id
    });
    
    return NextResponse.json({ 
      message: 'Document uploaded successfully',
      documentId
    });
    
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ 
      error: 'Failed to upload document', 
      details: error.message 
    }, { status: 500 });
  }
}