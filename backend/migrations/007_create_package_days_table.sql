-- Migration: Create package_days table for DRV Studios Wedding CRM
-- Description: Daily breakdown of packages with event types
-- Created: 2026-08-28

-- ============================================
-- PACKAGE_DAYS TABLE
-- ============================================
CREATE TABLE package_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    event_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_id, day_number)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_package_days_package_id ON package_days(package_id);
