-- =============================================
-- INTEGRATIONS & SYNC INFRASTRUCTURE
-- =============================================
-- This migration creates the integration management system
-- for connecting with 100+ external services

-- Master integration credentials vault (encrypted)
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Provider identification
  provider TEXT NOT NULL,
  provider_category TEXT CHECK (provider_category IN (
    'FINANCIAL', 'HEALTH', 'AUTOMOTIVE', 'SMART_HOME', 
    'CAREER', 'EDUCATION', 'SOCIAL', 'GOVERNMENT'
  )),
  
  -- OAuth tokens (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  token_type TEXT,
  scope TEXT,
  
  -- API credentials (encrypted)
  api_key TEXT,
  api_secret TEXT,
  webhook_secret TEXT,
  
  -- Additional auth data
  auth_metadata JSONB, -- Provider-specific auth data
  
  -- Connection status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'PAUSED', 'ERROR', 'REVOKED', 'EXPIRED'
  )),
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  
  -- Sync configuration
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_frequency TEXT DEFAULT 'DAILY' CHECK (sync_frequency IN (
    'REALTIME', 'EVERY_5_MIN', 'EVERY_15_MIN', 'HOURLY', 
    'EVERY_6_HOURS', 'DAILY', 'WEEKLY', 'MANUAL'
  )),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_successful_sync TIMESTAMPTZ,
  
  UNIQUE(user_id, provider)
);

-- Integration sync history
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integration_credentials(id) ON DELETE CASCADE,
  
  -- Sync details
  provider TEXT NOT NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'FULL', 'INCREMENTAL', 'WEBHOOK', 'MANUAL', 'SCHEDULED'
  )),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL'
  )),
  
  -- Metrics
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Data processed
  records_fetched INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Error handling
  error_message TEXT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  
  -- Metadata
  sync_metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook event processing
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  provider TEXT NOT NULL,
  event_id TEXT,
  event_type TEXT,
  
  -- Delivery
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Payload
  headers JSONB,
  body JSONB,
  signature TEXT,
  
  -- Processing
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'IGNORED'
  )),
  
  -- User association
  user_id UUID REFERENCES public.users(id),
  integration_id UUID REFERENCES public.integration_credentials(id),
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API rate limiting tracking
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  provider TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id),
  integration_id UUID REFERENCES public.integration_credentials(id),
  
  -- Window
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  
  -- Counters
  request_count INTEGER DEFAULT 0,
  
  -- Limits
  rate_limit INTEGER,
  rate_limit_remaining INTEGER,
  rate_limit_reset TIMESTAMPTZ,
  
  -- Quota tracking
  daily_quota_used INTEGER DEFAULT 0,
  daily_quota_limit INTEGER,
  monthly_quota_used INTEGER DEFAULT 0,
  monthly_quota_limit INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider, user_id, window_start)
);

-- Data mapping configurations
CREATE TABLE IF NOT EXISTS public.data_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Provider
  provider TEXT NOT NULL,
  provider_version TEXT,
  
  -- Mapping details
  source_model TEXT NOT NULL,
  target_table TEXT NOT NULL,
  
  -- Field mappings
  field_mappings JSONB NOT NULL, -- {source_field: target_field}
  
  -- Transformations
  transformations JSONB, -- Custom transformation rules
  
  -- Validation
  validation_rules JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration health monitoring
CREATE TABLE IF NOT EXISTS public.integration_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integration_credentials(id),
  
  -- Health metrics
  health_score DECIMAL(3,2), -- 0-1 score
  uptime_percentage DECIMAL(5,2),
  
  -- Performance
  avg_sync_duration_ms INTEGER,
  avg_records_per_sync INTEGER,
  
  -- Error metrics
  error_rate DECIMAL(5,2),
  last_error_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  
  -- Calculated at
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider configurations
CREATE TABLE IF NOT EXISTS public.integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Provider details
  provider_code TEXT UNIQUE NOT NULL,
  provider_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- API configuration
  base_url TEXT,
  auth_type TEXT CHECK (auth_type IN (
    'OAUTH2', 'OAUTH1', 'API_KEY', 'BASIC', 'CUSTOM'
  )),
  oauth_authorize_url TEXT,
  oauth_token_url TEXT,
  
  -- Features
  supported_features TEXT[], -- ['accounts', 'transactions', 'real_time']
  
  -- Rate limits
  rate_limit_requests_per_minute INTEGER,
  rate_limit_requests_per_day INTEGER,
  
  -- Data refresh
  min_refresh_interval TEXT,
  
  -- Documentation
  documentation_url TEXT,
  icon_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_beta BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User integration permissions
CREATE TABLE IF NOT EXISTS public.integration_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integration_credentials(id),
  
  -- Permissions granted
  granted_scopes TEXT[],
  
  -- Data access levels
  read_access BOOLEAN DEFAULT TRUE,
  write_access BOOLEAN DEFAULT FALSE,
  delete_access BOOLEAN DEFAULT FALSE,
  
  -- Specific permissions
  access_financial_data BOOLEAN DEFAULT FALSE,
  access_health_data BOOLEAN DEFAULT FALSE,
  access_location_data BOOLEAN DEFAULT FALSE,
  access_personal_data BOOLEAN DEFAULT FALSE,
  
  -- Consent
  consent_given_at TIMESTAMPTZ DEFAULT NOW(),
  consent_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration queue for async processing
CREATE TABLE IF NOT EXISTS public.integration_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Task details
  integration_id UUID NOT NULL REFERENCES public.integration_credentials(id),
  task_type TEXT NOT NULL CHECK (task_type IN (
    'SYNC', 'WEBHOOK', 'REFRESH_TOKEN', 'VALIDATE', 'CLEANUP'
  )),
  
  -- Priority
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'
  )),
  
  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  worker_id TEXT,
  
  -- Payload
  payload JSONB,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own integrations" ON public.integration_credentials
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync logs" ON public.integration_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own webhook events" ON public.webhook_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rate limits" ON public.api_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view integration health" ON public.integration_health
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.integration_credentials ic
      WHERE ic.id = integration_id AND ic.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage integration permissions" ON public.integration_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.integration_credentials ic
      WHERE ic.id = integration_id AND ic.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage queue" ON public.integration_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.integration_credentials ic
      WHERE ic.id = integration_id AND ic.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_integration_creds_user_provider ON public.integration_credentials(user_id, provider);
CREATE INDEX idx_integration_creds_status ON public.integration_credentials(status) WHERE status != 'ACTIVE';
CREATE INDEX idx_sync_logs_user_date ON public.integration_sync_logs(user_id, started_at DESC);
CREATE INDEX idx_sync_logs_integration ON public.integration_sync_logs(integration_id, started_at DESC);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status) WHERE status = 'PENDING';
CREATE INDEX idx_webhook_events_provider ON public.webhook_events(provider, received_at DESC);
CREATE INDEX idx_rate_limits_provider_window ON public.api_rate_limits(provider, window_start);
CREATE INDEX idx_integration_queue_status ON public.integration_queue(status, scheduled_for) WHERE status = 'PENDING';

-- Create triggers
CREATE TRIGGER update_integration_creds_updated_at 
  BEFORE UPDATE ON public.integration_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_mappings_updated_at 
  BEFORE UPDATE ON public.data_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for integration management
CREATE OR REPLACE FUNCTION refresh_integration_health()
RETURNS void AS $$
DECLARE
  integration RECORD;
BEGIN
  FOR integration IN 
    SELECT id FROM integration_credentials WHERE status = 'ACTIVE'
  LOOP
    INSERT INTO integration_health (
      integration_id,
      health_score,
      uptime_percentage,
      avg_sync_duration_ms,
      error_rate
    )
    SELECT 
      integration.id,
      CASE 
        WHEN COUNT(*) = 0 THEN 1
        ELSE (COUNT(*) FILTER (WHERE status = 'COMPLETED'))::decimal / COUNT(*)
      END as health_score,
      CASE 
        WHEN COUNT(*) = 0 THEN 100
        ELSE (COUNT(*) FILTER (WHERE status = 'COMPLETED'))::decimal / COUNT(*) * 100
      END as uptime_percentage,
      AVG(duration_ms) as avg_sync_duration_ms,
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE status = 'FAILED'))::decimal / COUNT(*) * 100
      END as error_rate
    FROM integration_sync_logs
    WHERE integration_id = integration.id
      AND started_at > NOW() - INTERVAL '7 days';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to queue sync task
CREATE OR REPLACE FUNCTION queue_integration_sync(
  p_integration_id UUID,
  p_sync_type TEXT DEFAULT 'INCREMENTAL',
  p_priority INTEGER DEFAULT 5
) RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
BEGIN
  INSERT INTO integration_queue (
    integration_id,
    task_type,
    priority,
    payload
  ) VALUES (
    p_integration_id,
    'SYNC',
    p_priority,
    jsonb_build_object('sync_type', p_sync_type)
  ) RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql;