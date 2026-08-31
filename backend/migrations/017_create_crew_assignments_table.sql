-- Migration: Create crew_assignments table for DRV Studios Wedding CRM
-- Description: Staff assignments to booking events
-- Created: 2026-08-28

-- ============================================
-- CREW_ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE crew_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_event_id UUID NOT NULL REFERENCES booking_events(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    assigned_role VARCHAR(100) NOT NULL,
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME,
    end_time TIME,
    status VARCHAR(30) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(booking_event_id, staff_id),
    CHECK (
        (start_time IS NULL OR end_time IS NULL) OR 
        (start_time < end_time)
    )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_crew_assignments_booking_event_id ON crew_assignments(booking_event_id);
CREATE INDEX idx_crew_assignments_staff_id ON crew_assignments(staff_id);
CREATE INDEX idx_crew_assignments_status ON crew_assignments(status);
CREATE INDEX idx_crew_assignments_assignment_date ON crew_assignments(assignment_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_crew_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crew_assignments_updated_at BEFORE UPDATE ON crew_assignments
    FOR EACH ROW EXECUTE FUNCTION update_crew_assignments_updated_at();
