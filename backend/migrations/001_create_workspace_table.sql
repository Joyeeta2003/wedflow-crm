```sql
-- ============================================
-- DRV STUDIOS WEDDING CRM
-- Migration: 001_create_workspace_table.sql
-- Description: Create workspace table for
-- multi-workspace CRM support
-- Created: 2026-08-28
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================
-- WORKSPACE TABLE
-- ============================================

CREATE TABLE workspace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_name VARCHAR(255) NOT NULL UNIQUE,

    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_workspace_status
ON workspace(status);


-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_workspace_updated_at()
RETURNS TRIGGER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_workspace_updated_at
BEFORE UPDATE ON workspace
FOR EACH ROW
EXECUTE FUNCTION update_workspace_updated_at();


-- ============================================
-- SAMPLE WORKSPACE
-- ============================================

INSERT INTO workspace (
    company_name,
    timezone,
    currency,
    status
)
VALUES (
    'DRV Studios',
    'Asia/Kolkata',
    'INR',
    'active'
)
ON CONFLICT (company_name) DO NOTHING;
```
