import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for pet
const petSchema = z.object({
  name: z.string().min(1).max(100),
  species: z.enum(['DOG', 'CAT', 'BIRD', 'FISH', 'RABBIT', 'HAMSTER', 'GUINEA_PIG', 'REPTILE', 'HORSE', 'OTHER']),
  breed: z.string().optional(),
  color: z.string().optional(),
  date_of_birth: z.string().optional(),
  weight_lbs: z.number().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional(),
  is_neutered: z.boolean().default(false),
  microchip_id: z.string().optional(),
  license_number: z.string().optional(),
  last_vet_visit: z.string().optional(),
  next_vet_visit: z.string().optional(),
  vaccination_status: z.enum(['UP_TO_DATE', 'DUE_SOON', 'OVERDUE', 'UNKNOWN']).default('UNKNOWN'),
  primary_vet_name: z.string().optional(),
  primary_vet_phone: z.string().optional(),
  dietary_restrictions: z.array(z.string()).default([]),
  current_medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })).default([]),
  allergies: z.array(z.string()).default([]),
  has_insurance: z.boolean().default(false),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  status: z.enum(['ACTIVE', 'LOST', 'DECEASED', 'REHOMED']).default('ACTIVE'),
  notes: z.string().optional(),
});

// GET /api/v1/pets - Get all pets
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use a fixed user ID
    const demoUserId = 'demo-user-001';

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('pets')
      .select('*')
      .eq('user_id', demoUserId);

    if (status) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data: pets, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pets:', error);
      return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
    }

    // Get upcoming appointments
    const { data: upcomingAppointments } = await supabase
      .rpc('get_upcoming_pet_appointments', { user_id_param: demoUserId });

    return NextResponse.json({
      pets: pets || [],
      count: pets?.length || 0,
      upcomingAppointments: upcomingAppointments || [],
    });
  } catch (error) {
    console.error('Error in GET /api/v1/pets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/pets - Create a new pet
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Demo mode - use a fixed user ID
    const demoUserId = 'demo-user-001';

    // Parse and validate request body
    const body = await request.json();
    const validationResult = petSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const petData = {
      ...validationResult.data,
      user_id: demoUserId,
    };

    // Insert pet
    const { data: pet, error } = await supabase
      .from('pets')
      .insert(petData)
      .select()
      .single();

    if (error) {
      console.error('Error creating pet:', error);
      if (error.code === '23505' && error.message.includes('microchip_id')) {
        return NextResponse.json({ error: 'A pet with this microchip ID already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 });
    }

    // If there's a next vet visit scheduled, create a reminder
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

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/pets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}