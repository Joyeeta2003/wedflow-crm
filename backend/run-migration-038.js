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
    console.log('Starting migration: Add workspace_id to packages table...');

    // Add workspace_id column to packages table
    await pool.query('ALTER TABLE packages ADD COLUMN IF NOT EXISTS workspace_id UUID');
    console.log('✓ Added workspace_id column to packages table');

    // Add foreign key constraint to workspace table
    await pool.query(`
      ALTER TABLE packages 
      ADD CONSTRAINT fk_packages_workspace 
      FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE
    `);
    console.log('✓ Added foreign key constraint to workspace table');

    // Create index for better query performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_packages_workspace_id ON packages(workspace_id)');
    console.log('✓ Created index on workspace_id');

    // Update existing packages to use the default workspace
    await pool.query(`
      UPDATE packages 
      SET workspace_id = (SELECT id FROM workspace WHERE company_name = 'DRV Studios' LIMIT 1)
      WHERE workspace_id IS NULL
    `);
    console.log('✓ Updated existing packages to default workspace');

    // Make workspace_id NOT NULL after updating existing data
    await pool.query('ALTER TABLE packages ALTER COLUMN workspace_id SET NOT NULL');
    console.log('✓ Made workspace_id NOT NULL');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();