-- Migration: Enhance freelancers table for marketplace functionality
-- Description: Add marketplace-specific fields to freelancers table
-- Created: 2026-09-21

-- ============================================
-- ADD MARKETPLACE FIELDS TO FREELANCERS TABLE
-- ============================================
ALTER TABLE freelancers
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS experience_years INTEGER CHECK (experience_years IS NULL OR experience_years >= 0),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (profile_type IN ('individual', 'team')),
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500);

-- ============================================
-- ADD INDEXES FOR NEW FIELDS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_freelancers_verified ON freelancers(verified);
CREATE INDEX IF NOT EXISTS idx_freelancers_profile_type ON freelancers(profile_type);
CREATE INDEX IF NOT EXISTS idx_freelancers_city ON freelancers(city);
CREATE INDEX IF NOT EXISTS idx_freelancers_state ON freelancers(state);

-- ============================================
-- UPDATE EXISTING DATA DEFAULTS
-- ============================================
-- Set reasonable defaults for existing records
UPDATE freelancers
SET 
    skills = ARRAY[specialization],
    experience_years = 0,
    city = 'Unknown',
    state = 'Unknown',
    verified = false,
    profile_type = 'individual',
    summary = notes
WHERE skills IS NULL;
