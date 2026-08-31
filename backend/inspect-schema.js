const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function inspectSchema() {
  try {
    console.log('=== DETAILED SCHEMA INSPECTION ===\n');

    const tablesToInspect = [
      'board_columns', 'board_cards', 'booking_events', 'crew_assignments',
      'equipment_assignments', 'deliverables', 'editor_plans', 'package_days',
      'package_service', 'payment_schedules', 'package_day_crew', 'editor_assignments',
      'workflow_steps', 'user_sessions', 'user_activity_log', 'users'
    ];

    // 1. Inspect column details for each table
    console.log('1. COLUMN DETAILS:');
    for (const table of tablesToInspect) {
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      console.log(`\n  ${table}:`);
      columnsResult.rows.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})` 
          : col.data_type;
        console.log(`    ${col.column_name}: ${type} (NULLABLE=${col.is_nullable}, DEFAULT=${col.column_default || 'none'})`);
      });
    }
    console.log();

    // 2. Inspect all foreign keys for each table
    console.log('2. FOREIGN KEY DETAILS:');
    for (const table of tablesToInspect) {
      const fkResult = await pool.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
          AND tc.constraint_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
        ORDER BY kcu.ordinal_position;
      `, [table]);

      if (fkResult.rows.length > 0) {
        console.log(`\n  ${table}:`);
        fkResult.rows.forEach(fk => {
          console.log(`    ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
          console.log(`      ON UPDATE ${fk.update_rule}, ON DELETE ${fk.delete_rule}`);
        });
      } else {
        console.log(`\n  ${table}: NO FOREIGN KEYS`);
      }
    }
    console.log();

    // 3. Check parent tables for workspace_id
    console.log('3. PARENT TABLES WORKSPACE_ID STATUS:');
    const parentTables = [
      'boards', 'bookings', 'packages', 'workflows', 'users', 'booking_events',
      'package_days', 'editor_plans'
    ];

    for (const parent of parentTables) {
      const wsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = 'workspace_id';
      `, [parent]);

      if (wsResult.rows.length > 0) {
        const col = wsResult.rows[0];
        console.log(`  ${parent}.workspace_id: ${col.data_type} (NULLABLE=${col.is_nullable})`);
      } else {
        console.log(`  ${parent}.workspace_id: MISSING`);
      }
    }
    console.log();

    // 4. Check current row counts
    console.log('4. CURRENT ROW COUNTS:');
    for (const table of tablesToInspect) {
      const countResult = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
      console.log(`  ${table}: ${countResult.rows[0].total} rows`);
    }
    console.log();

    // 5. Check user_activity_log structure specifically
    console.log('5. USER_ACTIVITY_LOG STRUCTURE:');
    const activityLogColumns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_activity_log'
      ORDER BY ordinal_position;
    `);
    activityLogColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (NULLABLE=${col.is_nullable})`);
    });

    const activityLogFK = await pool.query(`
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
      AND tc.table_name = 'user_activity_log';
    `);
    if (activityLogFK.rows.length > 0) {
      console.log('\n  Foreign Keys:');
      activityLogFK.rows.forEach(fk => {
        console.log(`    ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    console.log();

    console.log('=== INSPECTION COMPLETE ===');

  } catch (error) {
    console.error('Inspection error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

inspectSchema();
