-- =============================================
-- FAMILY, PETS, AND DOCUMENT ENHANCEMENTS
-- =============================================
-- This migration extends the family functionality with pets
-- and enhances document storage to support associations
-- =============================================

-- =============================================
-- PETS TABLE
-- =============================================

-- Pets table for managing family pets
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN (
    'DOG', 'CAT', 'BIRD', 'FISH', 'RABBIT', 'HAMSTER', 'GUINEA_PIG', 
    'REPTILE', 'HORSE', 'OTHER'
  )),
  breed TEXT,
  color TEXT,
  
  -- Details
  date_of_birth DATE,
  age_years INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN date_of_birth IS NOT NULL 
      THEN DATE_PART('year', AGE(CURRENT_DATE, date_of_birth))::INTEGER
      ELSE NULL
    END
  ) STORED,
  weight_lbs DECIMAL(6,2),
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'UNKNOWN')),
  is_neutered BOOLEAN DEFAULT FALSE,
  
  -- Identification
  microchip_id TEXT UNIQUE,
  license_number TEXT,
  
  -- Health
  last_vet_visit DATE,
  next_vet_visit DATE,
  vaccination_status TEXT CHECK (vaccination_status IN (
    'UP_TO_DATE', 'DUE_SOON', 'OVERDUE', 'UNKNOWN'
  )) DEFAULT 'UNKNOWN',
  
  -- Care
  primary_vet_name TEXT,
  primary_vet_phone TEXT,
  dietary_restrictions TEXT[],
  current_medications JSONB DEFAULT '[]', -- Array of {name, dosage, frequency}
  allergies TEXT[],
  
  -- Insurance
  has_insurance BOOLEAN DEFAULT FALSE,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  
  -- Status
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'LOST', 'DECEASED', 'REHOMED'
  )),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet health records
CREATE TABLE IF NOT EXISTS public.pet_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  -- Record Info
  record_type TEXT NOT NULL CHECK (record_type IN (
    'VET_VISIT', 'VACCINATION', 'MEDICATION', 'SURGERY', 'LAB_RESULT',
    'PRESCRIPTION', 'EMERGENCY', 'OTHER'
  )),
  record_date DATE NOT NULL,
  
  -- Provider
  provider_name TEXT,
  provider_type TEXT CHECK (provider_type IN (
    'VETERINARIAN', 'EMERGENCY_CLINIC', 'SPECIALIST', 'GROOMER', 'OTHER'
  )),
  
  -- Details
  description TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  
  -- Medications
  medications_prescribed JSONB DEFAULT '[]',
  
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Cost
  cost DECIMAL(10,2),
  insurance_claim_filed BOOLEAN DEFAULT FALSE,
  insurance_claim_amount DECIMAL(10,2),
  
  -- Documents
  document_ids UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENHANCED FAMILY MEMBERS
-- =============================================

-- Add additional fields to family_members
ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
ADD COLUMN IF NOT EXISTS emergency_contact BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- =============================================
-- DOCUMENT ASSOCIATIONS
-- =============================================

-- Add entity association to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN (
  'USER', 'FAMILY_MEMBER', 'PET', 'PROPERTY', 'VEHICLE'
)) DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN (
  -- General
  'IDENTIFICATION', 'LEGAL', 'FINANCIAL', 'TAX', 'INSURANCE',
  -- Healthcare
  'MEDICAL', 'PRESCRIPTION', 'LAB_RESULT', 'IMMUNIZATION',
  -- Pet specific
  'PET_MEDICAL', 'PET_LICENSE', 'PET_INSURANCE',
  -- Family specific
  'BIRTH_CERTIFICATE', 'MARRIAGE_CERTIFICATE', 'DIVORCE_DECREE',
  'ADOPTION_PAPERS', 'SCHOOL_RECORDS', 'REPORT_CARDS',
  -- Other
  'EMPLOYMENT', 'PROPERTY', 'VEHICLE', 'WARRANTY', 'OTHER'
)),
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Create index for entity associations
CREATE INDEX IF NOT EXISTS idx_documents_entity 
ON public.documents(entity_type, entity_id);

-- Create index for tags
CREATE INDEX IF NOT EXISTS idx_documents_tags 
ON public.documents USING GIN(tags);

-- =============================================
-- DOCUMENT ACCESS PERMISSIONS
-- =============================================

-- Document access permissions for family members
CREATE TABLE IF NOT EXISTS public.document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  -- Permission target
  permission_type TEXT NOT NULL CHECK (permission_type IN (
    'FAMILY_MEMBER', 'SHARED_USER', 'PUBLIC_LINK'
  )),
  target_id UUID, -- family_member_id or user_id
  
  -- Access level
  access_level TEXT NOT NULL CHECK (access_level IN (
    'VIEW', 'DOWNLOAD', 'EDIT', 'DELETE'
  )) DEFAULT 'VIEW',
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Access tracking
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- =============================================
-- EMERGENCY CONTACTS
-- =============================================

-- Enhanced emergency contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Contact can be a family member or external
  family_member_id UUID REFERENCES public.family_members(id),
  
  -- External contact info (if not family member)
  name TEXT,
  relationship TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  email TEXT,
  
  -- Priority
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
  
  -- Context
  contact_for TEXT[] DEFAULT '{}', -- ['MEDICAL', 'FINANCIAL', 'LEGAL', 'CHILDREN', 'PETS']
  
  -- Notes
  special_instructions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either family_member_id or name is provided
  CONSTRAINT emergency_contact_source CHECK (
    family_member_id IS NOT NULL OR name IS NOT NULL
  )
);

-- =============================================
-- INDEXES
-- =============================================

-- Pets indexes
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_status ON public.pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_next_vet_visit ON public.pets(next_vet_visit);

-- Pet health records indexes
CREATE INDEX IF NOT EXISTS idx_pet_health_records_pet_id ON public.pet_health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_health_records_date ON public.pet_health_records(record_date DESC);

-- Document permissions indexes
CREATE INDEX IF NOT EXISTS idx_document_permissions_document_id ON public.document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_target ON public.document_permissions(permission_type, target_id);

-- Emergency contacts indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON public.emergency_contacts(priority);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on new tables
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Pets policies
CREATE POLICY "Users can view their own pets" ON public.pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" ON public.pets
  FOR DELETE USING (auth.uid() = user_id);

-- Pet health records policies
CREATE POLICY "Users can manage pet health records" ON public.pet_health_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_health_records.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Document permissions policies
CREATE POLICY "Users can manage document permissions" ON public.document_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = document_permissions.document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Emergency contacts policies
CREATE POLICY "Users can view their own emergency contacts" ON public.emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emergency contacts" ON public.emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update triggers for new tables
CREATE TRIGGER update_pets_updated_at 
  BEFORE UPDATE ON public.pets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_health_records_updated_at 
  BEFORE UPDATE ON public.pet_health_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at 
  BEFORE UPDATE ON public.emergency_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check upcoming pet appointments
CREATE OR REPLACE FUNCTION get_upcoming_pet_appointments(
  user_id_param UUID,
  days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  pet_id UUID,
  pet_name TEXT,
  appointment_date DATE,
  days_until INTEGER,
  appointment_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.next_vet_visit,
    (p.next_vet_visit - CURRENT_DATE)::INTEGER,
    'VET_VISIT'::TEXT
  FROM public.pets p
  WHERE p.user_id = user_id_param
    AND p.status = 'ACTIVE'
    AND p.next_vet_visit IS NOT NULL
    AND p.next_vet_visit BETWEEN CURRENT_DATE AND CURRENT_DATE + (days_ahead || ' days')::INTERVAL
  ORDER BY p.next_vet_visit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get family member documents
CREATE OR REPLACE FUNCTION get_family_documents(
  user_id_param UUID,
  family_member_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  document_id UUID,
  document_name TEXT,
  document_type TEXT,
  category TEXT,
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.document_name,
    d.document_type,
    d.category,
    d.entity_type,
    d.entity_id,
    CASE 
      WHEN d.entity_type = 'FAMILY_MEMBER' THEN fm.first_name || ' ' || COALESCE(fm.last_name, '')
      WHEN d.entity_type = 'PET' THEN p.name
      ELSE 'Personal'
    END AS entity_name,
    d.created_at
  FROM public.documents d
  LEFT JOIN public.family_members fm ON d.entity_type = 'FAMILY_MEMBER' AND d.entity_id = fm.id
  LEFT JOIN public.pets p ON d.entity_type = 'PET' AND d.entity_id = p.id
  WHERE d.user_id = user_id_param
    AND (family_member_id_param IS NULL OR d.entity_id = family_member_id_param)
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SAMPLE DATA (DEVELOPMENT ONLY)
-- =============================================

-- Note: Comment out or remove this section in production
/*
-- Sample pet for demo user
INSERT INTO public.pets (user_id, name, species, breed, date_of_birth, weight_lbs, gender, is_neutered, microchip_id, last_vet_visit, next_vet_visit)
SELECT 
  id, 
  'Max', 
  'DOG', 
  'Golden Retriever', 
  CURRENT_DATE - INTERVAL '5 years',
  70.5,
  'MALE',
  true,
  '985141405428756',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '6 months'
FROM public.users 
WHERE email = 'demo@lifenavigator.ai'
ON CONFLICT DO NOTHING;
*/