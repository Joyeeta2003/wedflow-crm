-- Allow event days to be created before their date is confirmed.
ALTER TABLE booking_events
  ALTER COLUMN event_date DROP NOT NULL;