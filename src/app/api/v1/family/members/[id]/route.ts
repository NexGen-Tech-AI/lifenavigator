import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for updating family member
const updateFamilyMemberSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().max(100).optional(),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER']).optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  is_dependent: z.boolean().optional(),
  is_beneficiary: z.boolean().optional(),
  photo_url: z.string().url().optional(),
  occupation: z.string().optional(),
  medical_conditions: z.array(z.string()).optional(),
  emergency_contact: z.boolean().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

// GET /api/v1/family/members/[id] - Get a specific family member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch family member
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !familyMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    // Get associated documents count
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', 'FAMILY_MEMBER')
      .eq('entity_id', id);

    return NextResponse.json({
      ...familyMember,
      documents_count: documentsCount || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/family/members/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/v1/family/members/[id] - Update a family member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateFamilyMemberSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Update family member
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .update(validationResult.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !familyMember) {
      return NextResponse.json({ error: 'Failed to update family member' }, { status: 500 });
    }

    // Handle emergency contact status
    if ('emergency_contact' in validationResult.data) {
      if (validationResult.data.emergency_contact) {
        // Add to emergency contacts if not already there
        await supabase
          .from('emergency_contacts')
          .upsert({
            user_id: user.id,
            family_member_id: familyMember.id,
            priority: 1,
          });
      } else {
        // Remove from emergency contacts
        await supabase
          .from('emergency_contacts')
          .delete()
          .eq('user_id', user.id)
          .eq('family_member_id', familyMember.id);
      }
    }

    return NextResponse.json(familyMember);
  } catch (error) {
    console.error('Error in PATCH /api/v1/family/members/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/family/members/[id] - Delete a family member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if family member has associated documents
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', 'FAMILY_MEMBER')
      .eq('entity_id', id);

    if (documentsCount && documentsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete family member with associated documents' },
        { status: 400 }
      );
    }

    // Delete family member
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/family/members/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}