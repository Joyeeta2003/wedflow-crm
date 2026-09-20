-- Migration: Add priority column to escalation_matrix table
-- Description: Add priority field to escalation matrix for better categorization
-- Created: 2026-09-20

-- Add priority column to escalation_matrix table
ALTER TABLE escalation_matrix 
ADD COLUMN priority VARCHAR(20) DEFAULT 'Normal' 
CHECK (priority IN ('Low', 'Normal', 'High', 'Critical'));

-- Update existing records to have appropriate default priorities
UPDATE escalation_matrix SET priority = 'High' WHERE role = 'HR';
UPDATE escalation_matrix SET priority = 'Critical' WHERE role IN ('Admin', 'Superadmin', 'Manager');
UPDATE escalation_matrix SET priority = 'Normal' WHERE role NOT IN ('HR', 'Admin', 'Superadmin', 'Manager');