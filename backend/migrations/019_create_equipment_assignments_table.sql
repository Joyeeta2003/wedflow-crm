-- Migration: Create equipment_assignments table for DRV Studios Wedding CRM
-- Description: Equipment assignments to booking events
-- Created: 2026-08-28

-- ============================================
-- EQUIPMENT_ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    booking_event_id UUID NOT NULL REFERENCES booking_events(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    returned_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'returned', 'lost', 'damaged')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (returned_at IS NULL) OR 
        (returned_at >= assigned_at)
    )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_booking_event_id ON equipment_assignments(booking_event_id);
CREATE INDEX idx_equipment_assignments_staff_id ON equipment_assignments(staff_id);
CREATE INDEX idx_equipment_assignments_status ON equipment_assignments(status);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_equipment_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_assignments_updated_at BEFORE UPDATE ON equipment_assignments
    FOR EACH ROW EXECUTE FUNCTION update_equipment_assignments_updated_at();
