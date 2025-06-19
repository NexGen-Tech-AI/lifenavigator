import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for complete onboarding
const completeOnboardingSchema = z.object({
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
    monthlyIncome: z.number().optional(),
    monthlyExpenses: z.number().optional(),
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
    const validatedData = completeOnboardingSchema.parse(body)

    // Start a transaction by updating multiple tables
    const updates = []

    // Update user profile
    if (validatedData.personalInfo) {
      const profileUpdate = supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          first_name: validatedData.personalInfo.firstName,
          last_name: validatedData.personalInfo.lastName,
          date_of_birth: validatedData.personalInfo.dateOfBirth,
          primary_phone: validatedData.personalInfo.phone,
          primary_address: validatedData.personalInfo.address,
          profile_completion_percentage: calculateProfileCompletion(validatedData),
          onboarding_data: {
            completedAt: new Date().toISOString(),
            ...validatedData
          },
          onboarding_completed_at: new Date().toISOString()
        })
        .select()
      
      updates.push(profileUpdate)
    }

    // Update user preferences with default settings
    const preferencesUpdate = supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        notification_settings: {
          security_alerts: true,
          transaction_alerts: true,
          health_reminders: true,
          appointment_reminders: true,
          goal_updates: true,
          insights_recommendations: true,
          product_updates: false,
          marketing: false
        }
      })
      .select()
    
    updates.push(preferencesUpdate)

    // Mark onboarding as complete
    const onboardingUpdate = supabase
      .from('onboarding_progress')
      .upsert({
        user_id: user.id,
        current_step: 'complete',
        personal_info: validatedData.personalInfo,
        financial_profile: validatedData.financialProfile,
        health_profile: validatedData.healthProfile,
        career_profile: validatedData.careerProfile,
        education_profile: validatedData.educationProfile,
        personal_info_completed: true,
        financial_profile_completed: !!validatedData.financialProfile,
        health_profile_completed: !!validatedData.healthProfile,
        career_profile_completed: !!validatedData.careerProfile,
        education_profile_completed: !!validatedData.educationProfile,
        steps_completed: [
          'personal_info',
          ...(validatedData.financialProfile ? ['financial_profile'] : []),
          ...(validatedData.healthProfile ? ['health_profile'] : []),
          ...(validatedData.careerProfile ? ['career_profile'] : []),
          ...(validatedData.educationProfile ? ['education_profile'] : [])
        ]
      })
      .select()
    
    updates.push(onboardingUpdate)

    // Update main user record
    const userUpdate = supabase
      .from('users')
      .update({
        name: `${validatedData.personalInfo.firstName} ${validatedData.personalInfo.lastName}`,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
    
    updates.push(userUpdate)

    // Execute all updates
    const results = await Promise.all(updates)
    
    // Check for any errors
    const hasError = results.some(result => result.error)
    if (hasError) {
      console.error('Onboarding completion errors:', results.map(r => r.error).filter(Boolean))
      return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
    }

    // Initialize feature usage tracking for freemium features
    const freemiumFeatures = [
      { name: 'manual_accounts', category: 'finance', monthly_limit: 5, requires_tier: 'FREE' },
      { name: 'document_upload', category: 'documents', monthly_limit: 10, requires_tier: 'FREE' },
      { name: 'basic_insights', category: 'analytics', monthly_limit: null, requires_tier: 'FREE' },
      { name: 'bank_connection', category: 'finance', monthly_limit: null, requires_tier: 'PRO' },
      { name: 'ai_insights', category: 'analytics', monthly_limit: null, requires_tier: 'PRO' }
    ]

    await supabase
      .from('feature_usage')
      .insert(
        freemiumFeatures.map(feature => ({
          user_id: user.id,
          feature_name: feature.name,
          feature_category: feature.category,
          monthly_limit: feature.monthly_limit,
          requires_tier: feature.requires_tier,
          limit_reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
        }))
      )

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully',
      profileCompletion: calculateProfileCompletion(validatedData)
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    console.error('Onboarding completion error:', error)
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
    if (data.personalInfo?.[field]) score += 8
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
    if (data.healthProfile?.[field]) score += 5
  })

  // Career profile (15%)
  const careerFields = ['currentJobTitle', 'employer', 'skills']
  careerFields.forEach(field => {
    totalFields += 5
    if (data.careerProfile?.[field]) score += 5
  })

  // Education profile (15%)
  const educationFields = ['highestDegree', 'fieldOfStudy']
  educationFields.forEach(field => {
    totalFields += 7.5
    if (data.educationProfile?.[field]) score += 7.5
  })

  return Math.min(Math.round((score / totalFields) * 100), 100)
}