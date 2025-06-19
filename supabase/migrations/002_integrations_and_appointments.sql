-- Add missing tables for integrations and appointments

-- OAuth states for CSRF protection
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- External integrations (Google, Plaid, etc.)
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'microsoft', 'plaid', etc.
  provider_account_id TEXT,
  provider_email TEXT,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_synced TIMESTAMPTZ,
  sync_status TEXT,
  sync_error TEXT,
  last_email_scan TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Calendar events from integrations
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  google_event_id TEXT,
  outlook_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  event_type TEXT, -- 'HEALTHCARE', 'FINANCIAL', 'CAREER', 'EDUCATION', 'OTHER'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, google_event_id),
  UNIQUE(user_id, outlook_event_id)
);

-- Email documents found by scanning
CREATE TABLE IF NOT EXISTS public.email_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gmail_message_id TEXT,
  outlook_message_id TEXT,
  subject TEXT NOT NULL,
  sender TEXT NOT NULL,
  received_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL, -- 'BILL', 'BANK_STATEMENT', 'CREDIT_CARD_STATEMENT', etc.
  attachments JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  document_id UUID REFERENCES public.documents(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gmail_message_id),
  UNIQUE(user_id, outlook_message_id)
);

-- Healthcare appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'DOCTOR', 'DENTIST', 'SPECIALIST', etc.
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  virtual_meeting_url TEXT,
  reason TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  reminder_settings JSONB,
  calendar_event_id UUID REFERENCES public.calendar_events(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment reminders
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'DAY_BEFORE', 'HOUR_BEFORE', 'CUSTOM'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  channels JSONB, -- {email: true, sms: false, push: true}
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync queue for background jobs
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  attempts INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Plaid webhook events table (if not exists)
CREATE TABLE IF NOT EXISTS public.plaid_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plaid_item_id UUID NOT NULL REFERENCES public.plaid_items(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL,
  webhook_code TEXT NOT NULL,
  item_id TEXT NOT NULL,
  error JSONB,
  new_transactions INTEGER,
  removed_transactions TEXT[],
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_email_documents_user_id ON public.email_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_email_documents_category ON public.email_documents(category);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_scheduled ON public.appointment_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own oauth states" ON public.oauth_states
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calendar events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own email documents" ON public.email_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON public.appointment_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage reminders" ON public.appointment_reminders
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can manage own sync queue" ON public.sync_queue
  FOR ALL USING (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();