const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function inspectClientSchema() {
  try {
    console.log('=== CLIENT TABLE SCHEMA ===\n');

    // Get column details
    const columnsResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'client'
      ORDER BY ordinal_position;
    `);

    console.log('Columns:');
    columnsResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} (NULLABLE: ${col.is_nullable})${col.column_default ? ` DEFAULT: ${col.column_default}` : ''}`);
    });

    // Get foreign keys
    const fkResult = await pool.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'client';
    `);

    console.log('\nForeign Keys:');
    if (fkResult.rows.length > 0) {
      fkResult.rows.forEach(fk => {
        console.log(`  ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('  None');
    }

    // Get row count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM client');
    console.log(`\nRow Count: ${countResult.rows[0].total}`);

    // Check for workspace_id
    const workspaceResult = await pool.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'client'
      AND column_name = 'workspace_id';
    `);

    console.log('\nworkspace_id column:');
    if (workspaceResult.rows.length > 0) {
      console.log(`  EXISTS (NULLABLE: ${workspaceResult.rows[0].is_nullable})`);
    } else {
      console.log('  MISSING');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

inspectClientSchema();
