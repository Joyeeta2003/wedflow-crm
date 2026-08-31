-- Migration: Create revisions table for DRV Studios Wedding CRM
-- Description: Client revision requests for production jobs
-- Created: 2026-08-28

-- ============================================
-- REVISIONS TABLE
-- ============================================
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    client_review_id UUID NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
    production_job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL CHECK (revision_number > 0),
    requested_changes TEXT NOT NULL,
    assigned_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    due_date DATE,
    completion_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_revisions_workspace_id ON revisions(workspace_id);
CREATE INDEX idx_revisions_client_review_id ON revisions(client_review_id);
CREATE INDEX idx_revisions_production_job_id ON revisions(production_job_id);
CREATE INDEX idx_revisions_assigned_staff_id ON revisions(assigned_staff_id);
CREATE INDEX idx_revisions_status ON revisions(status);
CREATE INDEX idx_revisions_due_date ON revisions(due_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_revisions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_revisions_updated_at BEFORE UPDATE ON revisions
    FOR EACH ROW EXECUTE FUNCTION update_revisions_updated_at();
