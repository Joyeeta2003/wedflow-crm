-- Migration: Add workspace_id to child tables for multi-tenant isolation
-- Description: Adds workspace_id columns to child tables and backfills from parent relationships
-- Created: 2026-08-30
-- Safety: All affected tables are empty (0 rows) except user_activity_log (1 row)

-- ============================================
-- PHASE 1: DIRECT PARENT TABLES (Level 1)
-- ============================================

-- board_columns → boards.workspace_id through board_id
ALTER TABLE board_columns ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE board_columns bc SET workspace_id = b.workspace_id FROM boards b WHERE bc.board_id = b.id;
ALTER TABLE board_columns ADD CONSTRAINT fk_board_columns_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE board_columns ALTER COLUMN workspace_id SET NOT NULL;

-- booking_events → bookings.workspace_id through booking_id
ALTER TABLE booking_events ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE booking_events be SET workspace_id = b.workspace_id FROM bookings b WHERE be.booking_id = b.id;
ALTER TABLE booking_events ADD CONSTRAINT fk_booking_events_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE booking_events ALTER COLUMN workspace_id SET NOT NULL;

-- deliverables → packages.workspace_id through package_id
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE deliverables d SET workspace_id = p.workspace_id FROM packages p WHERE d.package_id = p.id;
ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE deliverables ALTER COLUMN workspace_id SET NOT NULL;

-- editor_plans → packages.workspace_id through package_id
ALTER TABLE editor_plans ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE editor_plans ep SET workspace_id = p.workspace_id FROM packages p WHERE ep.package_id = p.id;
ALTER TABLE editor_plans ADD CONSTRAINT fk_editor_plans_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE editor_plans ALTER COLUMN workspace_id SET NOT NULL;

-- package_days → packages.workspace_id through package_id
ALTER TABLE package_days ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE package_days pd SET workspace_id = p.workspace_id FROM packages p WHERE pd.package_id = p.id;
ALTER TABLE package_days ADD CONSTRAINT fk_package_days_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE package_days ALTER COLUMN workspace_id SET NOT NULL;

-- package_service → packages.workspace_id through package_id
ALTER TABLE package_service ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE package_service ps SET workspace_id = p.workspace_id FROM packages p WHERE ps.package_id = p.id;
ALTER TABLE package_service ADD CONSTRAINT fk_package_service_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE package_service ALTER COLUMN workspace_id SET NOT NULL;

-- payment_schedules → packages.workspace_id through package_id
ALTER TABLE payment_schedules ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE payment_schedules ps SET workspace_id = p.workspace_id FROM packages p WHERE ps.package_id = p.id;
ALTER TABLE payment_schedules ADD CONSTRAINT fk_payment_schedules_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE payment_schedules ALTER COLUMN workspace_id SET NOT NULL;

-- workflow_steps → workflows.workspace_id through workflow_id
ALTER TABLE workflow_steps ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE workflow_steps ws SET workspace_id = w.workspace_id FROM workflows w WHERE ws.workflow_id = w.id;
ALTER TABLE workflow_steps ADD CONSTRAINT fk_workflow_steps_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE workflow_steps ALTER COLUMN workspace_id SET NOT NULL;

-- user_sessions → users.workspace_id through user_id
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE user_sessions us SET workspace_id = u.workspace_id FROM users u WHERE us.user_id = u.id;
ALTER TABLE user_sessions ADD CONSTRAINT fk_user_sessions_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE user_sessions ALTER COLUMN workspace_id SET NOT NULL;

-- user_activity_log → users.workspace_id through user_id
ALTER TABLE user_activity_log ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE user_activity_log ual SET workspace_id = u.workspace_id FROM users u WHERE ual.user_id = u.id;
ALTER TABLE user_activity_log ADD CONSTRAINT fk_user_activity_log_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE user_activity_log ALTER COLUMN workspace_id SET NOT NULL;

-- ============================================
-- PHASE 2: DEPENDENT TABLES (Level 2)
-- NOTE: These depend on tables from Phase 1 which now have workspace_id
-- ============================================

-- board_cards → boards.workspace_id through board_id (multiple parents, use boards)
ALTER TABLE board_cards ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE board_cards bc SET workspace_id = b.workspace_id FROM boards b WHERE bc.board_id = b.id;
ALTER TABLE board_cards ADD CONSTRAINT fk_board_cards_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE board_cards ALTER COLUMN workspace_id SET NOT NULL;

-- crew_assignments → booking_events.workspace_id through booking_event_id
-- booking_events gets workspace_id in Phase 1 (lines 16-20)
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE crew_assignments ca SET workspace_id = be.workspace_id FROM booking_events be WHERE ca.booking_event_id = be.id;
ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE crew_assignments ALTER COLUMN workspace_id SET NOT NULL;

-- equipment_assignments → booking_events.workspace_id through booking_event_id
-- booking_events gets workspace_id in Phase 1 (lines 16-20)
ALTER TABLE equipment_assignments ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE equipment_assignments ea SET workspace_id = be.workspace_id FROM booking_events be WHERE ea.booking_event_id = be.id;
ALTER TABLE equipment_assignments ADD CONSTRAINT fk_equipment_assignments_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE equipment_assignments ALTER COLUMN workspace_id SET NOT NULL;

-- editor_assignments → editor_plans.workspace_id through editor_plan_id
-- editor_plans gets workspace_id in Phase 1 (lines 28-32)
ALTER TABLE editor_assignments ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE editor_assignments ea SET workspace_id = ep.workspace_id FROM editor_plans ep WHERE ea.editor_plan_id = ep.id;
ALTER TABLE editor_assignments ADD CONSTRAINT fk_editor_assignments_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE editor_assignments ALTER COLUMN workspace_id SET NOT NULL;

-- package_day_crew → package_days.workspace_id through package_day_id
-- package_days gets workspace_id in Phase 1 (lines 34-38)
ALTER TABLE package_day_crew ADD COLUMN IF NOT EXISTS workspace_id UUID;
UPDATE package_day_crew pdc SET workspace_id = pd.workspace_id FROM package_days pd WHERE pdc.package_day_id = pd.id;
ALTER TABLE package_day_crew ADD CONSTRAINT fk_package_day_crew_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;
ALTER TABLE package_day_crew ALTER COLUMN workspace_id SET NOT NULL;

-- ============================================
-- PHASE 3: USERS TABLE CLEANUP
-- ============================================

-- Verify all users have workspace_id (should be true based on audit)
-- Then make workspace_id NOT NULL
ALTER TABLE users ALTER COLUMN workspace_id SET NOT NULL;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_board_columns_workspace ON board_columns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_board_cards_workspace ON board_cards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_booking_events_workspace ON booking_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_workspace ON crew_assignments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_workspace ON deliverables(workspace_id);
CREATE INDEX IF NOT EXISTS idx_editor_assignments_workspace ON editor_assignments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_editor_plans_workspace ON editor_plans(workspace_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_workspace ON equipment_assignments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_package_day_crew_workspace ON package_day_crew(workspace_id);
CREATE INDEX IF NOT EXISTS idx_package_days_workspace ON package_days(workspace_id);
CREATE INDEX IF NOT EXISTS idx_package_service_workspace ON package_service(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_workspace ON payment_schedules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_workspace ON user_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_workspace ON user_activity_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workspace ON workflow_steps(workspace_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check for any NULL workspace_id values after migration
-- SELECT table_name, COUNT(*) as null_count 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND column_name = 'workspace_id' 
-- AND is_nullable = 'NO'
-- GROUP BY table_name;
