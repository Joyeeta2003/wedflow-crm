-- Migration: Create package_day_crew table for DRV Studios Wedding CRM
-- Description: Crew assignments for package days
-- Created: 2026-08-28

-- ============================================
-- PACKAGE_DAY_CREW TABLE
-- ============================================
CREATE TABLE package_day_crew (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_day_id UUID NOT NULL REFERENCES package_days(id) ON DELETE CASCADE,
    crew_type_id UUID NOT NULL REFERENCES crew_types(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_day_id, crew_type_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_package_day_crew_package_day_id ON package_day_crew(package_day_id);
CREATE INDEX idx_package_day_crew_crew_type_id ON package_day_crew(crew_type_id);
