-- Migration: Create event_type table for DRV Studios Wedding CRM
-- Description: Event type management with workspace support
-- Created: 2026-08-28

-- ============================================
-- EVENT_TYPE TABLE
-- ============================================
CREATE TABLE event_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_event_type_workspace_id ON event_type(workspace_id);
CREATE INDEX idx_event_type_is_active ON event_type(is_active);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_event_type_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_type_updated_at BEFORE UPDATE ON event_type
    FOR EACH ROW EXECUTE FUNCTION update_event_type_updated_at();
