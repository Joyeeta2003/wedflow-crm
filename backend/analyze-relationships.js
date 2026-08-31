const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function analyzeRelationships() {
  try {
    console.log('=== DATABASE RELATIONSHIP ANALYSIS ===\n');

    // Tables without workspace_id
    const tablesWithoutWorkspace = [
      'board_cards', 'board_columns', 'booking_events', 'crew_assignments',
      'deliverables', 'editor_assignments', 'editor_plans', 'equipment_assignments',
      'package_day_crew', 'package_days', 'package_service', 'payment_schedules',
      'workflow_steps', 'user_sessions', 'workspace', 'crew_types'
    ];

    // 1. Get all foreign keys for tables without workspace_id
    console.log('1. FOREIGN KEYS FOR TABLES WITHOUT workspace_id:');
    for (const table of tablesWithoutWorkspace) {
      const fkResult = await pool.query(`
        SELECT
          tc.table_name,
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
        AND tc.table_name = $1
        ORDER BY kcu.ordinal_position;
      `, [table]);

      if (fkResult.rows.length > 0) {
        console.log(`\n  ${table}:`);
        fkResult.rows.forEach(row => {
          console.log(`    ${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
        });
      } else {
        console.log(`\n  ${table}: NO FOREIGN KEYS`);
      }
    }
    console.log();

    // 2. Check if parent tables have workspace_id
    console.log('2. WORKSPACE_ID IN PARENT TABLES:');
    const parentTables = new Set();
    for (const table of tablesWithoutWorkspace) {
      const fkResult = await pool.query(`
        SELECT DISTINCT ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1;
      `, [table]);

      fkResult.rows.forEach(row => {
        parentTables.add(row.foreign_table_name);
      });
    }

    for (const parent of Array.from(parentTables).sort()) {
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
        console.log(`  ${parent}.workspace_id: MISSING`);
      }
    }
    console.log();

    // 3. Count users per workspace
    console.log('3. USERS PER WORKSPACE:');
    const usersPerWorkspace = await pool.query(`
      SELECT workspace_id, COUNT(*) as user_count
      FROM users
      GROUP BY workspace_id
      ORDER BY workspace_id;
    `);
    if (usersPerWorkspace.rows.length === 0) {
      console.log('  NO USERS FOUND');
    } else {
      usersPerWorkspace.rows.forEach(row => {
        console.log(`  ${row.workspace_id || 'NULL'}: ${row.user_count} users`);
      });
    }
    console.log();

    // 4. Count rows per workspace for workspace-owned tables
    console.log('4. ROWS PER WORKSPACE (WORKSPACE-OWNED TABLES):');
    const workspaceTables = [
      'albums', 'boards', 'bookings', 'client', 'client_reviews', 'deliveries',
      'equipment', 'equipment_maintenance', 'event_type', 'files',
      'freelancer_assignments', 'freelancers', 'invoices', 'notifications',
      'packages', 'payment_methods', 'payments', 'production_jobs', 'qc_reviews',
      'revisions', 'service_master', 'staff', 'storage_categories', 'storage_items',
      'work_requests', 'workflow_assignments', 'workflows'
    ];

    for (const table of workspaceTables) {
      const countResult = await pool.query(`
        SELECT workspace_id, COUNT(*) as row_count
        FROM ${table}
        GROUP BY workspace_id
        ORDER BY workspace_id;
      `);

      if (countResult.rows.length > 0) {
        console.log(`\n  ${table}:`);
        countResult.rows.forEach(row => {
          console.log(`    ${row.workspace_id || 'NULL'}: ${row.row_count} rows`);
        });
      }
    }
    console.log();

    // 5. Check for orphaned rows in tables without workspace_id
    console.log('5. ORPHANED ROWS CHECK (TABLES WITHOUT workspace_id):');
    for (const table of tablesWithoutWorkspace) {
      if (table === 'workspace' || table === 'crew_types' || table === 'user_sessions') {
        continue; // Skip reference tables
      }

      const fkResult = await pool.query(`
        SELECT
          tc.table_name,
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
        AND tc.table_name = $1
        LIMIT 1;
      `, [table]);

      if (fkResult.rows.length > 0) {
        const fk = fkResult.rows[0];
        const orphanedResult = await pool.query(`
          SELECT COUNT(*) as orphaned_count
          FROM ${table} t
          LEFT JOIN ${fk.foreign_table_name} p ON t.${fk.column_name} = p.${fk.foreign_column_name}
          WHERE p.${fk.foreign_column_name} IS NULL;
        `);

        if (orphanedResult.rows[0].orphaned_count > 0) {
          console.log(`  ${table}: ${orphanedResult.rows[0].orphaned_count} orphaned rows (missing parent in ${fk.foreign_table_name})`);
        }
      }
    }
    console.log();

    // 6. Check workspace_id nullable status
    console.log('6. WORKSPACE_ID NULLABLE STATUS:');
    const nullableResult = await pool.query(`
      SELECT 
        table_name,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND column_name = 'workspace_id'
      ORDER BY table_name;
    `);
    nullableResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.workspace_id: ${row.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });
    console.log();

    // 7. Total row counts for tables without workspace_id
    console.log('7. TOTAL ROW COUNTS (TABLES WITHOUT workspace_id):');
    for (const table of tablesWithoutWorkspace) {
      const countResult = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
      console.log(`  ${table}: ${countResult.rows[0].total} rows`);
    }
    console.log();

    console.log('=== ANALYSIS COMPLETE ===');

  } catch (error) {
    console.error('Analysis error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

analyzeRelationships();
