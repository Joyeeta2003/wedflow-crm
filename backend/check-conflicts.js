const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConflicts() {
  try {
    console.log('=== PRE-EXECUTION CONFLICT CHECK ===\n');

    // 1. Check for existing workspace_id columns
    console.log('1. EXISTING workspace_id COLUMNS:');
    const existingWorkspaceColumns = await pool.query(`
      SELECT table_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND column_name = 'workspace_id'
      ORDER BY table_name;
    `);
    const existingTables = existingWorkspaceColumns.rows.map(r => r.table_name);
    console.log('  Tables with workspace_id:', existingTables.join(', '));
    console.log(`  Total: ${existingTables.length} tables\n`);

    // 2. Check for existing foreign key constraints with our naming pattern
    console.log('2. EXISTING FOREIGN KEY CONSTRAINTS (CHECKING FOR CONFLICTS):');
    const targetFKs = [
      'fk_board_columns_workspace', 'fk_board_cards_workspace', 'fk_booking_events_workspace',
      'fk_crew_assignments_workspace', 'fk_deliverables_workspace', 'fk_editor_assignments_workspace',
      'fk_editor_plans_workspace', 'fk_equipment_assignments_workspace', 'fk_package_day_crew_workspace',
      'fk_package_days_workspace', 'fk_package_service_workspace', 'fk_payment_schedules_workspace',
      'fk_user_sessions_workspace', 'fk_user_activity_log_workspace', 'fk_workflow_steps_workspace'
    ];

    const existingFKs = await pool.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = ANY($1)
    `, [targetFKs]);

    if (existingFKs.rows.length > 0) {
      console.log('  CONFLICTS FOUND:');
      existingFKs.rows.forEach(fk => {
        console.log(`    ${fk.constraint_name} on ${fk.table_name}`);
      });
    } else {
      console.log('  NO CONFLICTS - All FK names are available');
    }
    console.log();

    // 3. Check for existing indexes with our naming pattern
    console.log('3. EXISTING INDEXES (CHECKING FOR CONFLICTS):');
    const targetIndexes = [
      'idx_board_columns_workspace', 'idx_board_cards_workspace', 'idx_booking_events_workspace',
      'idx_crew_assignments_workspace', 'idx_deliverables_workspace', 'idx_editor_assignments_workspace',
      'idx_editor_plans_workspace', 'idx_equipment_assignments_workspace', 'idx_package_day_crew_workspace',
      'idx_package_days_workspace', 'idx_package_service_workspace', 'idx_payment_schedules_workspace',
      'idx_user_sessions_workspace', 'idx_user_activity_log_workspace', 'idx_workflow_steps_workspace'
    ];

    const existingIndexes = await pool.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname = ANY($1)
    `, [targetIndexes]);

    if (existingIndexes.rows.length > 0) {
      console.log('  CONFLICTS FOUND:');
      existingIndexes.rows.forEach(idx => {
        console.log(`    ${idx.indexname} on ${idx.tablename}`);
      });
    } else {
      console.log('  NO CONFLICTS - All index names are available');
    }
    console.log();

    // 4. Verify parent tables have workspace_id
    console.log('4. PARENT TABLES workspace_id STATUS:');
    const parentTables = ['boards', 'bookings', 'packages', 'workflows', 'users', 'booking_events', 'package_days', 'editor_plans'];
    for (const parent of parentTables) {
      const wsResult = await pool.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = 'workspace_id';
      `, [parent]);

      if (wsResult.rows.length > 0) {
        console.log(`  ${parent}.workspace_id: EXISTS (NULLABLE=${wsResult.rows[0].is_nullable})`);
      } else {
        console.log(`  ${parent}.workspace_id: MISSING - MIGRATION WILL FAIL`);
      }
    }
    console.log();

    // 5. Check user_activity_log foreign key to users
    console.log('5. user_activity_log → users RELATIONSHIP:');
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
      activityLogFK.rows.forEach(fk => {
        console.log(`  ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('  NO FOREIGN KEYS FOUND');
    }
    console.log();

    // 6. Check current row counts for affected tables
    console.log('6. CURRENT ROW COUNTS (AFFECTED TABLES):');
    const affectedTables = [
      'board_columns', 'board_cards', 'booking_events', 'crew_assignments',
      'deliverables', 'editor_assignments', 'editor_plans', 'equipment_assignments',
      'package_day_crew', 'package_days', 'package_service', 'payment_schedules',
      'workflow_steps', 'user_sessions', 'user_activity_log'
    ];

    for (const table of affectedTables) {
      const countResult = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
      console.log(`  ${table}: ${countResult.rows[0].total} rows`);
    }
    console.log();

    // 7. Check users.workspace_id NULL values
    console.log('7. users.workspace_id NULL VALUES:');
    const nullUsersResult = await pool.query(`
      SELECT COUNT(*) as null_count
      FROM users
      WHERE workspace_id IS NULL
    `);
    console.log(`  Users with NULL workspace_id: ${nullUsersResult.rows[0].null_count}`);
    console.log();

    console.log('=== CONFLICT CHECK COMPLETE ===');

  } catch (error) {
    console.error('Check error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

checkConflicts();
