-- Migration: Create storage_categories table for DRV Studios Wedding CRM
-- Description: Storage category management
-- Created: 2026-08-28

-- ============================================
-- STORAGE_CATEGORIES TABLE
-- ============================================
CREATE TABLE storage_categories (
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
CREATE INDEX idx_storage_categories_workspace_id ON storage_categories(workspace_id);
CREATE INDEX idx_storage_categories_is_active ON storage_categories(is_active);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_storage_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storage_categories_updated_at BEFORE UPDATE ON storage_categories
    FOR EACH ROW EXECUTE FUNCTION update_storage_categories_updated_at();
