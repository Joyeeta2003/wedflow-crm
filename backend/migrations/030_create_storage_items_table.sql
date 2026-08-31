-- Migration: Create storage_items table for DRV Studios Wedding CRM
-- Description: Storage location and file tracking
-- Created: 2026-08-28

-- ============================================
-- STORAGE_ITEMS TABLE
-- ============================================
CREATE TABLE storage_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    category_id UUID REFERENCES storage_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    storage_type VARCHAR(50) NOT NULL CHECK (storage_type IN ('supabase', 'google_drive', 'dropbox', 'onedrive', 'local', 'nas', 'external_drive', 'other')),
    storage_path TEXT NOT NULL,
    size_bytes BIGINT CHECK (size_bytes IS NULL OR size_bytes >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_storage_items_workspace_id ON storage_items(workspace_id);
CREATE INDEX idx_storage_items_booking_id ON storage_items(booking_id);
CREATE INDEX idx_storage_items_category_id ON storage_items(category_id);
CREATE INDEX idx_storage_items_storage_type ON storage_items(storage_type);
CREATE INDEX idx_storage_items_status ON storage_items(status);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_storage_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storage_items_updated_at BEFORE UPDATE ON storage_items
    FOR EACH ROW EXECUTE FUNCTION update_storage_items_updated_at();
