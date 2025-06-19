/**
 * Appointment Scheduling API
 * GET /api/v1/appointments - List appointments
 * POST /api/v1/appointments - Create appointment
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  withErrorHandler,
  requireAuth,
  validateRequest,
  getPaginationParams,
  paginatedResponse,
  successResponse
} from '@/lib/api/supabase-route-helpers'

// Validation schemas
const createAppointmentSchema = z.object({
  provider_name: z.string(),
  provider_type: z.enum(['DOCTOR', 'DENTIST', 'SPECIALIST', 'THERAPIST', 'LAB', 'OTHER']),
  appointment_date: z.string(),
  appointment_time: z.string(),
  duration_minutes: z.number().default(30),
  location: z.string().optional(),
  virtual_meeting_url: z.string().optional(),
  reason: z.string(),
  notes: z.string().optional(),
  reminder_settings: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    advance_minutes: z.array(z.number()).default([1440, 60]) // 24h and 1h before
  }).optional()
})

// GET /api/v1/appointments
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  const supabase = await createClient()
  
  const { page, pageSize, skip } = getPaginationParams(request)
  const { searchParams } = new URL(request.url)
  
  // Build query
  let query = supabase
    .from('appointments')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
  
  // Filter by status
  const status = searchParams.get('status')
  if (status) {
    query = query.eq('status', status)
  }
  
  // Filter by date range
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  
  if (startDate) {
    query = query.gte('appointment_date', startDate)
  }
  
  if (endDate) {
    query = query.lte('appointment_date', endDate)
  }
  
  // Filter by provider type
  const providerType = searchParams.get('provider_type')
  if (providerType) {
    query = query.eq('provider_type', providerType)
  }
  
  // Execute query with pagination
  const { data: appointments, error, count } = await query
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })
    .range(skip, skip + pageSize - 1)
  
  if (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
  
  // Get upcoming appointments summary
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', today)
    .eq('status', 'SCHEDULED')
  
  return paginatedResponse(appointments || [], page, pageSize, count || 0, {
    upcomingCount: upcomingCount || 0
  })
})

// POST /api/v1/appointments
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  const supabase = await createClient()
  const data = await validateRequest<z.infer<typeof createAppointmentSchema>>(request, createAppointmentSchema)
  
  // Combine date and time
  const appointmentDateTime = new Date(`${data.appointment_date}T${data.appointment_time}`)
  const endDateTime = new Date(appointmentDateTime.getTime() + data.duration_minutes * 60000)
  
  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('user_id', user.id)
    .eq('appointment_date', data.appointment_date)
    .gte('appointment_time', data.appointment_time)
    .lt('appointment_time', endDateTime.toTimeString().slice(0, 5))
    .eq('status', 'SCHEDULED')
  
  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ 
      error: 'Time slot conflicts with existing appointment' 
    }, { status: 409 })
  }
  
  // Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      user_id: user.id,
      ...data,
      status: 'SCHEDULED',
      created_at: new Date()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
  
  // Schedule reminders
  if (data.reminder_settings) {
    const reminders = data.reminder_settings.advance_minutes.map(minutes => ({
      appointment_id: appointment.id,
      user_id: user.id,
      reminder_type: minutes >= 1440 ? 'DAY_BEFORE' : 'HOUR_BEFORE',
      scheduled_for: new Date(appointmentDateTime.getTime() - minutes * 60000),
      channels: {
        email: data.reminder_settings!.email,
        sms: data.reminder_settings!.sms,
        push: data.reminder_settings!.push
      }
    }))
    
    await supabase.from('appointment_reminders').insert(reminders)
  }
  
  // Sync with Google Calendar if connected
  const { data: googleIntegration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .eq('is_active', true)
    .single()
  
  if (googleIntegration) {
    // Queue calendar sync
    await supabase.from('sync_queue').insert({
      user_id: user.id,
      sync_type: 'CREATE_CALENDAR_EVENT',
      data: {
        appointment_id: appointment.id,
        title: `${data.provider_type}: ${data.provider_name}`,
        description: `Reason: ${data.reason}\n${data.notes || ''}`,
        location: data.location,
        start: appointmentDateTime,
        end: endDateTime
      }
    })
  }
  
  return successResponse(appointment, 'Appointment scheduled successfully', 201)
})