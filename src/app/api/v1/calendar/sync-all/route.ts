import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active connections for the user
    const { data: connections, error: connectionsError } = await supabase
      .from('calendar_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('sync_enabled', true)

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError)
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ 
        message: 'No active connections to sync',
        synced: 0 
      })
    }

    // Queue sync for each connection
    const syncPromises = connections.map(connection => 
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/calendar/connections/${connection.id}/sync`, {
        method: 'POST',
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      })
    )

    // Execute all syncs in parallel
    const results = await Promise.allSettled(syncPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ 
      message: `Synced ${successful} connections`,
      synced: successful,
      failed: failed,
      total: connections.length
    })
  } catch (error) {
    console.error('Sync all error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}