-- Create the RevokedToken table
CREATE TABLE "revoked_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    
    CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("id")
);

-- Create the UserDevice table
CREATE TABLE "user_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationName" TEXT,
    
    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- Create the SecurityAuditLog table
CREATE TABLE "security_audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX "revoked_tokens_jti_idx" ON "revoked_tokens"("jti");
CREATE INDEX "revoked_tokens_userId_idx" ON "revoked_tokens"("userId");
CREATE INDEX "user_devices_userId_idx" ON "user_devices"("userId");
CREATE INDEX "user_devices_deviceId_idx" ON "user_devices"("deviceId");
CREATE INDEX "security_audit_log_userId_idx" ON "security_audit_log"("userId");
CREATE INDEX "security_audit_log_eventType_idx" ON "security_audit_log"("eventType");

-- Add unique constraints
CREATE UNIQUE INDEX "user_devices_userId_deviceId_key" ON "user_devices"("userId", "deviceId");
CREATE UNIQUE INDEX "revoked_tokens_jti_key" ON "revoked_tokens"("jti");

-- Add foreign key relationships
ALTER TABLE "revoked_tokens" ADD CONSTRAINT "revoked_tokens_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "security_audit_log" ADD CONSTRAINT "security_audit_log_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;