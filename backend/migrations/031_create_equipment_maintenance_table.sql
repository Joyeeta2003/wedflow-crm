-- Migration: Create equipment_maintenance table for DRV Studios Wedding CRM
-- Description: Equipment maintenance and repair tracking
-- Created: 2026-08-28

-- ============================================
-- EQUIPMENT_MAINTENANCE TABLE
-- ============================================
CREATE TABLE equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'inspection', 'replacement', 'other')),
    description TEXT NOT NULL,
    maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_maintenance_date DATE,
    cost DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    performed_by VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (next_maintenance_date IS NULL OR next_maintenance_date >= maintenance_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_equipment_maintenance_workspace_id ON equipment_maintenance(workspace_id);
CREATE INDEX idx_equipment_maintenance_equipment_id ON equipment_maintenance(equipment_id);
CREATE INDEX idx_equipment_maintenance_type ON equipment_maintenance(maintenance_type);
CREATE INDEX idx_equipment_maintenance_status ON equipment_maintenance(status);
CREATE INDEX idx_equipment_maintenance_date ON equipment_maintenance(maintenance_date);
CREATE INDEX idx_equipment_maintenance_next_date ON equipment_maintenance(next_maintenance_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_equipment_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_maintenance_updated_at BEFORE UPDATE ON equipment_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_equipment_maintenance_updated_at();
