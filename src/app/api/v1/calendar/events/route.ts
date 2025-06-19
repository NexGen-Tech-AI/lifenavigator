import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start') || subDays(new Date(), 30).toISOString()
    const endDate = searchParams.get('end') || addDays(new Date(), 30).toISOString()
    const calendarIds = searchParams.get('calendars')?.split(',').filter(Boolean)

    // Build query
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        calendar:calendars(
          id,
          name,
          color,
          is_visible
        )
      `)
      .eq('user_id', user.id)
      .gte('start_datetime', startDate)
      .lte('start_datetime', endDate)
      .neq('status', 'cancelled')
      .order('start_datetime')

    // Filter by specific calendars if provided
    if (calendarIds && calendarIds.length > 0) {
      query = query.in('calendar_id', calendarIds)
    }

    const { data: events, error: eventsError } = await query

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    // Filter out events from hidden calendars
    const visibleEvents = events.filter(event => event.calendar?.is_visible)

    // Format events for the frontend
    const formattedEvents = visibleEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDatetime: event.start_datetime,
      endDatetime: event.end_datetime,
      allDay: event.all_day,
      calendarId: event.calendar_id,
      calendarName: event.calendar?.name,
      calendarColor: event.calendar?.color,
      status: event.status,
      visibility: event.visibility,
      attendees: event.attendees,
      organizer: event.organizer,
      htmlLink: event.html_link,
      conferenceData: event.conference_data,
      isRecurring: event.is_recurring,
      recurrenceRule: event.recurrence_rule
    }))

    return NextResponse.json({ 
      events: formattedEvents,
      count: formattedEvents.length
    })
  } catch (error) {
    console.error('Calendar events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.calendarId || !body.startDatetime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify calendar belongs to user
    const { data: calendar } = await supabase
      .from('calendars')
      .select('id')
      .eq('id', body.calendarId)
      .eq('user_id', user.id)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
    }

    // Create event
    const { data: event, error: createError } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        calendar_id: body.calendarId,
        provider_event_id: `local-${Date.now()}`, // Local events get a unique ID
        title: body.title,
        description: body.description,
        location: body.location,
        start_datetime: body.startDatetime,
        end_datetime: body.endDatetime || body.startDatetime,
        all_day: body.allDay || false,
        status: 'confirmed',
        visibility: body.visibility || 'PUBLIC',
        is_modified_locally: true,
        local_changes: body
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create event:', createError)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      event: {
        id: event.id,
        title: event.title,
        startDatetime: event.start_datetime,
        endDatetime: event.end_datetime
      }
    })
  } catch (error) {
    console.error('Calendar event create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}