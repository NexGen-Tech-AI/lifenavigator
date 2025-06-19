-- =============================================
-- INFRASTRUCTURE MONITORING & SECURITY LOGGING
-- =============================================
-- Company-wide monitoring for cybersecurity and analytics

-- System access logs
CREATE TABLE IF NOT EXISTS public.system_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Information
  request_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- User/Client Information
  user_id UUID REFERENCES public.users(id),
  api_key_id UUID REFERENCES public.user_api_keys(id),
  service_account TEXT,
  
  -- Network Information
  ip_address INET NOT NULL,
  ip_country TEXT,
  ip_region TEXT,
  ip_city TEXT,
  ip_isp TEXT,
  ip_type TEXT CHECK (ip_type IN (
    'RESIDENTIAL', 'COMMERCIAL', 'HOSTING', 'VPN', 'TOR', 'PROXY'
  )),
  
  -- Request Details
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params JSONB,
  headers JSONB,
  user_agent TEXT,
  referer TEXT,
  
  -- Response
  status_code INTEGER,
  response_time_ms INTEGER,
  response_size_bytes BIGINT,
  
  -- Security Analysis
  threat_score INTEGER DEFAULT 0, -- 0-100
  is_suspicious BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  
  -- Geo-location
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location_accuracy_meters INTEGER,
  
  -- Device Fingerprint
  device_fingerprint TEXT,
  device_type TEXT,
  os_family TEXT,
  os_version TEXT,
  browser_family TEXT,
  browser_version TEXT,
  
  -- Session Context
  session_id TEXT,
  is_authenticated BOOLEAN DEFAULT FALSE,
  auth_method TEXT,
  
  -- Performance Metrics
  backend_time_ms INTEGER,
  database_time_ms INTEGER,
  
  -- Compliance
  contains_pii BOOLEAN DEFAULT FALSE,
  gdpr_relevant BOOLEAN DEFAULT FALSE,
  
  -- Partitioning by date
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (id, log_date)
) PARTITION BY RANGE (log_date);

-- Create monthly partitions
CREATE TABLE system_access_logs_2024_01 PARTITION OF system_access_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE system_access_logs_2024_02 PARTITION OF system_access_logs
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Security events and incidents
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event Information
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'BRUTE_FORCE', 'SQL_INJECTION', 'XSS_ATTEMPT', 'CSRF_ATTEMPT',
    'UNAUTHORIZED_ACCESS', 'PRIVILEGE_ESCALATION', 'DATA_EXFILTRATION',
    'MALWARE_DETECTED', 'DDOS_ATTACK', 'ACCOUNT_TAKEOVER', 'SUSPICIOUS_ACTIVITY'
  )),
  severity TEXT NOT NULL CHECK (severity IN (
    'INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  )),
  
  -- Source
  source_ip INET,
  source_user_id UUID REFERENCES public.users(id),
  source_session_id TEXT,
  target_resource TEXT,
  
  -- Event Details
  description TEXT NOT NULL,
  attack_vector TEXT,
  payload TEXT,
  
  -- Detection
  detection_method TEXT CHECK (detection_method IN (
    'RULE_BASED', 'ANOMALY', 'SIGNATURE', 'BEHAVIORAL', 'ML_MODEL'
  )),
  detection_rule_id TEXT,
  confidence_score DECIMAL(3,2),
  
  -- Response
  action_taken TEXT CHECK (action_taken IN (
    'LOGGED', 'BLOCKED', 'RATE_LIMITED', 'CHALLENGED', 'BANNED', 'ESCALATED'
  )),
  blocked BOOLEAN DEFAULT FALSE,
  
  -- Investigation
  investigated BOOLEAN DEFAULT FALSE,
  investigator_id UUID,
  investigation_notes TEXT,
  false_positive BOOLEAN DEFAULT FALSE,
  
  -- Impact
  affected_users INTEGER DEFAULT 0,
  data_accessed TEXT[],
  estimated_damage TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application performance monitoring
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric Information
  metric_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'API_LATENCY', 'DATABASE_QUERY', 'CACHE_HIT', 'ERROR_RATE',
    'THROUGHPUT', 'CPU_USAGE', 'MEMORY_USAGE', 'DISK_IO'
  )),
  
  -- Context
  service_name TEXT NOT NULL,
  endpoint TEXT,
  operation TEXT,
  
  -- Measurements
  value DECIMAL(20,4) NOT NULL,
  unit TEXT NOT NULL,
  
  -- Percentiles (for latency metrics)
  p50 DECIMAL(10,2),
  p90 DECIMAL(10,2),
  p95 DECIMAL(10,2),
  p99 DECIMAL(10,2),
  
  -- Metadata
  tags JSONB,
  
  -- Aggregation
  sample_count INTEGER DEFAULT 1,
  sum_value DECIMAL(20,4),
  min_value DECIMAL(20,4),
  max_value DECIMAL(20,4),
  
  -- Time window for aggregation
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (id, metric_date)
) PARTITION BY RANGE (metric_date);

-- Create monthly partitions
CREATE TABLE performance_metrics_2024_01 PARTITION OF performance_metrics
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Error Information
  error_timestamp TIMESTAMPTZ DEFAULT NOW(),
  error_id TEXT UNIQUE NOT NULL,
  
  -- Error Details
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_code TEXT,
  stack_trace TEXT,
  
  -- Context
  service_name TEXT,
  environment TEXT CHECK (environment IN (
    'DEVELOPMENT', 'STAGING', 'PRODUCTION'
  )),
  version TEXT,
  
  -- User Context
  user_id UUID REFERENCES public.users(id),
  session_id TEXT,
  request_id TEXT,
  
  -- Request Context
  url TEXT,
  method TEXT,
  headers JSONB,
  body JSONB,
  query_params JSONB,
  
  -- System Context
  server_name TEXT,
  server_ip INET,
  
  -- Grouping
  fingerprint TEXT, -- For grouping similar errors
  occurrence_count INTEGER DEFAULT 1,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  
  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  resolution_notes TEXT,
  
  -- Impact
  affected_users INTEGER DEFAULT 1,
  severity TEXT CHECK (severity IN (
    'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage analytics
CREATE TABLE IF NOT EXISTS public.api_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Window
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  granularity TEXT CHECK (granularity IN (
    'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH'
  )),
  
  -- Dimensions
  user_id UUID REFERENCES public.users(id),
  api_key_id UUID REFERENCES public.user_api_keys(id),
  endpoint TEXT,
  method TEXT,
  
  -- Metrics
  request_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Response Times
  total_response_time_ms BIGINT DEFAULT 0,
  avg_response_time_ms INTEGER,
  min_response_time_ms INTEGER,
  max_response_time_ms INTEGER,
  
  -- Data Transfer
  total_request_bytes BIGINT DEFAULT 0,
  total_response_bytes BIGINT DEFAULT 0,
  
  -- Error Breakdown
  error_4xx_count INTEGER DEFAULT 0,
  error_5xx_count INTEGER DEFAULT 0,
  
  -- Rate Limiting
  rate_limited_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(window_start, window_end, user_id, endpoint, method)
);

-- Infrastructure health checks
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Check Information
  check_timestamp TIMESTAMPTZ DEFAULT NOW(),
  check_name TEXT NOT NULL,
  check_type TEXT CHECK (check_type IN (
    'PING', 'HTTP', 'DATABASE', 'CACHE', 'QUEUE', 'STORAGE', 'CUSTOM'
  )),
  
  -- Target
  target_name TEXT NOT NULL,
  target_url TEXT,
  
  -- Result
  status TEXT CHECK (status IN (
    'HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN'
  )),
  response_time_ms INTEGER,
  
  -- Details
  status_code INTEGER,
  error_message TEXT,
  metadata JSONB,
  
  -- Thresholds
  warning_threshold_ms INTEGER,
  critical_threshold_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traffic analytics
CREATE TABLE IF NOT EXISTS public.traffic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Window
  analytics_date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  
  -- Traffic Source
  source TEXT CHECK (source IN (
    'DIRECT', 'ORGANIC', 'REFERRAL', 'SOCIAL', 'EMAIL', 'PAID', 'OTHER'
  )),
  medium TEXT,
  campaign TEXT,
  
  -- User Metrics
  unique_visitors INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  
  -- Engagement Metrics
  pageviews INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER,
  bounce_rate DECIMAL(5,2),
  
  -- Conversion Metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  -- Geographic
  country TEXT,
  region TEXT,
  city TEXT,
  
  -- Technology
  device_category TEXT CHECK (device_category IN (
    'DESKTOP', 'MOBILE', 'TABLET'
  )),
  browser TEXT,
  os TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(analytics_date, hour, source, country, device_category)
);

-- DDoS protection logs
CREATE TABLE IF NOT EXISTS public.ddos_protection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Attack Information
  attack_start TIMESTAMPTZ NOT NULL,
  attack_end TIMESTAMPTZ,
  attack_type TEXT CHECK (attack_type IN (
    'VOLUMETRIC', 'PROTOCOL', 'APPLICATION', 'MIXED'
  )),
  
  -- Source
  source_ips INET[],
  source_countries TEXT[],
  botnet_signature TEXT,
  
  -- Target
  target_endpoints TEXT[],
  target_services TEXT[],
  
  -- Metrics
  peak_requests_per_second INTEGER,
  total_requests BIGINT,
  blocked_requests BIGINT,
  
  -- Mitigation
  mitigation_triggered BOOLEAN DEFAULT FALSE,
  mitigation_rules TEXT[],
  mitigation_effectiveness DECIMAL(5,2),
  
  -- Impact
  service_degradation BOOLEAN DEFAULT FALSE,
  estimated_legitimate_requests_blocked INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance audit logs
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Audit Information
  audit_timestamp TIMESTAMPTZ DEFAULT NOW(),
  audit_type TEXT CHECK (audit_type IN (
    'DATA_ACCESS', 'DATA_MODIFICATION', 'DATA_DELETION',
    'PERMISSION_CHANGE', 'CONFIGURATION_CHANGE', 'SECURITY_EVENT'
  )),
  
  -- Actor
  actor_id UUID REFERENCES public.users(id),
  actor_role TEXT,
  actor_ip INET,
  
  -- Resource
  resource_type TEXT,
  resource_id TEXT,
  resource_name TEXT,
  
  -- Action
  action TEXT NOT NULL,
  action_result TEXT CHECK (action_result IN (
    'SUCCESS', 'FAILURE', 'PARTIAL'
  )),
  
  -- Data Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Compliance
  regulation TEXT CHECK (regulation IN (
    'HIPAA', 'GDPR', 'SOC2', 'PCI_DSS', 'CCPA'
  )),
  data_classification TEXT CHECK (data_classification IN (
    'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'
  )),
  
  -- Retention
  retention_required_until DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time alerts configuration
CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Alert Configuration
  alert_name TEXT NOT NULL,
  alert_type TEXT CHECK (alert_type IN (
    'THRESHOLD', 'ANOMALY', 'PATTERN', 'ABSENCE'
  )),
  
  -- Conditions
  metric_name TEXT NOT NULL,
  condition TEXT CHECK (condition IN (
    'GREATER_THAN', 'LESS_THAN', 'EQUALS', 'NOT_EQUALS', 'CONTAINS'
  )),
  threshold_value DECIMAL(20,4),
  time_window_minutes INTEGER,
  
  -- Notification
  severity TEXT CHECK (severity IN (
    'INFO', 'WARNING', 'ERROR', 'CRITICAL'
  )),
  notification_channels TEXT[],
  notification_recipients TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  -- Cooldown
  cooldown_minutes INTEGER DEFAULT 5,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_access_logs_timestamp ON system_access_logs(timestamp DESC, log_date);
CREATE INDEX idx_access_logs_ip ON system_access_logs(ip_address, log_date);
CREATE INDEX idx_access_logs_user ON system_access_logs(user_id, log_date) WHERE user_id IS NOT NULL;
CREATE INDEX idx_access_logs_suspicious ON system_access_logs(log_date, is_suspicious) WHERE is_suspicious = TRUE;

CREATE INDEX idx_security_events_timestamp ON security_events(event_timestamp DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity, event_timestamp DESC) WHERE severity IN ('HIGH', 'CRITICAL');
CREATE INDEX idx_security_events_user ON security_events(source_user_id) WHERE source_user_id IS NOT NULL;

CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(metric_timestamp DESC, metric_date);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type, service_name, metric_date);

CREATE INDEX idx_error_logs_timestamp ON error_logs(error_timestamp DESC);
CREATE INDEX idx_error_logs_fingerprint ON error_logs(fingerprint) WHERE resolved = FALSE;
CREATE INDEX idx_error_logs_user ON error_logs(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_api_usage_window ON api_usage_stats(window_start, window_end);
CREATE INDEX idx_api_usage_user ON api_usage_stats(user_id, window_start) WHERE user_id IS NOT NULL;

CREATE INDEX idx_traffic_date ON traffic_analytics(analytics_date DESC);
CREATE INDEX idx_compliance_audit_timestamp ON compliance_audit_logs(audit_timestamp DESC);
CREATE INDEX idx_compliance_audit_regulation ON compliance_audit_logs(regulation, audit_timestamp DESC);

-- Create triggers
CREATE TRIGGER update_monitoring_alerts_updated_at 
  BEFORE UPDATE ON public.monitoring_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create aggregation functions
CREATE OR REPLACE FUNCTION aggregate_api_usage(
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_granularity TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO api_usage_stats (
    window_start, window_end, granularity,
    user_id, endpoint, method,
    request_count, success_count, error_count,
    total_response_time_ms, avg_response_time_ms,
    min_response_time_ms, max_response_time_ms
  )
  SELECT 
    p_start_time, p_end_time, p_granularity,
    user_id, path, method,
    COUNT(*),
    COUNT(*) FILTER (WHERE status_code < 400),
    COUNT(*) FILTER (WHERE status_code >= 400),
    SUM(response_time_ms),
    AVG(response_time_ms)::INTEGER,
    MIN(response_time_ms),
    MAX(response_time_ms)
  FROM system_access_logs
  WHERE timestamp >= p_start_time 
    AND timestamp < p_end_time
  GROUP BY user_id, path, method
  ON CONFLICT (window_start, window_end, user_id, endpoint, method)
  DO UPDATE SET
    request_count = EXCLUDED.request_count,
    success_count = EXCLUDED.success_count,
    error_count = EXCLUDED.error_count,
    total_response_time_ms = EXCLUDED.total_response_time_ms,
    avg_response_time_ms = EXCLUDED.avg_response_time_ms,
    min_response_time_ms = EXCLUDED.min_response_time_ms,
    max_response_time_ms = EXCLUDED.max_response_time_ms;
END;
$$ LANGUAGE plpgsql;

-- Create monitoring views
CREATE OR REPLACE VIEW current_system_health AS
SELECT 
  'API Availability' as metric,
  CASE 
    WHEN error_rate < 0.01 THEN 'HEALTHY'
    WHEN error_rate < 0.05 THEN 'DEGRADED'
    ELSE 'UNHEALTHY'
  END as status,
  ROUND((1 - error_rate) * 100, 2) || '%' as value
FROM (
  SELECT 
    COUNT(*) FILTER (WHERE status_code >= 500)::float / NULLIF(COUNT(*), 0) as error_rate
  FROM system_access_logs
  WHERE timestamp > NOW() - INTERVAL '5 minutes'
) api_stats
UNION ALL
SELECT 
  'Average Response Time',
  CASE 
    WHEN avg_response < 100 THEN 'HEALTHY'
    WHEN avg_response < 500 THEN 'DEGRADED'
    ELSE 'UNHEALTHY'
  END,
  avg_response || 'ms'
FROM (
  SELECT AVG(response_time_ms)::integer as avg_response
  FROM system_access_logs
  WHERE timestamp > NOW() - INTERVAL '5 minutes'
) response_stats
UNION ALL
SELECT 
  'Active Threats',
  CASE 
    WHEN threat_count = 0 THEN 'HEALTHY'
    WHEN threat_count < 10 THEN 'DEGRADED'
    ELSE 'UNHEALTHY'
  END,
  threat_count::text
FROM (
  SELECT COUNT(*) as threat_count
  FROM security_events
  WHERE event_timestamp > NOW() - INTERVAL '1 hour'
    AND severity IN ('HIGH', 'CRITICAL')
    AND NOT false_positive
) threat_stats;