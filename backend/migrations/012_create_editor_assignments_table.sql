-- Migration: Create editor_assignments table for DRV Studios Wedding CRM
-- Description: Editor assignments for editor plans
-- Created: 2026-08-28

-- ============================================
-- EDITOR_ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE editor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    editor_plan_id UUID NOT NULL REFERENCES editor_plans(id) ON DELETE CASCADE,
    crew_type_id UUID NOT NULL REFERENCES crew_types(id) ON DELETE RESTRICT,
    editing_type VARCHAR(100) NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_editor_assignments_editor_plan_id ON editor_assignments(editor_plan_id);
CREATE INDEX idx_editor_assignments_crew_type_id ON editor_assignments(crew_type_id);
