import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(
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

    // Verify the connection belongs to the user
    const { data: connection } = await supabase
      .from('calendar_connections')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Delete the connection (cascades to calendars and events)
    const { error: deleteError } = await supabase
      .from('calendar_connections')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Failed to delete connection:', deleteError)
      return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
    }

    // Log the disconnection
    await supabase
      .from('calendar_integration_logs')
      .insert({
        user_id: user.id,
        action: 'disconnect',
        status: 'success',
        metadata: { connectionId: params.id }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Calendar connection delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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

    // Verify the connection belongs to the user
    const { data: connection } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const body = await request.json()
    const updates: any = {}

    // Update allowed fields
    if (typeof body.syncEnabled !== 'undefined') {
      updates.sync_enabled = body.syncEnabled
    }
    if (body.syncFrequencyMinutes) {
      updates.sync_frequency_minutes = body.syncFrequencyMinutes
    }
    if (body.syncPastDays) {
      updates.sync_past_days = body.syncPastDays
    }
    if (body.syncFutureDays) {
      updates.sync_future_days = body.syncFutureDays
    }

    // Update the connection
    const { error: updateError } = await supabase
      .from('calendar_connections')
      .update(updates)
      .eq('id', params.id)

    if (updateError) {
      console.error('Failed to update connection:', updateError)
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Calendar connection update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}