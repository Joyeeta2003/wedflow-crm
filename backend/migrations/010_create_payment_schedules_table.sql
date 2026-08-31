-- Migration: Create payment_schedules table for DRV Studios Wedding CRM
-- Description: Payment breakdown for packages
-- Created: 2026-08-28

-- ============================================
-- PAYMENT_SCHEDULES TABLE
-- ============================================
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    installment_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    timing VARCHAR(100),
    timing_days INTEGER CHECK (timing_days >= 0),
    payment_order INTEGER NOT NULL CHECK (payment_order > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(package_id, payment_order)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_payment_schedules_package_id ON payment_schedules(package_id);
