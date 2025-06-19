/**
 * Google Calendar Sync API
 * POST /api/v1/calendar/sync - Sync Google Calendar events
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, withErrorHandler, successResponse } from '@/lib/api/supabase-route-helpers'

async function getGoogleClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/google/callback`
  )
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })
  
  return oauth2Client
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  const supabase = await createClient()
  
  // Get Google integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .eq('is_active', true)
    .single()
  
  if (!integration) {
    return NextResponse.json({ error: 'Google account not connected' }, { status: 404 })
  }
  
  try {
    // Initialize Google Calendar API
    const auth = await getGoogleClient(integration.refresh_token)
    const calendar = google.calendar({ version: 'v3', auth })
    
    // Fetch events from the next 90 days
    const timeMin = new Date()
    const timeMax = new Date()
    timeMax.setDate(timeMax.getDate() + 90)
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250
    })
    
    const events = response.data.items || []
    
    // Process healthcare-related events
    const healthcareKeywords = [
      'doctor', 'dr.', 'appointment', 'medical', 'dentist', 'therapy',
      'physical', 'checkup', 'exam', 'consultation', 'health', 'clinic',
      'hospital', 'lab', 'test', 'screening', 'vaccine', 'surgery'
    ]
    
    const healthcareEvents = events.filter(event => {
      const title = (event.summary || '').toLowerCase()
      const description = (event.description || '').toLowerCase()
      const location = (event.location || '').toLowerCase()
      
      return healthcareKeywords.some(keyword => 
        title.includes(keyword) || 
        description.includes(keyword) || 
        location.includes(keyword)
      )
    })
    
    // Store healthcare events
    for (const event of healthcareEvents) {
      await supabase
        .from('calendar_events')
        .upsert({
          user_id: user.id,
          google_event_id: event.id,
          title: event.summary,
          description: event.description,
          location: event.location,
          start_time: event.start?.dateTime || event.start?.date,
          end_time: event.end?.dateTime || event.end?.date,
          all_day: !event.start?.dateTime,
          event_type: 'HEALTHCARE',
          metadata: {
            htmlLink: event.htmlLink,
            attendees: event.attendees?.map(a => ({
              email: a.email,
              displayName: a.displayName,
              organizer: a.organizer
            })),
            conferenceData: event.conferenceData
          }
        }, {
          onConflict: 'user_id,google_event_id'
        })
    }
    
    // Update sync status
    await supabase
      .from('integrations')
      .update({
        last_synced: new Date(),
        sync_status: 'success'
      })
      .eq('id', integration.id)
    
    return successResponse({
      totalEvents: events.length,
      healthcareEvents: healthcareEvents.length,
      nextSync: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }, 'Calendar synced successfully')
    
  } catch (error: any) {
    console.error('Calendar sync error:', error)
    
    // Update sync status
    await supabase
      .from('integrations')
      .update({
        sync_status: 'error',
        sync_error: error.message
      })
      .eq('id', integration.id)
    
    throw error
  }
})