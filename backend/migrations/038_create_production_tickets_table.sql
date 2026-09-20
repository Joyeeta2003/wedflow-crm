-- Migration: Create production_tickets table for DRV Studios Wedding CRM
-- Description: Production task management with deadline tracking and escalation
-- Created: 2026-09-19

-- ============================================
-- PRODUCTION TICKETS TABLE
-- ============================================
CREATE TABLE production_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('photo_editing', 'video_editing', 'album_design', 'soft_copy_delivery', 'hard_copy_delivery', 'other')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'revision_needed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    deadline TIMESTAMPTZ NOT NULL,
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    escalation_level INTEGER DEFAULT NULL CHECK (escalation_level IN (1, 2, 3)),
    escalation_role VARCHAR(50) DEFAULT NULL,
    material_note TEXT,
    completion_notes TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_production_tickets_workspace_id ON production_tickets(workspace_id);
CREATE INDEX idx_production_tickets_booking_id ON production_tickets(booking_id);
CREATE INDEX idx_production_tickets_assignee_id ON production_tickets(assignee_id);
CREATE INDEX idx_production_tickets_status ON production_tickets(status);
CREATE INDEX idx_production_tickets_category ON production_tickets(category);
CREATE INDEX idx_production_tickets_priority ON production_tickets(priority);
CREATE INDEX idx_production_tickets_deadline ON production_tickets(deadline);
CREATE INDEX idx_production_tickets_is_overdue ON production_tickets(is_overdue);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_production_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_production_tickets_updated_at BEFORE UPDATE ON production_tickets
FOR EACH ROW EXECUTE FUNCTION update_production_tickets_updated_at();

-- ============================================
-- ESCALATION MATRIX TABLE
-- ============================================
CREATE TABLE escalation_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    level INTEGER NOT NULL UNIQUE CHECK (level IN (1, 2, 3)),
    overdue_hours INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, level)
);

-- ============================================
-- DEFAULT ESCALATION MATRIX DATA
-- ============================================
-- Note: Default escalation matrix will be created via API or manually per workspace