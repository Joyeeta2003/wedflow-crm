-- Migration: Create board_columns table for DRV Studios Wedding CRM
-- Description: Kanban board columns
-- Created: 2026-08-28

-- ============================================
-- BOARD_COLUMNS TABLE
-- ============================================
CREATE TABLE board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    column_order INTEGER NOT NULL CHECK (column_order > 0),
    color VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(board_id, column_order),
    UNIQUE(board_id, name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_board_columns_board_id ON board_columns(board_id);
CREATE INDEX idx_board_columns_column_order ON board_columns(column_order);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_board_columns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_board_columns_updated_at BEFORE UPDATE ON board_columns
    FOR EACH ROW EXECUTE FUNCTION update_board_columns_updated_at();
