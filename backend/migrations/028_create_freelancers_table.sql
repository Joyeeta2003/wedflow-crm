-- Migration: Create freelancers table for DRV Studios Wedding CRM
-- Description: Freelancer management
-- Created: 2026-08-28

-- ============================================
-- FREELANCERS TABLE
-- ============================================
CREATE TABLE freelancers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    specialization VARCHAR(100) NOT NULL,
    availability VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'unavailable', 'leave')),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    rate DECIMAL(12,2) CHECK (rate IS NULL OR rate >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_freelancers_workspace_id ON freelancers(workspace_id);
CREATE INDEX idx_freelancers_specialization ON freelancers(specialization);
CREATE INDEX idx_freelancers_availability ON freelancers(availability);
CREATE INDEX idx_freelancers_status ON freelancers(status);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_freelancers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_freelancers_updated_at BEFORE UPDATE ON freelancers
    FOR EACH ROW EXECUTE FUNCTION update_freelancers_updated_at();
