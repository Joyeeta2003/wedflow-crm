-- Migration to allow duplicate emails with different roles
-- This enables the same person to have multiple roles (e.g., admin + video editor)

-- Remove the UNIQUE constraint on email column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add a composite unique constraint on (email, role) to prevent exact duplicates
-- This allows same email with different roles, but prevents same email with same role
ALTER TABLE users ADD CONSTRAINT users_email_role_unique UNIQUE (email, role);

-- Add comment to document the change
COMMENT ON COLUMN users.email IS 'Email can be duplicated for different roles, but same email+role combination must be unique';