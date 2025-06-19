import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the connection belongs to the user and get details
    const { data: connection, error: connectionError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Check if sync is already in progress
    if (connection.sync_status === 'SYNCING') {
      return NextResponse.json({ 
        message: 'Sync already in progress',
        status: connection.sync_status 
      })
    }

    // Update sync status to syncing
    await supabase
      .from('calendar_connections')
      .update({ 
        sync_status: 'SYNCING',
        last_sync_error: null 
      })
      .eq('id', params.id)

    // Add to sync queue
    const { data: syncJob, error: queueError } = await supabase
      .from('calendar_sync_queue')
      .insert({
        connection_id: params.id,
        sync_type: 'INCREMENTAL',
        priority: 5,
        scheduled_for: new Date().toISOString()
      })
      .select()
      .single()

    if (queueError) {
      // Revert sync status
      await supabase
        .from('calendar_connections')
        .update({ sync_status: 'ERROR' })
        .eq('id', params.id)
      
      return NextResponse.json({ error: 'Failed to queue sync' }, { status: 500 })
    }

    // In a production environment, this would trigger a background job
    // For now, we'll do a simple sync inline (not recommended for production)
    try {
      await performSync(connection, supabase)
      
      // Update sync status to active
      await supabase
        .from('calendar_connections')
        .update({ 
          sync_status: 'ACTIVE',
          last_sync_at: new Date().toISOString(),
          next_sync_at: new Date(Date.now() + connection.sync_frequency_minutes * 60 * 1000).toISOString()
        })
        .eq('id', params.id)

      // Mark sync job as completed
      await supabase
        .from('calendar_sync_queue')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', syncJob.id)

      return NextResponse.json({ 
        success: true,
        message: 'Sync completed successfully'
      })
    } catch (syncError: any) {
      // Update sync status to error
      await supabase
        .from('calendar_connections')
        .update({ 
          sync_status: 'ERROR',
          last_sync_error: syncError.message 
        })
        .eq('id', params.id)

      // Mark sync job as failed
      await supabase
        .from('calendar_sync_queue')
        .update({
          status: 'FAILED',
          last_error: syncError.message
        })
        .eq('id', syncJob.id)

      return NextResponse.json({ 
        error: 'Sync failed',
        message: syncError.message 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simplified sync function - in production this would be much more complex
async function performSync(connection: any, supabase: any) {
  const { provider, access_token } = connection
  
  switch (provider) {
    case 'GOOGLE':
      await syncGoogleCalendars(connection, supabase)
      break
    case 'OUTLOOK':
    case 'OFFICE365':
      await syncMicrosoftCalendars(connection, supabase)
      break
    // Add other providers...
    default:
      throw new Error(`Sync not implemented for provider: ${provider}`)
  }
}

async function syncGoogleCalendars(connection: any, supabase: any) {
  // Get list of calendars
  const calendarsResponse = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    {
      headers: {
        Authorization: `Bearer ${connection.access_token}`
      }
    }
  )

  if (!calendarsResponse.ok) {
    throw new Error('Failed to fetch Google calendars')
  }

  const { items: calendars } = await calendarsResponse.json()

  // Save/update calendars
  for (const calendar of calendars) {
    await supabase
      .from('calendars')
      .upsert({
        connection_id: connection.id,
        user_id: connection.user_id,
        provider_calendar_id: calendar.id,
        name: calendar.summary,
        description: calendar.description,
        color: calendar.backgroundColor,
        is_primary: calendar.primary || false,
        access_role: calendar.accessRole,
        timezone: calendar.timeZone,
        last_synced_at: new Date().toISOString()
      })
  }

  // Log sync
  await supabase
    .from('calendar_integration_logs')
    .insert({
      connection_id: connection.id,
      user_id: connection.user_id,
      action: 'sync_calendars',
      status: 'success',
      calendars_synced: calendars.length
    })
}

async function syncMicrosoftCalendars(connection: any, supabase: any) {
  // Get list of calendars
  const calendarsResponse = await fetch(
    'https://graph.microsoft.com/v1.0/me/calendars',
    {
      headers: {
        Authorization: `Bearer ${connection.access_token}`
      }
    }
  )

  if (!calendarsResponse.ok) {
    throw new Error('Failed to fetch Microsoft calendars')
  }

  const { value: calendars } = await calendarsResponse.json()

  // Save/update calendars
  for (const calendar of calendars) {
    await supabase
      .from('calendars')
      .upsert({
        connection_id: connection.id,
        user_id: connection.user_id,
        provider_calendar_id: calendar.id,
        name: calendar.name,
        color: calendar.hexColor || '#0078D4',
        is_primary: calendar.isDefaultCalendar || false,
        is_readonly: !calendar.canEdit,
        last_synced_at: new Date().toISOString()
      })
  }

  // Log sync
  await supabase
    .from('calendar_integration_logs')
    .insert({
      connection_id: connection.id,
      user_id: connection.user_id,
      action: 'sync_calendars',
      status: 'success',
      calendars_synced: calendars.length
    })
}