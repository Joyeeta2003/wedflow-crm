-- Migration: Create work_requests table for DRV Studios Wedding CRM
-- Description: Work request management for freelancer marketplace
-- Created: 2026-09-21

-- ============================================
-- WORK_REQUESTS TABLE
-- ============================================
CREATE TABLE work_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    professional_role VARCHAR(150) NOT NULL,
    professional_name VARCHAR(150) NOT NULL,
    professional_email VARCHAR(255),
    professional_phone VARCHAR(30),
    event_date DATE,
    venue VARCHAR(255),
    budget DECIMAL(12,2) CHECK (budget IS NULL OR budget >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_work_requests_workspace_id ON work_requests(workspace_id);
CREATE INDEX idx_work_requests_status ON work_requests(status);
CREATE INDEX idx_work_requests_event_date ON work_requests(event_date);
CREATE INDEX idx_work_requests_professional_email ON work_requests(professional_email);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_work_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_requests_updated_at BEFORE UPDATE ON work_requests
    FOR EACH ROW EXECUTE FUNCTION update_work_requests_updated_at();
