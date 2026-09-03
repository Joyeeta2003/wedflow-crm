-- Migration to add workspace_id to packages table for workspace isolation

-- Add workspace_id column to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Add foreign key constraint to workspace table
ALTER TABLE packages 
ADD CONSTRAINT fk_packages_workspace 
FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_workspace_id ON packages(workspace_id);

-- Update existing packages to use the default workspace
UPDATE packages 
SET workspace_id = (SELECT id FROM workspace WHERE company_name = 'DRV Studios' LIMIT 1)
WHERE workspace_id IS NULL;

-- Make workspace_id NOT NULL after updating existing data
ALTER TABLE packages ALTER COLUMN workspace_id SET NOT NULL;