import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/tax/documents - Get tax documents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use hardcoded user ID
    const demoUserId = 'demo-user-001';

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Fetch tax documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', demoUserId)
      .eq('category', 'tax')
      .or(`metadata->tax_year.eq.${year},metadata->tax_year.is.null`);

    if (error) {
      console.error('Error fetching documents:', error);
    }

    // Mock data if no documents exist
    const mockDocuments = documents?.length ? documents : [
      {
        id: '1',
        name: 'W-2 - Employer Inc.',
        type: 'Income',
        uploaded_at: new Date('2024-01-15').toISOString(),
        status: 'verified',
        year: parseInt(year),
        category: 'tax'
      },
      {
        id: '2',
        name: '1099-INT - Bank Account',
        type: 'Income',
        uploaded_at: new Date('2024-01-20').toISOString(),
        status: 'verified',
        year: parseInt(year),
        category: 'tax'
      },
      {
        id: '3',
        name: 'Property Tax Statement',
        type: 'Deduction',
        uploaded_at: new Date('2024-01-25').toISOString(),
        status: 'pending',
        year: parseInt(year),
        category: 'tax'
      },
      {
        id: '4',
        name: '1098 - Mortgage Interest',
        type: 'Deduction',
        uploaded_at: new Date('2024-02-05').toISOString(),
        status: 'missing',
        year: parseInt(year),
        category: 'tax'
      }
    ];

    return NextResponse.json({
      documents: mockDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        status: doc.status,
        year: doc.year,
        category: 'tax'
      }))
    });
  } catch (error) {
    console.error('Error in GET /api/v1/tax/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/tax/documents - Upload tax document
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use hardcoded user ID
    const demoUserId = 'demo-user-001';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;
    const taxYear = formData.get('taxYear') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `tax/${demoUserId}/${taxYear}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: demoUserId,
        name: file.name,
        type: documentType,
        category: 'tax',
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
        metadata: {
          tax_year: taxYear
        },
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating document record:', dbError);
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([fileName]);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error in POST /api/v1/tax/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}