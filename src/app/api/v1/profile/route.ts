import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema for profile update
const profileUpdateSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional()
    }).optional()
  }),
  financialProfile: z.object({
    monthlyIncome: z.string().optional(),
    monthlyExpenses: z.string().optional(),
    savingsGoal: z.string().optional(),
    incomeSource: z.string().optional(),
    employmentStatus: z.string().optional()
  }).optional(),
  healthProfile: z.object({
    primaryDoctor: z.string().optional(),
    insuranceProvider: z.string().optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional()
  }).optional(),
  careerProfile: z.object({
    currentJobTitle: z.string().optional(),
    employer: z.string().optional(),
    industry: z.string().optional(),
    skills: z.array(z.string()).optional(),
    careerGoals: z.string().optional()
  }).optional(),
  educationProfile: z.object({
    highestDegree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    currentlyStudying: z.string().optional(),
    certifications: z.array(z.string()).optional(),
    learningGoals: z.string().optional()
  }).optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Get onboarding data
    const { data: onboarding } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      profile: profile || {},
      onboardingData: onboarding || {},
      preferences: preferences || {}
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        first_name: validatedData.personalInfo.firstName,
        last_name: validatedData.personalInfo.lastName,
        date_of_birth: validatedData.personalInfo.dateOfBirth,
        primary_phone: validatedData.personalInfo.phone,
        primary_address: validatedData.personalInfo.address,
        profile_completion_percentage: calculateProfileCompletion(validatedData),
        onboarding_data: validatedData,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Update main user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        name: `${validatedData.personalInfo.firstName} ${validatedData.personalInfo.lastName}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (userError) {
      console.error('User update error:', userError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Store updated data in user_collected_data for history
    await supabase
      .from('user_collected_data')
      .insert({
        user_id: user.id,
        data_category: 'PROFILE',
        data_type: 'PROFILE_UPDATE',
        data_value: validatedData,
        source: 'MANUAL_ENTRY',
        is_validated: true
      })

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      profileCompletion: calculateProfileCompletion(validatedData)
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateProfileCompletion(data: any): number {
  let score = 0
  let totalFields = 0

  // Personal info (40%)
  const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'phone', 'address']
  personalFields.forEach(field => {
    totalFields += 8
    if (data.personalInfo?.[field]) {
      if (field === 'address') {
        // Check if address has any filled fields
        const addr = data.personalInfo.address
        if (addr?.street || addr?.city || addr?.state || addr?.zipCode) {
          score += 8
        }
      } else {
        score += 8
      }
    }
  })

  // Financial profile (15%)
  const financialFields = ['monthlyIncome', 'monthlyExpenses', 'savingsGoal']
  financialFields.forEach(field => {
    totalFields += 5
    if (data.financialProfile?.[field]) score += 5
  })

  // Health profile (15%)
  const healthFields = ['primaryDoctor', 'insuranceProvider', 'medications']
  healthFields.forEach(field => {
    totalFields += 5
    if (data.healthProfile?.[field]) {
      if (Array.isArray(data.healthProfile[field])) {
        if (data.healthProfile[field].length > 0) score += 5
      } else {
        score += 5
      }
    }
  })

  // Career profile (15%)
  const careerFields = ['currentJobTitle', 'employer', 'skills']
  careerFields.forEach(field => {
    totalFields += 5
    if (data.careerProfile?.[field]) {
      if (Array.isArray(data.careerProfile[field])) {
        if (data.careerProfile[field].length > 0) score += 5
      } else {
        score += 5
      }
    }
  })

  // Education profile (15%)
  const educationFields = ['highestDegree', 'fieldOfStudy']
  educationFields.forEach(field => {
    totalFields += 7.5
    if (data.educationProfile?.[field]) score += 7.5
  })

  return Math.min(Math.round((score / totalFields) * 100), 100)
}