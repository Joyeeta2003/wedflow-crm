-- Migration: Create qc_reviews table for DRV Studios Wedding CRM
-- Description: Quality control reviews for production jobs
-- Created: 2026-08-28

-- ============================================
-- QC_REVIEWS TABLE
-- ============================================
CREATE TABLE qc_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    production_job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,
    reviewer_staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result VARCHAR(30) NOT NULL CHECK (result IN ('passed', 'failed', 'needs_correction')),
    comments TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_qc_reviews_workspace_id ON qc_reviews(workspace_id);
CREATE INDEX idx_qc_reviews_production_job_id ON qc_reviews(production_job_id);
CREATE INDEX idx_qc_reviews_reviewer_staff_id ON qc_reviews(reviewer_staff_id);
CREATE INDEX idx_qc_reviews_result ON qc_reviews(result);
CREATE INDEX idx_qc_reviews_status ON qc_reviews(status);
CREATE INDEX idx_qc_reviews_review_date ON qc_reviews(review_date);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_qc_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_qc_reviews_updated_at BEFORE UPDATE ON qc_reviews
    FOR EACH ROW EXECUTE FUNCTION update_qc_reviews_updated_at();
