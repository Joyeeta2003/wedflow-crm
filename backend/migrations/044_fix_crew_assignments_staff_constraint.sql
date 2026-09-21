-- Migration: Fix crew_assignments staff_id foreign key constraint
-- Description: Change staff_id foreign key to reference staff table instead of users table
-- Created: 2026-09-21

-- ============================================
-- STEP 1: DROP EXISTING CONSTRAINT FIRST
-- ============================================
ALTER TABLE crew_assignments DROP CONSTRAINT IF EXISTS crew_assignments_staff_id_fkey;

-- ============================================
-- STEP 2: MIGRATE EXISTING USER ASSIGNMENTS TO STAFF TABLE
-- ============================================
-- First, create staff records for users that have existing crew assignments
INSERT INTO staff (workspace_id, user_id, name, email, phone, role, availability, status, notes)
SELECT
    u.workspace_id,
    u.id as user_id,
    COALESCE(u.staff_name, COALESCE(u.first_name || ' ' || u.last_name, u.email)) as name,
    u.email,
    NULL as phone,
    'team_member' as role,
    'available' as availability,
    'active' as status,
    'Migrated from user assignment' as notes
FROM users u
WHERE u.id IN (SELECT DISTINCT staff_id FROM crew_assignments)
AND NOT EXISTS (
    SELECT 1 FROM staff s WHERE s.user_id = u.id
);

-- ============================================
-- STEP 3: UPDATE EXISTING ASSIGNMENTS TO USE STAFF IDs
-- ============================================
UPDATE crew_assignments ca
SET staff_id = s.id
FROM staff s
WHERE ca.staff_id = s.user_id;

-- ============================================
-- STEP 4: ADD CORRECT CONSTRAINT TO STAFF TABLE
-- ============================================
ALTER TABLE crew_assignments
ADD CONSTRAINT crew_assignments_staff_id_fkey
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE RESTRICT;
