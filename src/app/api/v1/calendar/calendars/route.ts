import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all calendars for the user
    const { data: calendars, error: calendarsError } = await supabase
      .from('calendars')
      .select(`
        *,
        connection:calendar_connections(
          provider,
          account_email,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .order('name')

    if (calendarsError) {
      console.error('Error fetching calendars:', calendarsError)
      return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 })
    }

    // Format calendars for the frontend
    const formattedCalendars = calendars.map(calendar => ({
      id: calendar.id,
      name: calendar.name,
      description: calendar.description,
      color: calendar.color,
      isVisible: calendar.is_visible,
      isSynced: calendar.is_synced,
      isPrimary: calendar.is_primary,
      isReadonly: calendar.is_readonly,
      provider: calendar.connection?.provider,
      accountEmail: calendar.connection?.account_email,
      lastSyncedAt: calendar.last_synced_at
    }))

    return NextResponse.json({ 
      calendars: formattedCalendars 
    })
  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { calendarId, updates } = await request.json()

    if (!calendarId) {
      return NextResponse.json({ error: 'Calendar ID required' }, { status: 400 })
    }

    // Verify calendar belongs to user
    const { data: calendar } = await supabase
      .from('calendars')
      .select('id')
      .eq('id', calendarId)
      .eq('user_id', user.id)
      .single()

    if (!calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 })
    }

    // Update calendar settings
    const allowedUpdates: any = {}
    if (typeof updates.isVisible !== 'undefined') {
      allowedUpdates.is_visible = updates.isVisible
    }
    if (typeof updates.isSynced !== 'undefined') {
      allowedUpdates.is_synced = updates.isSynced
    }
    if (updates.color) {
      allowedUpdates.color = updates.color
    }

    const { error: updateError } = await supabase
      .from('calendars')
      .update(allowedUpdates)
      .eq('id', calendarId)

    if (updateError) {
      console.error('Failed to update calendar:', updateError)
      return NextResponse.json({ error: 'Failed to update calendar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Calendar update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}