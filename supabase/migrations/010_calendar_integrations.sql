-- =============================================
-- CALENDAR INTEGRATIONS
-- =============================================
-- Comprehensive calendar integration system for multiple providers

-- Calendar providers enum
CREATE TYPE calendar_provider AS ENUM (
  'GOOGLE',
  'OUTLOOK',
  'OFFICE365',
  'APPLE',
  'YAHOO',
  'CALDAV',
  'EXCHANGE',
  'OTHER'
);

-- Calendar sync status
CREATE TYPE calendar_sync_status AS ENUM (
  'ACTIVE',
  'SYNCING',
  'ERROR',
  'PAUSED',
  'DISCONNECTED'
);

-- Event visibility
CREATE TYPE event_visibility AS ENUM (
  'PUBLIC',
  'PRIVATE',
  'CONFIDENTIAL'
);

-- Connected calendar accounts
CREATE TABLE IF NOT EXISTS public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Provider information
  provider calendar_provider NOT NULL,
  provider_account_id TEXT NOT NULL, -- Provider's unique account ID
  account_email TEXT NOT NULL,
  account_name TEXT,
  
  -- OAuth tokens (encrypted)
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMPTZ,
  
  -- Connection settings
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_frequency_minutes INTEGER DEFAULT 15,
  
  -- Sync configuration
  sync_past_days INTEGER DEFAULT 365,
  sync_future_days INTEGER DEFAULT 365,
  sync_all_calendars BOOLEAN DEFAULT TRUE,
  excluded_calendar_ids TEXT[],
  
  -- Sync status
  sync_status calendar_sync_status DEFAULT 'ACTIVE',
  last_sync_at TIMESTAMPTZ,
  last_sync_error TEXT,
  next_sync_at TIMESTAMPTZ,
  
  -- Metadata
  provider_data JSONB, -- Provider-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, provider, provider_account_id)
);

-- Individual calendars from connected accounts
CREATE TABLE IF NOT EXISTS public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.calendar_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Calendar information
  provider_calendar_id TEXT NOT NULL, -- Provider's calendar ID
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#4285F4',
  
  -- Calendar settings
  is_visible BOOLEAN DEFAULT TRUE,
  is_synced BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  is_readonly BOOLEAN DEFAULT FALSE,
  
  -- Access and sharing
  access_role TEXT, -- owner, writer, reader
  is_shared BOOLEAN DEFAULT FALSE,
  share_url TEXT,
  
  -- Sync settings
  last_synced_at TIMESTAMPTZ,
  sync_token TEXT, -- For incremental sync
  
  -- Metadata
  timezone TEXT,
  location TEXT,
  provider_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(connection_id, provider_calendar_id)
);

-- Calendar events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Event identifiers
  provider_event_id TEXT NOT NULL,
  uid TEXT, -- iCalendar UID
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  
  -- Time information
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  timezone TEXT,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE format
  recurrence_id TEXT, -- For recurring event instances
  original_start_time TIMESTAMPTZ, -- For exceptions
  
  -- Event properties
  status TEXT, -- confirmed, tentative, cancelled
  visibility event_visibility DEFAULT 'PUBLIC',
  transparency TEXT, -- opaque, transparent
  
  -- Attendees and organizer
  organizer JSONB,
  attendees JSONB[],
  attendee_count INTEGER DEFAULT 0,
  
  -- Reminders
  reminders JSONB[], -- Array of reminder objects
  
  -- Links and attachments
  html_link TEXT,
  conference_data JSONB,
  attachments JSONB[],
  
  -- Categories and tags
  categories TEXT[],
  provider_categories TEXT[],
  
  -- Sync metadata
  etag TEXT,
  sequence INTEGER DEFAULT 0,
  created TIMESTAMPTZ,
  updated TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Local modifications
  is_modified_locally BOOLEAN DEFAULT FALSE,
  local_changes JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(calendar_id, provider_event_id)
);

-- Calendar sync queue
CREATE TABLE IF NOT EXISTS public.calendar_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.calendar_connections(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('FULL', 'INCREMENTAL', 'WEBHOOK')),
  priority INTEGER DEFAULT 5,
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Error tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  
  -- Timing
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar webhooks for real-time updates
CREATE TABLE IF NOT EXISTS public.calendar_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.calendar_connections(id) ON DELETE CASCADE,
  
  -- Webhook configuration
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT, -- For webhook validation
  resource_id TEXT, -- Provider's resource ID
  channel_id TEXT, -- Provider's channel ID
  
  -- Webhook state
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  
  -- Provider-specific data
  provider_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(connection_id, resource_id)
);

-- Calendar integration logs
CREATE TABLE IF NOT EXISTS public.calendar_integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.calendar_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Log details
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  
  -- Metrics
  events_synced INTEGER DEFAULT 0,
  calendars_synced INTEGER DEFAULT 0,
  duration_ms INTEGER,
  
  -- Error information
  error_message TEXT,
  error_details JSONB,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_calendar_connections_user ON public.calendar_connections(user_id);
CREATE INDEX idx_calendar_connections_sync_status ON public.calendar_connections(sync_status);
CREATE INDEX idx_calendar_connections_next_sync ON public.calendar_connections(next_sync_at) WHERE sync_enabled = TRUE;

CREATE INDEX idx_calendars_connection ON public.calendars(connection_id);
CREATE INDEX idx_calendars_user ON public.calendars(user_id);
CREATE INDEX idx_calendars_visible ON public.calendars(user_id, is_visible) WHERE is_visible = TRUE;

CREATE INDEX idx_calendar_events_calendar ON public.calendar_events(calendar_id);
CREATE INDEX idx_calendar_events_user ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_datetime ON public.calendar_events(user_id, start_datetime, end_datetime);
CREATE INDEX idx_calendar_events_provider ON public.calendar_events(calendar_id, provider_event_id);

CREATE INDEX idx_calendar_sync_queue_status ON public.calendar_sync_queue(status, scheduled_for) WHERE status = 'PENDING';
CREATE INDEX idx_calendar_webhooks_connection ON public.calendar_webhooks(connection_id);
CREATE INDEX idx_calendar_webhooks_expires ON public.calendar_webhooks(expires_at) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own calendar connections" ON public.calendar_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calendars" ON public.calendars
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "System can manage sync queue" ON public.calendar_sync_queue
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM public.calendar_connections WHERE id = connection_id
  ));

CREATE POLICY "System can manage webhooks" ON public.calendar_webhooks
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM public.calendar_connections WHERE id = connection_id
  ));

CREATE POLICY "Users can view own logs" ON public.calendar_integration_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_calendar_connections_updated_at 
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at 
  BEFORE UPDATE ON public.calendars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at 
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to schedule calendar sync
CREATE OR REPLACE FUNCTION schedule_calendar_sync(
  p_connection_id UUID,
  p_sync_type TEXT DEFAULT 'INCREMENTAL'
) RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO public.calendar_sync_queue (
    connection_id,
    sync_type,
    scheduled_for
  ) VALUES (
    p_connection_id,
    p_sync_type,
    NOW()
  ) RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
) RETURNS TABLE (
  event_id UUID,
  title TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  calendar_name TEXT,
  calendar_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.start_datetime,
    e.end_datetime,
    c.name,
    c.color
  FROM public.calendar_events e
  JOIN public.calendars c ON e.calendar_id = c.id
  WHERE e.user_id = p_user_id
    AND c.is_visible = TRUE
    AND e.start_datetime >= NOW()
    AND e.start_datetime <= NOW() + INTERVAL '1 day' * p_days
    AND e.status != 'cancelled'
  ORDER BY e.start_datetime;
END;
$$ LANGUAGE plpgsql;