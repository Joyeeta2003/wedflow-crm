const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeMigration() {
  try {
    console.log('=== EXECUTING MIGRATION 036 ===\n');

    const migrationSQL = fs.readFileSync('./migrations/036_add_workspace_id_to_child_tables.sql', 'utf8');
    
    console.log('Executing migration SQL...');
    await pool.query(migrationSQL);
    
    console.log('\n✓ MIGRATION 036 EXECUTED SUCCESSFULLY');
    
  } catch (error) {
    console.error('\n✗ MIGRATION FAILED');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
    console.error('Hint:', error.hint);
    throw error;
  } finally {
    await pool.end();
  }
}

executeMigration();
