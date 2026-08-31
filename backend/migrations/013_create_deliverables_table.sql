-- Migration: Create deliverables table for DRV Studios Wedding CRM
-- Description: Deliverables for packages
-- Created: 2026-08-28

-- ============================================
-- DELIVERABLES TABLE
-- ============================================
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_deliverables_package_id ON deliverables(package_id);
CREATE INDEX idx_deliverables_display_order ON deliverables(display_order);
