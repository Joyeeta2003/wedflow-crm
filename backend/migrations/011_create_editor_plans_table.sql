-- Migration: Create editor_plans table for DRV Studios Wedding CRM
-- Description: Post-production editing plans for packages
-- Created: 2026-08-28

-- ============================================
-- EDITOR_PLANS TABLE
-- ============================================
CREATE TABLE editor_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_editor_plans_package_id ON editor_plans(package_id);
