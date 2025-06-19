-- =============================================
-- COMPLETE HEALTHCARE DOMAIN SCHEMA
-- =============================================
-- This migration creates all healthcare tables including
-- EHR integration, wearables, insurance, and wellness tracking

-- Health profiles with genetic data support
CREATE TABLE IF NOT EXISTS public.health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic health info
  blood_type TEXT,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  bmi DECIMAL(4,2),
  resting_heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  
  -- Medical history flags
  has_allergies BOOLEAN DEFAULT FALSE,
  has_chronic_conditions BOOLEAN DEFAULT FALSE,
  has_medications BOOLEAN DEFAULT FALSE,
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_organ_donor BOOLEAN DEFAULT FALSE,
  
  -- Emergency info
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  preferred_hospital TEXT,
  preferred_hospital_address JSONB,
  
  -- Genetic data (encrypted)
  genetic_data JSONB, -- 23andMe, AncestryDNA data
  genetic_health_risks JSONB,
  pharmacogenomics JSONB, -- Drug response predictions
  
  -- Lifestyle factors
  smoking_status TEXT CHECK (smoking_status IN ('NEVER', 'FORMER', 'CURRENT')),
  alcohol_consumption TEXT CHECK (alcohol_consumption IN ('NONE', 'LIGHT', 'MODERATE', 'HEAVY')),
  exercise_frequency TEXT CHECK (exercise_frequency IN ('NONE', 'OCCASIONAL', 'REGULAR', 'DAILY')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive health records from EHR systems
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Source information
  provider TEXT NOT NULL, -- 'epic', 'cerner', 'allscripts'
  provider_organization TEXT,
  
  -- FHIR Resource
  resource_type TEXT NOT NULL, -- 'Condition', 'Procedure', 'Medication', etc.
  fhir_id TEXT,
  fhir_version TEXT DEFAULT 'R4',
  
  -- Record details
  record_date DATE NOT NULL,
  status TEXT,
  category TEXT,
  code TEXT, -- ICD-10, CPT, etc.
  code_system TEXT,
  display_name TEXT NOT NULL,
  
  -- Clinical data
  clinical_data JSONB, -- Full FHIR resource
  extracted_data JSONB, -- Simplified data
  severity TEXT CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL')),
  body_site TEXT,
  
  -- Provider info
  practitioner_name TEXT,
  practitioner_id TEXT,
  facility_name TEXT,
  facility_id TEXT,
  
  -- Attachments
  attachments JSONB, -- [{type, url, description}]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical conditions tracking
CREATE TABLE IF NOT EXISTS public.medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Condition details
  condition_name TEXT NOT NULL,
  icd10_code TEXT,
  snomed_code TEXT,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'RESOLVED', 'REMISSION')),
  severity TEXT CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE')),
  
  -- Dates
  onset_date DATE,
  diagnosis_date DATE,
  resolution_date DATE,
  
  -- Clinical details
  diagnosed_by TEXT,
  symptoms TEXT[],
  triggers TEXT[],
  
  -- Management
  treatment_plan TEXT,
  medications UUID[], -- References to medications table
  lifestyle_modifications TEXT[],
  monitoring_frequency TEXT,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications management
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Drug information
  drug_name TEXT NOT NULL,
  generic_name TEXT,
  brand_name TEXT,
  ndc_code TEXT,
  rxnorm_code TEXT,
  
  -- Prescription details
  dosage TEXT NOT NULL,
  dosage_unit TEXT,
  frequency TEXT,
  route TEXT CHECK (route IN ('ORAL', 'INJECTION', 'TOPICAL', 'INHALATION', 'OTHER')),
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  days_supply INTEGER,
  refills_remaining INTEGER,
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISCONTINUED', 'COMPLETED')),
  discontinuation_reason TEXT,
  
  -- Prescriber
  prescriber_name TEXT,
  prescriber_npi TEXT,
  pharmacy_name TEXT,
  pharmacy_phone TEXT,
  
  -- Adherence tracking
  adherence_percentage DECIMAL(5,2),
  missed_doses INTEGER DEFAULT 0,
  last_taken_at TIMESTAMPTZ,
  
  -- Side effects
  reported_side_effects TEXT[],
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  
  -- Interactions
  drug_interactions JSONB,
  food_interactions TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allergies and sensitivities
CREATE TABLE IF NOT EXISTS public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Allergy details
  allergen_type TEXT CHECK (allergen_type IN ('DRUG', 'FOOD', 'ENVIRONMENTAL', 'OTHER')),
  allergen_name TEXT NOT NULL,
  
  -- Reaction
  reaction_type TEXT[] CHECK (reaction_type <@ ARRAY['HIVES', 'ANAPHYLAXIS', 'RASH', 'BREATHING', 'GI', 'OTHER']),
  severity TEXT CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING')),
  
  -- Dates
  onset_date DATE,
  confirmed_date DATE,
  
  -- Testing
  confirmed_by_test BOOLEAN DEFAULT FALSE,
  test_type TEXT,
  
  -- Management
  treatment_plan TEXT,
  emergency_medication TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab results
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Order info
  order_id TEXT,
  order_date DATE,
  collection_date DATE,
  result_date DATE,
  
  -- Provider
  ordering_provider TEXT,
  lab_name TEXT,
  lab_id TEXT,
  
  -- Test details
  test_name TEXT NOT NULL,
  loinc_code TEXT,
  panel_name TEXT,
  
  -- Results
  value TEXT,
  numeric_value DECIMAL(20,4),
  unit TEXT,
  reference_range TEXT,
  flag TEXT CHECK (flag IN ('NORMAL', 'HIGH', 'LOW', 'CRITICAL')),
  
  -- Interpretation
  interpretation TEXT,
  clinical_significance TEXT,
  
  -- Report
  report_url TEXT, -- S3 URL
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immunizations
CREATE TABLE IF NOT EXISTS public.immunizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Vaccine info
  vaccine_name TEXT NOT NULL,
  cvx_code TEXT,
  vaccine_group TEXT,
  
  -- Administration
  administration_date DATE NOT NULL,
  dose_number INTEGER,
  series_complete BOOLEAN DEFAULT FALSE,
  
  -- Provider
  administering_provider TEXT,
  facility_name TEXT,
  
  -- Details
  lot_number TEXT,
  expiration_date DATE,
  body_site TEXT,
  route TEXT,
  
  -- Next dose
  next_dose_due DATE,
  
  -- Reactions
  adverse_reaction BOOLEAN DEFAULT FALSE,
  reaction_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare appointments
CREATE TABLE IF NOT EXISTS public.healthcare_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Provider
  provider_name TEXT NOT NULL,
  provider_specialty TEXT,
  provider_npi TEXT,
  facility_name TEXT,
  facility_address JSONB,
  facility_phone TEXT,
  
  -- Appointment details
  appointment_type TEXT CHECK (appointment_type IN ('ROUTINE', 'FOLLOW_UP', 'URGENT', 'PROCEDURE', 'TELEHEALTH')),
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  
  -- Status
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  
  -- Reason
  reason_for_visit TEXT,
  symptoms TEXT[],
  chief_complaint TEXT,
  
  -- Preparation
  preparation_instructions TEXT,
  fasting_required BOOLEAN DEFAULT FALSE,
  
  -- Results
  visit_summary TEXT,
  diagnosis_codes TEXT[],
  procedure_codes TEXT[],
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Billing
  copay_amount DECIMAL(10,2),
  total_charge DECIMAL(10,2),
  insurance_claim_id TEXT,
  
  -- Telehealth
  is_telehealth BOOLEAN DEFAULT FALSE,
  video_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wearable device data (partitioned by date)
CREATE TABLE IF NOT EXISTS public.wearable_data (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Source
  device_type TEXT NOT NULL CHECK (device_type IN ('APPLE_WATCH', 'FITBIT', 'GARMIN', 'OURA', 'WHOOP', 'OTHER')),
  device_id TEXT,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL,
  sync_date DATE NOT NULL,
  
  -- Vital signs
  heart_rate INTEGER,
  heart_rate_variability INTEGER,
  respiratory_rate INTEGER,
  blood_oxygen DECIMAL(4,2),
  body_temperature DECIMAL(4,2),
  
  -- Activity
  steps INTEGER,
  distance_meters DECIMAL(10,2),
  floors_climbed INTEGER,
  active_minutes INTEGER,
  calories_burned INTEGER,
  exercise_type TEXT,
  
  -- Sleep
  sleep_start TIMESTAMPTZ,
  sleep_end TIMESTAMPTZ,
  sleep_duration_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  sleep_quality_score INTEGER,
  
  -- Stress & Recovery
  stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 100),
  recovery_score INTEGER CHECK (recovery_score BETWEEN 0 AND 100),
  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
  
  -- Environmental
  noise_level_db DECIMAL(5,2),
  light_exposure_lux INTEGER,
  uv_exposure INTEGER,
  
  PRIMARY KEY (id, sync_date),
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (sync_date);

-- Create monthly partitions for wearable data (example)
CREATE TABLE wearable_data_2024_01 PARTITION OF wearable_data
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE wearable_data_2024_02 PARTITION OF wearable_data
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Continue for additional months...

-- Health metrics aggregation
CREATE TABLE IF NOT EXISTS public.health_metrics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Aggregated vitals
  avg_heart_rate INTEGER,
  min_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_blood_pressure_systolic INTEGER,
  avg_blood_pressure_diastolic INTEGER,
  
  -- Activity summary
  total_steps INTEGER,
  total_distance_km DECIMAL(10,2),
  total_active_minutes INTEGER,
  total_calories_burned INTEGER,
  
  -- Sleep summary
  total_sleep_minutes INTEGER,
  sleep_efficiency DECIMAL(5,2),
  avg_sleep_quality INTEGER,
  
  -- Wellness scores
  overall_health_score INTEGER,
  activity_score INTEGER,
  sleep_score INTEGER,
  readiness_score INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Mental health tracking
CREATE TABLE IF NOT EXISTS public.mental_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Date and time
  log_date DATE NOT NULL,
  log_time TIME,
  
  -- Mood and emotions
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  emotions TEXT[],
  
  -- Mental health metrics
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  depression_score INTEGER CHECK (depression_score BETWEEN 1 AND 10),
  
  -- Physical symptoms
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  appetite_level INTEGER CHECK (appetite_level BETWEEN 1 AND 10),
  
  -- Context
  triggers TEXT[],
  activities TEXT[],
  social_interactions TEXT,
  
  -- Coping
  coping_strategies_used TEXT[],
  medication_taken BOOLEAN DEFAULT FALSE,
  therapy_session BOOLEAN DEFAULT FALSE,
  
  -- Notes
  journal_entry TEXT,
  gratitude_list TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition tracking
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Meal info
  meal_type TEXT CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
  logged_at TIMESTAMPTZ NOT NULL,
  
  -- Nutrition totals
  total_calories INTEGER,
  protein_g DECIMAL(10,2),
  carbs_g DECIMAL(10,2),
  fat_g DECIMAL(10,2),
  fiber_g DECIMAL(10,2),
  sugar_g DECIMAL(10,2),
  sodium_mg DECIMAL(10,2),
  
  -- Water intake
  water_ml INTEGER,
  
  -- Food items
  food_items JSONB, -- [{name, quantity, calories, nutrients}]
  
  -- Photo
  meal_photo_url TEXT,
  
  -- AI analysis
  healthiness_score INTEGER CHECK (healthiness_score BETWEEN 1 AND 10),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own health profile" ON public.health_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own health records" ON public.health_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conditions" ON public.medical_conditions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medications" ON public.medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own allergies" ON public.allergies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lab results" ON public.lab_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own immunizations" ON public.immunizations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own appointments" ON public.healthcare_appointments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wearable data" ON public.wearable_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health metrics" ON public.health_metrics_summary
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own mental health logs" ON public.mental_health_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own nutrition logs" ON public.nutrition_logs
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_health_profiles_user ON public.health_profiles(user_id);
CREATE INDEX idx_health_records_user_date ON public.health_records(user_id, record_date DESC);
CREATE INDEX idx_health_records_type ON public.health_records(resource_type, user_id);
CREATE INDEX idx_medical_conditions_user_status ON public.medical_conditions(user_id, status);
CREATE INDEX idx_medications_user_status ON public.medications(user_id, status);
CREATE INDEX idx_allergies_user ON public.allergies(user_id);
CREATE INDEX idx_lab_results_user_date ON public.lab_results(user_id, result_date DESC);
CREATE INDEX idx_appointments_user_date ON public.healthcare_appointments(user_id, appointment_date);
CREATE INDEX idx_wearable_data_user_date ON public.wearable_data(user_id, sync_date DESC);
CREATE INDEX idx_health_metrics_user_date ON public.health_metrics_summary(user_id, metric_date DESC);
CREATE INDEX idx_mental_health_user_date ON public.mental_health_logs(user_id, log_date DESC);
CREATE INDEX idx_nutrition_user_date ON public.nutrition_logs(user_id, logged_at DESC);

-- Create update triggers
CREATE TRIGGER update_health_profiles_updated_at 
  BEFORE UPDATE ON public.health_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at 
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_conditions_updated_at 
  BEFORE UPDATE ON public.medical_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at 
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at 
  BEFORE UPDATE ON public.allergies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON public.healthcare_appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();