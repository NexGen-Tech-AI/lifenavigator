import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string || file?.name;
    const documentType = formData.get('documentType') as string || 'OTHER';
    const category = formData.get('category') as string;
    const entityType = formData.get('entityType') as string || 'USER';
    const entityId = formData.get('entityId') as string || null;
    const tags = formData.get('tags') as string;
    const documentDate = formData.get('documentDate') as string;
    const expiryDate = formData.get('expiryDate') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large', 
        maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type',
        allowedTypes: ALLOWED_FILE_TYPES
      }, { status: 400 });
    }

    // Validate entity association
    if (entityType !== 'USER' && !entityId) {
      return NextResponse.json({ 
        error: 'Entity ID required for non-user documents' 
      }, { status: 400 });
    }

    // Verify entity ownership
    if (entityType === 'FAMILY_MEMBER' && entityId) {
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('id', entityId)
        .eq('user_id', user.id)
        .single();
      
      if (!familyMember) {
        return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
      }
    } else if (entityType === 'PET' && entityId) {
      const { data: pet } = await supabase
        .from('pets')
        .select('id')
        .eq('id', entityId)
        .eq('user_id', user.id)
        .single();
      
      if (!pet) {
        return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
      }
    }

    // Generate unique file name with folder structure
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;
    const storagePath = `documents/${user.id}/${entityType.toLowerCase()}/${entityId || 'personal'}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Generate secure URL (not public)
    const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/documents/${storagePath}`;

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        document_name: documentName,
        document_type: documentType,
        category: category || null,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_url: storageUrl,
        entity_type: entityType,
        entity_id: entityId,
        tags: tagsArray,
        document_date: documentDate || null,
        expiry_date: expiryDate || null,
        is_shared: false,
        metadata: {
          originalFileName: file.name,
          uploadedAt: new Date().toISOString(),
          fileExtension: fileExt,
        }
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('documents')
        .remove([storagePath]);
      
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'documents',
        record_id: document.id,
        action: 'INSERT',
        user_id: user.id,
        new_data: { document_name: documentName, entity_type: entityType }
      });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        documentName: document.document_name,
        fileName: document.file_name,
        fileSize: document.file_size,
        category: document.category,
        documentType: document.document_type,
        entityType: document.entity_type,
        entityId: document.entity_id,
        tags: document.tags,
        uploadedAt: document.created_at
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/v1/documents/upload - Get documents with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('documents')
      .select(`
        *,
        family_member:family_members!documents_entity_id_fkey(first_name, last_name),
        pet:pets!documents_entity_id_fkey(name, species)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query = query.contains('tags', tagArray);
    }

    const { data: documents, error, count } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    // Format response
    const formattedDocuments = documents?.map(doc => ({
      ...doc,
      entityName: doc.entity_type === 'FAMILY_MEMBER' 
        ? `${doc.family_member?.first_name} ${doc.family_member?.last_name || ''}`.trim()
        : doc.entity_type === 'PET'
        ? doc.pet?.name
        : 'Personal',
    }));

    return NextResponse.json({
      documents: formattedDocuments || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}