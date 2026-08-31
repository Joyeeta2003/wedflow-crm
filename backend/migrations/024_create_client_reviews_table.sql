-- Migration: Create client_reviews table for DRV Studios Wedding CRM
-- Description: Client reviews for production job approvals
-- Created: 2026-08-28

-- ============================================
-- CLIENT_REVIEWS TABLE
-- ============================================
CREATE TABLE client_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    production_job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client(id) ON DELETE RESTRICT,
    sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
    response_date DATE,
    review_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'revision_requested', 'rejected')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_client_reviews_workspace_id ON client_reviews(workspace_id);
CREATE INDEX idx_client_reviews_booking_id ON client_reviews(booking_id);
CREATE INDEX idx_client_reviews_production_job_id ON client_reviews(production_job_id);
CREATE INDEX idx_client_reviews_client_id ON client_reviews(client_id);
CREATE INDEX idx_client_reviews_review_status ON client_reviews(review_status);
CREATE INDEX idx_client_reviews_sent_date ON client_reviews(sent_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_client_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_reviews_updated_at BEFORE UPDATE ON client_reviews
    FOR EACH ROW EXECUTE FUNCTION update_client_reviews_updated_at();
