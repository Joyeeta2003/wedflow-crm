-- Migration: Create booking_events table for DRV Studios Wedding CRM
-- Description: Individual events within bookings
-- Created: 2026-08-28

-- ============================================
-- BOOKING_EVENTS TABLE
-- ============================================
CREATE TABLE booking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    event_type_id UUID NOT NULL REFERENCES event_type(id) ON DELETE RESTRICT,
    event_name VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue VARCHAR(255),
    location TEXT,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (start_time IS NULL OR end_time IS NULL) OR 
        (start_time < end_time)
    )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_booking_events_booking_id ON booking_events(booking_id);
CREATE INDEX idx_booking_events_event_type_id ON booking_events(event_type_id);
CREATE INDEX idx_booking_events_event_date ON booking_events(event_date);
CREATE INDEX idx_booking_events_status ON booking_events(status);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_booking_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_booking_events_updated_at BEFORE UPDATE ON booking_events
    FOR EACH ROW EXECUTE FUNCTION update_booking_events_updated_at();
