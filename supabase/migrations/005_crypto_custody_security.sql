-- =============================================
-- SECURE CRYPTO CUSTODY & WALLET SYSTEM
-- =============================================
-- Enterprise-grade cryptocurrency custody with maximum security
-- NEVER store private keys in the database!

-- Master crypto wallet management
CREATE TABLE IF NOT EXISTS public.crypto_custody_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Wallet classification
  wallet_type TEXT NOT NULL CHECK (wallet_type IN (
    'HOT', 'WARM', 'COLD', 'HARDWARE', 'MULTISIG'
  )),
  wallet_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Security level
  security_level TEXT NOT NULL CHECK (security_level IN (
    'BASIC', 'ENHANCED', 'MAXIMUM'
  )),
  requires_hardware_key BOOLEAN DEFAULT FALSE,
  requires_multisig BOOLEAN DEFAULT FALSE,
  multisig_threshold INTEGER, -- M of N signatures required
  multisig_total INTEGER,
  
  -- Wallet metadata (NOT the actual keys!)
  wallet_provider TEXT, -- 'native', 'ledger', 'trezor', 'metamask', 'walletconnect'
  derivation_path TEXT, -- for HD wallets
  
  -- Security features
  time_lock_enabled BOOLEAN DEFAULT FALSE,
  time_lock_hours INTEGER,
  daily_limit_enabled BOOLEAN DEFAULT FALSE,
  daily_limit_usd DECIMAL(15,2),
  whitelist_only BOOLEAN DEFAULT FALSE,
  
  -- Backup status
  backup_status TEXT CHECK (backup_status IN (
    'NOT_BACKED_UP', 'BACKED_UP', 'VERIFIED'
  )),
  backup_method TEXT CHECK (backup_method IN (
    'SHAMIR_SHARES', 'ENCRYPTED_SEED', 'HARDWARE_BACKUP', 'MULTISIG'
  )),
  last_backup_verified TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hierarchical Deterministic (HD) wallet structure
CREATE TABLE IF NOT EXISTS public.hd_wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id) ON DELETE CASCADE,
  
  -- HD wallet specifics
  account_index INTEGER NOT NULL,
  account_name TEXT,
  derivation_path TEXT NOT NULL,
  
  -- Public key only (never store private keys!)
  public_key TEXT NOT NULL,
  extended_public_key TEXT, -- xpub for account discovery
  
  -- Blockchain specifics
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('MAINNET', 'TESTNET')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(wallet_id, account_index, blockchain)
);

-- Individual crypto addresses
CREATE TABLE IF NOT EXISTS public.crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.hd_wallet_accounts(id) ON DELETE CASCADE,
  
  -- Address details
  address TEXT NOT NULL,
  address_type TEXT CHECK (address_type IN (
    'RECEIVING', 'CHANGE', 'CONTRACT'
  )),
  address_index INTEGER,
  
  -- Usage tracking
  is_used BOOLEAN DEFAULT FALSE,
  first_seen_block BIGINT,
  last_seen_block BIGINT,
  transaction_count INTEGER DEFAULT 0,
  
  -- Labels and organization
  label TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(address, account_id)
);

-- Distributed key shares (Shamir's Secret Sharing)
CREATE TABLE IF NOT EXISTS public.key_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id) ON DELETE CASCADE,
  
  -- Share information (NOT the actual share data!)
  share_index INTEGER NOT NULL,
  share_custodian TEXT NOT NULL CHECK (share_custodian IN (
    'USER_DEVICE', 'TRUSTED_CONTACT', 'LAWYER', 'SAFETY_DEPOSIT', 'CLOUD_HSM'
  )),
  custodian_identifier TEXT, -- encrypted reference
  
  -- Security
  share_encrypted_location TEXT, -- where it's stored (not the share itself)
  requires_2fa BOOLEAN DEFAULT TRUE,
  requires_biometric BOOLEAN DEFAULT TRUE,
  
  -- Recovery info
  recovery_instructions TEXT, -- encrypted
  last_verified TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(wallet_id, share_index)
);

-- Hardware wallet integration
CREATE TABLE IF NOT EXISTS public.hardware_wallet_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.crypto_custody_wallets(id),
  
  -- Device info
  device_type TEXT NOT NULL CHECK (device_type IN (
    'LEDGER_NANO_X', 'LEDGER_NANO_S', 'TREZOR_MODEL_T', 
    'TREZOR_ONE', 'COLDCARD', 'KEEPKEY', 'BITBOX'
  )),
  device_id TEXT, -- encrypted device identifier
  firmware_version TEXT,
  
  -- Security status
  is_genuine_verified BOOLEAN DEFAULT FALSE,
  last_genuine_check TIMESTAMPTZ,
  pin_attempts_remaining INTEGER,
  
  -- Features
  supports_coins TEXT[],
  supports_u2f BOOLEAN DEFAULT FALSE,
  supports_fido2 BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-signature wallet participants
CREATE TABLE IF NOT EXISTS public.multisig_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id) ON DELETE CASCADE,
  
  -- Participant details
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  participant_phone TEXT,
  public_key TEXT NOT NULL,
  key_derivation_path TEXT,
  
  -- Signing authority
  can_initiate BOOLEAN DEFAULT TRUE,
  can_approve BOOLEAN DEFAULT TRUE,
  required_for_large_tx BOOLEAN DEFAULT FALSE,
  spending_limit_usd DECIMAL(15,2),
  
  -- Notification preferences
  notify_on_pending BOOLEAN DEFAULT TRUE,
  notify_on_complete BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending crypto transactions requiring approval
CREATE TABLE IF NOT EXISTS public.crypto_pending_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id),
  initiated_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Transaction details
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount_crypto DECIMAL(30,18) NOT NULL,
  amount_usd_at_creation DECIMAL(15,2),
  blockchain TEXT NOT NULL,
  token_contract TEXT, -- for tokens
  token_symbol TEXT,
  
  -- Fee details
  network_fee_crypto DECIMAL(30,18),
  network_fee_usd DECIMAL(10,2),
  priority_level TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  
  -- Security checks
  is_whitelisted_address BOOLEAN,
  risk_score DECIMAL(3,2),
  risk_factors TEXT[],
  aml_check_status TEXT CHECK (aml_check_status IN (
    'PENDING', 'PASSED', 'FLAGGED', 'BLOCKED'
  )),
  
  -- Approval workflow
  approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN (
    'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'
  )),
  approvals_required INTEGER,
  approvals_received INTEGER DEFAULT 0,
  rejection_reason TEXT,
  
  -- Time constraints
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  
  -- Transaction execution
  signed_transaction TEXT, -- encrypted
  broadcast_at TIMESTAMPTZ,
  transaction_hash TEXT,
  block_number BIGINT,
  confirmations INTEGER DEFAULT 0,
  gas_used BIGINT,
  gas_price_gwei DECIMAL(10,2),
  
  -- Metadata
  memo TEXT,
  internal_reference TEXT
);

-- Transaction approval log
CREATE TABLE IF NOT EXISTS public.crypto_transaction_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_transaction_id UUID NOT NULL REFERENCES public.crypto_pending_transactions(id),
  approver_id UUID NOT NULL REFERENCES public.users(id),
  
  action TEXT NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
  signature TEXT, -- cryptographic signature
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Security context
  ip_address INET,
  device_fingerprint TEXT,
  auth_method TEXT CHECK (auth_method IN (
    '2FA', 'HARDWARE_KEY', 'BIOMETRIC', 'MULTIFACTOR'
  )),
  
  -- Comments
  comment TEXT
);

-- Whitelisted addresses
CREATE TABLE IF NOT EXISTS public.crypto_whitelist_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Address details
  address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  address_label TEXT NOT NULL,
  address_type TEXT CHECK (address_type IN (
    'PERSONAL', 'EXCHANGE', 'DEFI', 'BUSINESS', 'CHARITY'
  )),
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT CHECK (verification_method IN (
    'MICRO_TRANSACTION', 'SIGNED_MESSAGE', 'MANUAL', 'ENS'
  )),
  verified_at TIMESTAMPTZ,
  verification_signature TEXT,
  
  -- Security
  requires_2fa BOOLEAN DEFAULT TRUE,
  daily_limit_usd DECIMAL(15,2),
  transaction_count_limit INTEGER,
  
  -- Risk assessment
  risk_score DECIMAL(3,2),
  risk_factors TEXT[],
  last_risk_check TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, address, blockchain)
);

-- Cold storage locations and methods
CREATE TABLE IF NOT EXISTS public.cold_storage_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id),
  
  -- Vault details
  vault_name TEXT NOT NULL,
  storage_method TEXT NOT NULL CHECK (storage_method IN (
    'PAPER_WALLET', 'STEEL_PLATE', 'HARDWARE_OFFLINE', 
    'BANK_VAULT', 'DISTRIBUTED_CUSTODY'
  )),
  
  -- Location info (encrypted)
  location_hint TEXT, -- "Bank of America Safety Deposit Box #123"
  access_instructions TEXT, -- encrypted detailed instructions
  
  -- Security measures
  requires_dual_control BOOLEAN DEFAULT FALSE,
  secondary_auth_person UUID REFERENCES public.family_members(id),
  tamper_evident_seal TEXT, -- seal number/code
  
  -- Environmental protection
  fireproof_rating TEXT,
  waterproof_rating TEXT,
  emp_protected BOOLEAN DEFAULT FALSE,
  
  -- Verification
  last_audit_date DATE,
  next_audit_due DATE,
  audit_photos_url TEXT[], -- encrypted S3 URLs
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper wallet management
CREATE TABLE IF NOT EXISTS public.paper_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES public.cold_storage_vaults(id) ON DELETE CASCADE,
  
  -- DO NOT STORE PRIVATE KEYS! Only metadata
  public_address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  
  -- Security features
  is_bip38_encrypted BOOLEAN DEFAULT TRUE,
  has_passphrase BOOLEAN DEFAULT TRUE,
  qr_code_split BOOLEAN DEFAULT FALSE, -- split across multiple QR codes
  uses_sss BOOLEAN DEFAULT FALSE, -- Shamir's Secret Sharing
  
  -- Physical security
  paper_type TEXT CHECK (paper_type IN (
    'ARCHIVAL', 'WATERPROOF', 'FIREPROOF', 'METAL_ETCHED'
  )),
  laminated BOOLEAN DEFAULT TRUE,
  copies_count INTEGER DEFAULT 1,
  copies_locations TEXT[], -- encrypted hints
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crypto inheritance planning
CREATE TABLE IF NOT EXISTS public.crypto_inheritance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id),
  beneficiary_id UUID NOT NULL,
  
  -- Inheritance details
  percentage_share DECIMAL(5,2),
  
  -- Time-locked smart contract info (if applicable)
  smart_contract_address TEXT,
  unlock_conditions TEXT CHECK (unlock_conditions IN (
    'DEATH_CERTIFICATE', 'INACTIVITY_180_DAYS', 'SPECIFIC_DATE', 
    'MULTI_CONDITION'
  )),
  unlock_date DATE,
  inactivity_period_days INTEGER,
  
  -- Instructions
  recovery_instructions TEXT, -- encrypted
  lawyer_contact JSONB, -- encrypted
  
  -- Dead man's switch
  last_proof_of_life TIMESTAMPTZ,
  proof_of_life_frequency_days INTEGER DEFAULT 90,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DeFi protocol interactions
CREATE TABLE IF NOT EXISTS public.defi_protocol_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id) ON DELETE CASCADE,
  
  -- Protocol details
  protocol_name TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN (
    'LENDING', 'DEX', 'YIELD', 'STAKING', 'DERIVATIVES', 'INSURANCE'
  )),
  chain TEXT NOT NULL,
  contract_addresses JSONB,
  
  -- Connection info
  is_active BOOLEAN DEFAULT TRUE,
  connection_method TEXT CHECK (connection_method IN (
    'WALLETCONNECT', 'METAMASK', 'DIRECT', 'HARDWARE'
  )),
  session_data TEXT, -- encrypted
  
  -- Risk management
  approved_operations TEXT[],
  approved_spend_limit DECIMAL(30,18),
  requires_2fa_for_operations BOOLEAN DEFAULT TRUE,
  interaction_count INTEGER DEFAULT 0,
  total_value_interacted DECIMAL(15,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart contract interaction logs
CREATE TABLE IF NOT EXISTS public.smart_contract_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id),
  
  -- Contract details
  contract_address TEXT NOT NULL,
  contract_name TEXT,
  function_called TEXT,
  function_signature TEXT,
  
  -- Transaction info
  transaction_hash TEXT,
  from_address TEXT,
  value_eth DECIMAL(30,18),
  gas_used BIGINT,
  gas_price_gwei DECIMAL(10,2),
  
  -- Parameters
  input_data TEXT,
  decoded_params JSONB,
  
  -- Risk assessment
  is_verified_contract BOOLEAN,
  contract_risk_score DECIMAL(3,2),
  risk_flags TEXT[],
  
  -- Outcome
  status TEXT CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REVERTED')),
  revert_reason TEXT,
  
  interaction_time TIMESTAMPTZ DEFAULT NOW()
);

-- NFT custody
CREATE TABLE IF NOT EXISTS public.nft_custody (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id) ON DELETE CASCADE,
  
  -- NFT details
  contract_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  token_standard TEXT, -- 'ERC721', 'ERC1155', 'SPL'
  
  -- Metadata
  name TEXT,
  description TEXT,
  image_url TEXT,
  animation_url TEXT,
  external_url TEXT,
  metadata_url TEXT,
  attributes JSONB,
  
  -- Collection info
  collection_name TEXT,
  collection_slug TEXT,
  
  -- Value tracking
  mint_price DECIMAL(30,18),
  mint_currency TEXT,
  current_floor_price DECIMAL(30,18),
  last_sale_price DECIMAL(30,18),
  estimated_value_usd DECIMAL(15,2),
  
  -- Rarity
  rarity_score DECIMAL(10,4),
  rarity_rank INTEGER,
  
  -- Storage
  is_staked BOOLEAN DEFAULT FALSE,
  staking_contract TEXT,
  staking_rewards_earned DECIMAL(30,18),
  
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contract_address, token_id, blockchain)
);

-- Blockchain address monitoring
CREATE TABLE IF NOT EXISTS public.address_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Monitoring settings
  monitor_incoming BOOLEAN DEFAULT TRUE,
  monitor_outgoing BOOLEAN DEFAULT TRUE,
  monitor_contract_calls BOOLEAN DEFAULT TRUE,
  monitor_token_transfers BOOLEAN DEFAULT TRUE,
  
  -- Alert thresholds
  alert_threshold_usd DECIMAL(15,2),
  alert_unusual_activity BOOLEAN DEFAULT TRUE,
  alert_new_tokens BOOLEAN DEFAULT TRUE,
  
  -- Monitoring status
  is_active BOOLEAN DEFAULT TRUE,
  last_checked TIMESTAMPTZ,
  last_block_scanned BIGINT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(address, blockchain, user_id)
);

-- Security incidents
CREATE TABLE IF NOT EXISTS public.crypto_security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.crypto_custody_wallets(id),
  
  -- Incident details
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'SUSPICIOUS_TX', 'FAILED_AUTH', 'UNUSUAL_PATTERN', 
    'PHISHING_ATTEMPT', 'UNAUTHORIZED_ACCESS', 'KEY_COMPROMISE'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT,
  
  -- Context
  related_addresses TEXT[],
  related_transactions TEXT[],
  amount_at_risk DECIMAL(15,2),
  
  -- Response
  action_taken TEXT,
  addresses_frozen BOOLEAN DEFAULT FALSE,
  funds_recovered DECIMAL(15,2),
  resolved BOOLEAN DEFAULT FALSE,
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Crypto portfolio insurance
CREATE TABLE IF NOT EXISTS public.crypto_insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Policy details
  provider TEXT NOT NULL,
  policy_number TEXT,
  coverage_type TEXT CHECK (coverage_type IN (
    'THEFT', 'LOSS', 'HACK', 'ALL_RISK', 'KEY_LOSS'
  )),
  
  -- Coverage amounts
  coverage_limit_usd DECIMAL(15,2),
  deductible_usd DECIMAL(10,2),
  coverage_per_incident DECIMAL(15,2),
  
  -- Covered assets
  covered_wallets UUID[], -- references to wallet IDs
  covered_protocols TEXT[],
  covered_blockchains TEXT[],
  
  -- Exclusions
  exclusions TEXT[],
  
  -- Policy terms
  start_date DATE,
  end_date DATE,
  premium_annual DECIMAL(10,2),
  premium_crypto_accepted BOOLEAN DEFAULT FALSE,
  
  -- Claims
  claims_made INTEGER DEFAULT 0,
  total_claimed DECIMAL(15,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted backup metadata (NOT actual keys!)
CREATE TABLE IF NOT EXISTS public.crypto_backup_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id),
  
  -- Backup info
  backup_method TEXT NOT NULL CHECK (backup_method IN (
    'SHAMIR', 'MULTISIG', 'TIMELOCK', 'SOCIAL_RECOVERY', 'HYBRID'
  )),
  backup_version INTEGER DEFAULT 1,
  
  -- Shamir's Secret Sharing
  total_shares INTEGER,
  threshold_shares INTEGER,
  
  -- Share distribution
  share_locations JSONB, -- encrypted hints about where shares are stored
  
  -- Verification
  last_recovery_test TIMESTAMPTZ,
  test_successful BOOLEAN,
  recovery_time_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social recovery guardians
CREATE TABLE IF NOT EXISTS public.recovery_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.crypto_custody_wallets(id),
  
  -- Guardian info
  guardian_name TEXT NOT NULL,
  guardian_email TEXT,
  guardian_phone TEXT,
  relationship TEXT,
  
  -- Recovery authority
  can_initiate_recovery BOOLEAN DEFAULT FALSE,
  approval_weight INTEGER DEFAULT 1,
  
  -- Security
  guardian_public_key TEXT,
  verification_method TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  last_verification TIMESTAMPTZ,
  
  -- Notifications
  notify_on_recovery_init BOOLEAN DEFAULT TRUE,
  notification_method TEXT DEFAULT 'EMAIL',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.crypto_custody_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hd_wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_wallet_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multisig_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_pending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transaction_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_whitelist_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_storage_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_inheritance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defi_protocol_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contract_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.address_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_backup_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_guardians ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own crypto wallets" ON public.crypto_custody_wallets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view wallet accounts" ON public.hd_wallet_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.crypto_custody_wallets w
      WHERE w.id = wallet_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view crypto addresses" ON public.crypto_addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hd_wallet_accounts a
      JOIN public.crypto_custody_wallets w ON a.wallet_id = w.id
      WHERE a.id = account_id AND w.user_id = auth.uid()
    )
  );

-- Continue with similar policies for other tables...

-- Create indexes for performance
CREATE INDEX idx_crypto_wallets_user ON public.crypto_custody_wallets(user_id);
CREATE INDEX idx_crypto_wallets_type ON public.crypto_custody_wallets(wallet_type, security_level);
CREATE INDEX idx_hd_accounts_wallet ON public.hd_wallet_accounts(wallet_id);
CREATE INDEX idx_crypto_addresses_account ON public.crypto_addresses(account_id);
CREATE INDEX idx_pending_tx_wallet_status ON public.crypto_pending_transactions(wallet_id, approval_status);
CREATE INDEX idx_whitelist_user_blockchain ON public.crypto_whitelist_addresses(user_id, blockchain);
CREATE INDEX idx_nft_wallet ON public.nft_custody(wallet_id);
CREATE INDEX idx_monitoring_user_active ON public.address_monitoring(user_id, is_active);

-- Create triggers
CREATE TRIGGER update_crypto_wallets_updated_at 
  BEFORE UPDATE ON public.crypto_custody_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for critical tables
CREATE TRIGGER audit_crypto_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.crypto_pending_transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_crypto_approvals
  AFTER INSERT ON public.crypto_transaction_approvals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();