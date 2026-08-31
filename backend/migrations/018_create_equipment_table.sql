-- Migration: Create equipment table for DRV Studios Wedding CRM
-- Description: Equipment inventory management
-- Created: 2026-08-28

-- ============================================
-- EQUIPMENT TABLE
-- ============================================
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    equipment_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(150),
    purchase_date DATE,
    purchase_price DECIMAL(12,2) CHECK (purchase_price >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, serial_number)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_equipment_workspace_id ON equipment(workspace_id);
CREATE INDEX idx_equipment_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_equipment_updated_at();
