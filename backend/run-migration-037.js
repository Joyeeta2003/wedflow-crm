const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || null,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  try {
    console.log('Starting migration: Allow duplicate emails with different roles...');

    // Remove the UNIQUE constraint on email column
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key');
    console.log('✓ Dropped users_email_key constraint');

    // Add composite unique constraint on (email, role)
    await pool.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_email_role_unique UNIQUE (email, role)
    `);
    console.log('✓ Added users_email_role_unique constraint');

    // Add comment
    await pool.query(`
      COMMENT ON COLUMN users.email IS
      'Email can be duplicated for different roles, but same email+role combination must be unique'
    `);
    console.log('✓ Added column comment');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();