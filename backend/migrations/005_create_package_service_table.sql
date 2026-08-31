-- Migration: Create package_service table for DRV Studios Wedding CRM
-- Description: Connects packages with service_master for service offerings
-- Created: 2026-08-28

-- ============================================
-- PACKAGE_SERVICE TABLE
-- ============================================
CREATE TABLE package_service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES service_master(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_id, service_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_package_service_package_id ON package_service(package_id);
CREATE INDEX idx_package_service_service_id ON package_service(service_id);
