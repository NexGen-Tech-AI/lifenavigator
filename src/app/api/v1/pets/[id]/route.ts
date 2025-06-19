import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for updating pet
const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: z.enum(['DOG', 'CAT', 'BIRD', 'FISH', 'RABBIT', 'HAMSTER', 'GUINEA_PIG', 'REPTILE', 'HORSE', 'OTHER']).optional(),
  breed: z.string().optional(),
  color: z.string().optional(),
  date_of_birth: z.string().optional(),
  weight_lbs: z.number().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  is_neutered: z.boolean().optional(),
  microchip_id: z.string().optional(),
  license_number: z.string().optional(),
  last_vet_visit: z.string().optional(),
  next_vet_visit: z.string().optional(),
  vaccination_status: z.enum(['UP_TO_DATE', 'DUE_SOON', 'OVERDUE', 'UNKNOWN']).optional(),
  primary_vet_name: z.string().optional(),
  primary_vet_phone: z.string().optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  current_medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })).optional(),
  allergies: z.array(z.string()).optional(),
  has_insurance: z.boolean().optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  status: z.enum(['ACTIVE', 'LOST', 'DECEASED', 'REHOMED']).optional(),
  notes: z.string().optional(),
});

// GET /api/v1/pets/[id] - Get a specific pet
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

    // Fetch pet
    const { data: pet, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Get health records count
    const { count: healthRecordsCount } = await supabase
      .from('pet_health_records')
      .select('*', { count: 'exact', head: true })
      .eq('pet_id', id);

    // Get documents count
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', 'PET')
      .eq('entity_id', id);

    // Get recent health records
    const { data: recentHealthRecords } = await supabase
      .from('pet_health_records')
      .select('*')
      .eq('pet_id', id)
      .order('record_date', { ascending: false })
      .limit(5);

    return NextResponse.json({
      ...pet,
      health_records_count: healthRecordsCount || 0,
      documents_count: documentsCount || 0,
      recent_health_records: recentHealthRecords || [],
    });
  } catch (error) {
    console.error('Error in GET /api/v1/pets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/v1/pets/[id] - Update a pet
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
    const validationResult = updatePetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Update pet
    const { data: pet, error } = await supabase
      .from('pets')
      .update(validationResult.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !pet) {
      if (error?.code === '23505' && error.message.includes('microchip_id')) {
        return NextResponse.json({ error: 'A pet with this microchip ID already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
    }

    // Update vet appointment reminder if next_vet_visit changed
    if ('next_vet_visit' in validationResult.data) {
      // Delete old reminders
      await supabase
        .from('important_dates')
        .delete()
        .eq('user_id', user.id)
        .like('event_name', `${pet.name}'s vet appointment%`);

      // Create new reminder if there's a next visit
      if (pet.next_vet_visit) {
        await supabase
          .from('important_dates')
          .insert({
            user_id: user.id,
            event_name: `${pet.name}'s vet appointment`,
            event_date: pet.next_vet_visit,
            event_type: 'APPOINTMENT',
            is_recurring: false,
            reminder_enabled: true,
            reminder_days_before: 3,
          });
      }
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error('Error in PATCH /api/v1/pets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/pets/[id] - Delete a pet
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

    // Get pet info for cleanup
    const { data: pet } = await supabase
      .from('pets')
      .select('name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Delete associated reminders
    await supabase
      .from('important_dates')
      .delete()
      .eq('user_id', user.id)
      .like('event_name', `${pet.name}'s %`);

    // Delete pet (health records and documents will cascade delete)
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/pets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}