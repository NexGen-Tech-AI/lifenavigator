import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for family member
const familyMemberSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER']),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  is_dependent: z.boolean().default(false),
  is_beneficiary: z.boolean().default(false),
  photo_url: z.string().url().optional(),
  occupation: z.string().optional(),
  medical_conditions: z.array(z.string()).default([]),
  emergency_contact: z.boolean().default(false),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

// GET /api/v1/family/members - Get all family members
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch family members
    const { data: familyMembers, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching family members:', error);
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
    }

    return NextResponse.json({
      familyMembers: familyMembers || [],
      count: familyMembers?.length || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/family/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/family/members - Create a new family member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = familyMemberSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const familyMemberData = {
      ...validationResult.data,
      user_id: user.id,
    };

    // Insert family member
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .insert(familyMemberData)
      .select()
      .single();

    if (error) {
      console.error('Error creating family member:', error);
      return NextResponse.json({ error: 'Failed to create family member' }, { status: 500 });
    }

    // If marked as emergency contact, also add to emergency_contacts table
    if (familyMember.emergency_contact) {
      await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          family_member_id: familyMember.id,
          priority: 1,
        });
    }

    return NextResponse.json(familyMember, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/family/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}