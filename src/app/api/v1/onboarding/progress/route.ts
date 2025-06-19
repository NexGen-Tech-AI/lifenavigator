import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for onboarding progress update
const progressSchema = z.object({
  currentStep: z.string(),
  stepData: z.record(z.any()).optional(),
  completed: z.boolean().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get onboarding progress
    const { data: progress, error: progressError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (progressError && progressError.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching progress:', progressError)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    // Get user profile for additional data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      progress: progress || {
        current_step: 'welcome',
        steps_completed: [],
        personal_info_completed: false,
        financial_profile_completed: false,
        health_profile_completed: false,
        career_profile_completed: false,
        education_profile_completed: false,
        documents_completed: false
      },
      profile: profile
    })
  } catch (error) {
    console.error('Onboarding progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = progressSchema.parse(body)

    // Prepare update data
    const updateData: any = {
      user_id: user.id,
      current_step: validatedData.currentStep,
      updated_at: new Date().toISOString()
    }

    // Handle step-specific data
    if (validatedData.stepData) {
      const stepType = validatedData.currentStep
      
      switch (stepType) {
        case 'personal_info':
          updateData.personal_info = validatedData.stepData
          updateData.personal_info_completed = validatedData.completed || false
          break
        case 'financial_profile':
          updateData.financial_profile = validatedData.stepData
          updateData.financial_profile_completed = validatedData.completed || false
          break
        case 'health_profile':
          updateData.health_profile = validatedData.stepData
          updateData.health_profile_completed = validatedData.completed || false
          break
        case 'career_profile':
          updateData.career_profile = validatedData.stepData
          updateData.career_profile_completed = validatedData.completed || false
          break
        case 'education_profile':
          updateData.education_profile = validatedData.stepData
          updateData.education_profile_completed = validatedData.completed || false
          break
      }
    }

    // Update or create progress record
    const { data: progress, error: progressError } = await supabase
      .from('onboarding_progress')
      .upsert(updateData)
      .select()
      .single()

    if (progressError) {
      console.error('Error updating progress:', progressError)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    // Update steps_completed array
    if (validatedData.completed && validatedData.currentStep !== 'welcome') {
      const { data: currentProgress } = await supabase
        .from('onboarding_progress')
        .select('steps_completed')
        .eq('user_id', user.id)
        .single()

      const stepsCompleted = currentProgress?.steps_completed || []
      if (!stepsCompleted.includes(validatedData.currentStep)) {
        stepsCompleted.push(validatedData.currentStep)
        
        await supabase
          .from('onboarding_progress')
          .update({ steps_completed: stepsCompleted })
          .eq('user_id', user.id)
      }
    }

    // Store data in user_collected_data for future reference
    if (validatedData.stepData && validatedData.completed) {
      await supabase
        .from('user_collected_data')
        .insert({
          user_id: user.id,
          data_category: 'ONBOARDING',
          data_type: validatedData.currentStep.toUpperCase(),
          data_value: validatedData.stepData,
          source: 'ONBOARDING',
          is_validated: true
        })
    }

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    console.error('Onboarding update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}