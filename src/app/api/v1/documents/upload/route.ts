import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check feature access for free tier users
    const { data: featureUsage } = await supabase
      .from('feature_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_name', 'document_upload')
      .single()

    if (featureUsage && featureUsage.monthly_limit) {
      // Reset monthly usage if needed
      const resetDate = new Date(featureUsage.limit_reset_date)
      const now = new Date()
      
      if (now >= resetDate) {
        // Reset the monthly counter
        await supabase
          .from('feature_usage')
          .update({
            current_month_usage: 0,
            limit_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
          })
          .eq('user_id', user.id)
          .eq('feature_name', 'document_upload')
      } else if (featureUsage.current_month_usage >= featureUsage.monthly_limit) {
        return NextResponse.json({
          error: 'Monthly document upload limit reached',
          limit: featureUsage.monthly_limit,
          usage: featureUsage.current_month_usage
        }, { status: 403 })
      }
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'OTHER'
    const documentType = formData.get('documentType') as string || 'OTHER'
    const uploadedDuringOnboarding = formData.get('onboarding') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large', 
        maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type',
        allowedTypes: ['PDF', 'DOC', 'DOCX', 'JPG', 'PNG']
      }, { status: 400 })
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const storagePath = `${user.id}/documents/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-documents')
      .getPublicUrl(storagePath)

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('user_documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: fileExt || 'unknown',
        file_size: file.size,
        file_url: publicUrl,
        storage_path: storagePath,
        mime_type: file.type,
        document_category: category,
        document_type: documentType,
        uploaded_during_onboarding: uploadedDuringOnboarding,
        processing_status: 'PENDING'
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('user-documents')
        .remove([storagePath])
      
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 })
    }

    // Update feature usage
    if (featureUsage) {
      await supabase
        .from('feature_usage')
        .update({
          usage_count: featureUsage.usage_count + 1,
          current_month_usage: featureUsage.current_month_usage + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('feature_name', 'document_upload')
    }

    // Trigger document processing (if implemented)
    // This could be a background job to extract text, analyze content, etc.

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.file_name,
        fileSize: document.file_size,
        category: document.document_category,
        type: document.document_type,
        uploadedAt: document.created_at
      }
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('user_documents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('document_category', category)
    }

    const { data: documents, error, count } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({
      documents,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Document fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}