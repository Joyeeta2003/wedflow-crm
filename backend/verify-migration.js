const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyMigration() {
  try {
    console.log('=== MIGRATION 036 VERIFICATION ===\n');

    const targetTables = [
      'board_columns', 'board_cards', 'booking_events', 'crew_assignments',
      'deliverables', 'editor_assignments', 'editor_plans', 'equipment_assignments',
      'package_day_crew', 'package_days', 'package_service', 'payment_schedules',
      'workflow_steps', 'user_sessions', 'user_activity_log'
    ];

    const targetFKs = [
      'fk_board_columns_workspace', 'fk_board_cards_workspace', 'fk_booking_events_workspace',
      'fk_crew_assignments_workspace', 'fk_deliverables_workspace', 'fk_editor_assignments_workspace',
      'fk_editor_plans_workspace', 'fk_equipment_assignments_workspace', 'fk_package_day_crew_workspace',
      'fk_package_days_workspace', 'fk_package_service_workspace', 'fk_payment_schedules_workspace',
      'fk_user_sessions_workspace', 'fk_user_activity_log_workspace', 'fk_workflow_steps_workspace'
    ];

    const targetIndexes = [
      'idx_board_columns_workspace', 'idx_board_cards_workspace', 'idx_booking_events_workspace',
      'idx_crew_assignments_workspace', 'idx_deliverables_workspace', 'idx_editor_assignments_workspace',
      'idx_editor_plans_workspace', 'idx_equipment_assignments_workspace', 'idx_package_day_crew_workspace',
      'idx_package_days_workspace', 'idx_package_service_workspace', 'idx_payment_schedules_workspace',
      'idx_user_sessions_workspace', 'idx_user_activity_log_workspace', 'idx_workflow_steps_workspace'
    ];

    // 1. Verify workspace_id columns exist
    console.log('1. WORKSPACE_ID COLUMNS:');
    let columnsPass = true;
    for (const table of targetTables) {
      const result = await pool.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = 'workspace_id';
      `, [table]);

      if (result.rows.length > 0) {
        console.log(`  ✓ ${table}.workspace_id exists (NULLABLE=${result.rows[0].is_nullable})`);
      } else {
        console.log(`  ✗ ${table}.workspace_id MISSING`);
        columnsPass = false;
      }
    }
    console.log(`\n  Result: ${columnsPass ? 'PASS' : 'FAIL'}\n`);

    // 2. Verify foreign keys exist
    console.log('2. FOREIGN KEY CONSTRAINTS:');
    let fksPass = true;
    for (const fk of targetFKs) {
      const result = await pool.query(`
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = $1;
      `, [fk]);

      if (result.rows.length > 0) {
        console.log(`  ✓ ${fk} on ${result.rows[0].table_name}`);
      } else {
        console.log(`  ✗ ${fk} MISSING`);
        fksPass = false;
      }
    }
    console.log(`\n  Result: ${fksPass ? 'PASS' : 'FAIL'}\n`);

    // 3. Verify indexes exist
    console.log('3. INDEXES:');
    let indexesPass = true;
    for (const idx of targetIndexes) {
      const result = await pool.query(`
        SELECT indexname, tablename
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = $1;
      `, [idx]);

      if (result.rows.length > 0) {
        console.log(`  ✓ ${idx} on ${result.rows[0].tablename}`);
      } else {
        console.log(`  ✗ ${idx} MISSING`);
        indexesPass = false;
      }
    }
    console.log(`\n  Result: ${indexesPass ? 'PASS' : 'FAIL'}\n`);

    // 4. Verify no NULL workspace_id values
    console.log('4. NULL workspace_id VALUES:');
    let nullsPass = true;
    for (const table of targetTables) {
      const result = await pool.query(`
        SELECT COUNT(*) as null_count
        FROM ${table}
        WHERE workspace_id IS NULL;
      `);

      const nullCount = parseInt(result.rows[0].null_count, 10);
      if (nullCount === 0) {
        console.log(`  ✓ ${table}: 0 NULL values`);
      } else {
        console.log(`  ✗ ${table}: ${nullCount} NULL values`);
        nullsPass = false;
      }
    }
    console.log(`\n  Result: ${nullsPass ? 'PASS' : 'FAIL'}\n`);

    // 5. Verify users.workspace_id is NOT NULL
    console.log('5. users.workspace_id NOT NULL:');
    const usersNullableResult = await pool.query(`
      SELECT is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'workspace_id';
    `);
    const usersNotNull = usersNullableResult.rows.length > 0 && usersNullableResult.rows[0].is_nullable === 'NO';
    console.log(`  ${usersNotNull ? '✓' : '✗'} users.workspace_id is ${usersNotNull ? 'NOT NULL' : 'NULLABLE'}`);
    console.log(`\n  Result: ${usersNotNull ? 'PASS' : 'FAIL'}\n`);

    // 6. Verify user_activity_log backfill
    console.log('6. user_activity_log BACKFILL:');
    const activityLogResult = await pool.query(`
      SELECT ual.id, ual.workspace_id, u.workspace_id as user_workspace_id
      FROM user_activity_log ual
      JOIN users u ON ual.user_id = u.id;
    `);
    if (activityLogResult.rows.length > 0) {
      const allMatch = activityLogResult.rows.every(row => row.workspace_id === row.user_workspace_id);
      console.log(`  ${allMatch ? '✓' : '✗'} user_activity_log.workspace_id matches users.workspace_id`);
      console.log(`  Total rows: ${activityLogResult.rows.length}`);
    } else {
      console.log(`  ✓ No rows in user_activity_log (expected)`);
    }
    console.log(`\n  Result: ${activityLogResult.rows.length === 0 || activityLogResult.rows.every(row => row.workspace_id === row.user_workspace_id) ? 'PASS' : 'FAIL'}\n`);

    // 7. Verify user/workspace relationships unchanged
    console.log('7. USER/WORKSPACE RELATIONSHIPS:');
    const userWorkspaceResult = await pool.query(`
      SELECT COUNT(*) as total_users
      FROM users;
    `);
    const usersWithWorkspace = await pool.query(`
      SELECT COUNT(*) as users_with_workspace
      FROM users
      WHERE workspace_id IS NOT NULL;
    `);
    console.log(`  Total users: ${userWorkspaceResult.rows[0].total_users}`);
    console.log(`  Users with workspace_id: ${usersWithWorkspace.rows[0].users_with_workspace}`);
    console.log(`  ${userWorkspaceResult.rows[0].total_users === usersWithWorkspace.rows[0].users_with_workspace ? '✓' : '✗'} All users have workspace_id`);
    console.log(`\n  Result: ${userWorkspaceResult.rows[0].total_users === usersWithWorkspace.rows[0].users_with_workspace ? 'PASS' : 'FAIL'}\n`);

    // 8. Final verdict
    const allPass = columnsPass && fksPass && indexesPass && nullsPass && usersNotNull;
    
    console.log('=== FINAL VERDICT ===');
    console.log(`MIGRATION 036: ${allPass ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.error('Verification error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

verifyMigration();
