-- Rollback migration to restore original email uniqueness constraint

-- Remove the composite unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_role_unique;

-- Restore the original UNIQUE constraint on email
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Remove the comment
COMMENT ON COLUMN users.email IS NULL;