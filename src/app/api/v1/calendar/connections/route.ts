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

    // Get all calendar connections for the user
    const { data: connections, error: connectionsError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError)
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
    }

    // Get calendar counts and event counts for each connection
    const connectionsWithStats = await Promise.all(
      connections.map(async (connection) => {
        // Get calendar count
        const { count: calendarCount } = await supabase
          .from('calendars')
          .select('*', { count: 'exact', head: true })
          .eq('connection_id', connection.id)

        // Get event count
        const { count: eventCount } = await supabase
          .from('calendar_events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('calendar_id', 
            supabase
              .from('calendars')
              .select('id')
              .eq('connection_id', connection.id)
          )

        return {
          id: connection.id,
          provider: connection.provider,
          accountEmail: connection.account_email,
          accountName: connection.account_name,
          isActive: connection.is_active,
          syncStatus: connection.sync_status,
          lastSyncAt: connection.last_sync_at,
          calendars: calendarCount || 0,
          events: eventCount || 0
        }
      })
    )

    return NextResponse.json({ 
      connections: connectionsWithStats 
    })
  } catch (error) {
    console.error('Calendar connections error:', error)
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
    
    // For CalDAV connections
    if (body.provider === 'CALDAV') {
      const { serverUrl, username, password } = body

      if (!serverUrl || !username || !password) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Test CalDAV connection
      // In a real implementation, you would validate the CalDAV server here
      
      // Save connection
      const { data: connection, error: dbError } = await supabase
        .from('calendar_connections')
        .insert({
          user_id: user.id,
          provider: 'CALDAV',
          provider_account_id: username,
          account_email: username,
          account_name: `CalDAV - ${new URL(serverUrl).hostname}`,
          access_token: password, // Should be encrypted
          provider_data: {
            serverUrl,
            username
          },
          is_active: true,
          sync_enabled: true
        })
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save CalDAV connection:', dbError)
        return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true,
        connection: {
          id: connection.id,
          provider: connection.provider,
          accountEmail: connection.account_email
        }
      })
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  } catch (error) {
    console.error('Calendar connection create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}