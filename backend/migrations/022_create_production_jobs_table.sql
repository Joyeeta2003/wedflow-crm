-- Migration: Create production_jobs table for DRV Studios Wedding CRM
-- Description: Production work assignments for bookings
-- Created: 2026-08-28

-- ============================================
-- PRODUCTION_JOBS TABLE
-- ============================================
CREATE TABLE production_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES service_master(id) ON DELETE RESTRICT,
    assigned_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    job_name VARCHAR(255) NOT NULL,
    start_date DATE,
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'qc', 'completed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_production_jobs_workspace_id ON production_jobs(workspace_id);
CREATE INDEX idx_production_jobs_booking_id ON production_jobs(booking_id);
CREATE INDEX idx_production_jobs_service_id ON production_jobs(service_id);
CREATE INDEX idx_production_jobs_assigned_staff_id ON production_jobs(assigned_staff_id);
CREATE INDEX idx_production_jobs_status ON production_jobs(status);
CREATE INDEX idx_production_jobs_priority ON production_jobs(priority);
CREATE INDEX idx_production_jobs_due_date ON production_jobs(due_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_production_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_production_jobs_updated_at BEFORE UPDATE ON production_jobs
    FOR EACH ROW EXECUTE FUNCTION update_production_jobs_updated_at();
