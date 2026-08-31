-- Migration: Create files table for DRV Studios Wedding CRM
-- Description: File metadata and storage tracking
-- Created: 2026-08-28

-- ============================================
-- FILES TABLE
-- ============================================
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT CHECK (file_size IS NULL OR file_size >= 0),
    upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_files_workspace_id ON files(workspace_id);
CREATE INDEX idx_files_booking_id ON files(booking_id);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_upload_date ON files(upload_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_files_updated_at();
