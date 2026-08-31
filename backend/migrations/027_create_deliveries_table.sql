-- Migration: Create deliveries table for DRV Studios Wedding CRM
-- Description: Final delivery tracking for bookings
-- Created: 2026-08-28

-- ============================================
-- DELIVERIES TABLE
-- ============================================
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    delivery_type VARCHAR(100) NOT NULL,
    delivery_date TIMESTAMPTZ,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'ready', 'delivered', 'failed')),
    delivery_link TEXT,
    recipient VARCHAR(255),
    confirmation BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_deliveries_workspace_id ON deliveries(workspace_id);
CREATE INDEX idx_deliveries_booking_id ON deliveries(booking_id);
CREATE INDEX idx_deliveries_delivery_status ON deliveries(delivery_status);
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_deliveries_updated_at();
