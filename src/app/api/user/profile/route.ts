import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user (more secure than getSession)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data from database
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id);
    
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    // Construct user data response
    const userData = {
      id: user.id,
      name: profile?.display_name || profile?.first_name && profile?.last_name 
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : user.user_metadata?.name || 'User',
      email: user.email || '',
      setupCompleted: true, // Default to true for now
      goals: {
        financialGoals: {},
        careerGoals: {},
        educationGoals: {},
        healthGoals: {}
      },
      riskProfile: {
        riskTheta: 0.5,
        financialRiskTolerance: 0.6,
        careerRiskTolerance: 0.5,
        healthRiskTolerance: 0.4,
        educationRiskTolerance: 0.7
      }
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Update user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        first_name: updates.name?.split(' ')[0],
        last_name: updates.name?.split(' ').slice(1).join(' '),
        display_name: updates.name,
        setup_completed: updates.setupCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}