-- Migration: Create service_master table for DRV Studios Wedding CRM
-- Description: Service master management with workspace support
-- Created: 2026-08-28

-- ============================================
-- SERVICE_MASTER TABLE
-- ============================================
CREATE TABLE service_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_service_master_workspace_id ON service_master(workspace_id);
CREATE INDEX idx_service_master_category ON service_master(category);
CREATE INDEX idx_service_master_is_active ON service_master(is_active);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_service_master_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_master_updated_at BEFORE UPDATE ON service_master
    FOR EACH ROW EXECUTE FUNCTION update_service_master_updated_at();
