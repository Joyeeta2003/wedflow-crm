-- Rollback Migration: Remove workspace_id from child tables
-- Description: Reverts migration 036 by removing workspace_id columns and constraints
-- Created: 2026-08-30
-- Safety: Only run if migration 036 was executed and needs to be reverted

-- ============================================
-- PHASE 1: DROP INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_board_columns_workspace;
DROP INDEX IF EXISTS idx_board_cards_workspace;
DROP INDEX IF EXISTS idx_booking_events_workspace;
DROP INDEX IF EXISTS idx_crew_assignments_workspace;
DROP INDEX IF EXISTS idx_deliverables_workspace;
DROP INDEX IF EXISTS idx_editor_assignments_workspace;
DROP INDEX IF EXISTS idx_editor_plans_workspace;
DROP INDEX IF EXISTS idx_equipment_assignments_workspace;
DROP INDEX IF EXISTS idx_package_day_crew_workspace;
DROP INDEX IF EXISTS idx_package_days_workspace;
DROP INDEX IF EXISTS idx_package_service_workspace;
DROP INDEX IF EXISTS idx_payment_schedules_workspace;
DROP INDEX IF EXISTS idx_user_sessions_workspace;
DROP INDEX IF EXISTS idx_user_activity_log_workspace;
DROP INDEX IF EXISTS idx_workflow_steps_workspace;

-- ============================================
-- PHASE 2: REVERT USERS TABLE
-- ============================================

ALTER TABLE users ALTER COLUMN workspace_id DROP NOT NULL;

-- ============================================
-- PHASE 3: DROP FOREIGN KEYS AND COLUMNS (Level 2)
-- ============================================

-- package_day_crew
ALTER TABLE package_day_crew DROP CONSTRAINT IF EXISTS fk_package_day_crew_workspace;
ALTER TABLE package_day_crew DROP COLUMN IF EXISTS workspace_id;

-- editor_assignments
ALTER TABLE editor_assignments DROP CONSTRAINT IF EXISTS fk_editor_assignments_workspace;
ALTER TABLE editor_assignments DROP COLUMN IF EXISTS workspace_id;

-- equipment_assignments
ALTER TABLE equipment_assignments DROP CONSTRAINT IF EXISTS fk_equipment_assignments_workspace;
ALTER TABLE equipment_assignments DROP COLUMN IF EXISTS workspace_id;

-- crew_assignments
ALTER TABLE crew_assignments DROP CONSTRAINT IF EXISTS fk_crew_assignments_workspace;
ALTER TABLE crew_assignments DROP COLUMN IF EXISTS workspace_id;

-- board_cards
ALTER TABLE board_cards DROP CONSTRAINT IF EXISTS fk_board_cards_workspace;
ALTER TABLE board_cards DROP COLUMN IF EXISTS workspace_id;

-- ============================================
-- PHASE 4: DROP FOREIGN KEYS AND COLUMNS (Level 1)
-- ============================================

-- user_activity_log
ALTER TABLE user_activity_log DROP CONSTRAINT IF EXISTS fk_user_activity_log_workspace;
ALTER TABLE user_activity_log DROP COLUMN IF EXISTS workspace_id;

-- user_sessions
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS fk_user_sessions_workspace;
ALTER TABLE user_sessions DROP COLUMN IF EXISTS workspace_id;

-- workflow_steps
ALTER TABLE workflow_steps DROP CONSTRAINT IF EXISTS fk_workflow_steps_workspace;
ALTER TABLE workflow_steps DROP COLUMN IF EXISTS workspace_id;

-- payment_schedules
ALTER TABLE payment_schedules DROP CONSTRAINT IF EXISTS fk_payment_schedules_workspace;
ALTER TABLE payment_schedules DROP COLUMN IF EXISTS workspace_id;

-- package_service
ALTER TABLE package_service DROP CONSTRAINT IF EXISTS fk_package_service_workspace;
ALTER TABLE package_service DROP COLUMN IF EXISTS workspace_id;

-- package_days
ALTER TABLE package_days DROP CONSTRAINT IF EXISTS fk_package_days_workspace;
ALTER TABLE package_days DROP COLUMN IF EXISTS workspace_id;

-- editor_plans
ALTER TABLE editor_plans DROP CONSTRAINT IF EXISTS fk_editor_plans_workspace;
ALTER TABLE editor_plans DROP COLUMN IF EXISTS workspace_id;

-- deliverables
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS fk_deliverables_workspace;
ALTER TABLE deliverables DROP COLUMN IF EXISTS workspace_id;

-- booking_events
ALTER TABLE booking_events DROP CONSTRAINT IF EXISTS fk_booking_events_workspace;
ALTER TABLE booking_events DROP COLUMN IF EXISTS workspace_id;

-- board_columns
ALTER TABLE board_columns DROP CONSTRAINT IF EXISTS fk_board_columns_workspace;
ALTER TABLE board_columns DROP COLUMN IF EXISTS workspace_id;
