-- Migration: Add scheduled_time to reminders table
-- Description: Add time field for precise reminder scheduling
-- Created: 2026-09-19

-- Add scheduled_time column
ALTER TABLE reminders 
ADD COLUMN scheduled_time TIME;

-- Add index for scheduled datetime (date + time) for efficient querying
CREATE INDEX idx_reminders_scheduled_datetime ON reminders(scheduled_date, scheduled_time);

-- Update unique constraint to include time (optional - remove if you want multiple reminders at same time)
-- DROP CONSTRAINT IF EXISTS reminders_booking_id_reminder_type_days_before_event_key;
-- ALTER TABLE reminders 
-- ADD CONSTRAINT reminders_booking_id_reminder_type_datetime_key 
-- UNIQUE(booking_id, reminder_type, scheduled_date, scheduled_time);