const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function auditRLS() {
  try {
    console.log('=== DATABASE SECURITY & RLS AUDIT ===\n');

    // 1. List all public tables
    console.log('1. PUBLIC TABLES:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log('Tables:', tables.join(', '));
    console.log(`Total: ${tables.length} tables\n`);

    // 2. Check RLS status for each table
    console.log('2. RLS STATUS:');
    const rlsStatusResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    rlsStatusResult.rows.forEach(row => {
      console.log(`  ${row.tablename}: RLS ${row.rls_enabled ? 'ENABLED' : 'DISABLED'}`);
    });
    console.log();

    // 3. List all RLS policies
    console.log('3. RLS POLICIES:');
    const policiesResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    if (policiesResult.rows.length === 0) {
      console.log('  NO RLS POLICIES FOUND');
    } else {
      policiesResult.rows.forEach(row => {
        console.log(`  Table: ${row.tablename}`);
        console.log(`    Policy: ${row.policyname}`);
        console.log(`    Command: ${row.cmd}`);
        console.log(`    Roles: ${row.roles || 'PUBLIC'}`);
        console.log(`    Using: ${row.qual || 'N/A'}`);
        console.log(`    With Check: ${row.with_check || 'N/A'}`);
        console.log();
      });
    }
    console.log(`Total: ${policiesResult.rows.length} policies\n`);

    // 4. Check workspace_id columns
    console.log('4. WORKSPACE_ID COLUMNS:');
    const workspaceColumnsResult = await pool.query(`
      SELECT 
        table_name,
        column_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND column_name = 'workspace_id'
      ORDER BY table_name;
    `);
    if (workspaceColumnsResult.rows.length === 0) {
      console.log('  NO workspace_id COLUMNS FOUND');
    } else {
      workspaceColumnsResult.rows.forEach(row => {
        console.log(`  ${row.table_name}.workspace_id: NULLABLE=${row.is_nullable}, DEFAULT=${row.column_default || 'none'}`);
      });
    }
    console.log();

    // 5. Check foreign key constraints for workspace_id
    console.log('5. WORKSPACE_ID FOREIGN KEYS:');
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
      AND kcu.column_name = 'workspace_id'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `);
    if (fkResult.rows.length === 0) {
      console.log('  NO workspace_id FOREIGN KEYS FOUND');
    } else {
      fkResult.rows.forEach(row => {
        console.log(`  ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    }
    console.log();

    // 6. Check users table structure
    console.log('6. USERS TABLE STRUCTURE:');
    const usersColumnsResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      ORDER BY ordinal_position;
    `);
    usersColumnsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (NULLABLE=${row.is_nullable})`);
    });
    console.log();

    // 7. Check workspace table structure
    console.log('7. WORKSPACE TABLE STRUCTURE:');
    const workspaceTableColumnsResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'workspace'
      ORDER BY ordinal_position;
    `);
    workspaceTableColumnsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (NULLABLE=${row.is_nullable})`);
    });
    console.log();

    // 8. Check for tables without workspace_id that should have it
    console.log('8. TABLES WITHOUT workspace_id (SHOULD HAVE):');
    const tablesWithoutWorkspace = tables.filter(table => 
      !workspaceColumnsResult.rows.some(row => row.table_name === table)
    );
    // Filter out system/auth tables
    const crmTablesWithoutWorkspace = tablesWithoutWorkspace.filter(table => 
      !['otp_codes', 'user_activity_log'].includes(table)
    );
    if (crmTablesWithoutWorkspace.length === 0) {
      console.log('  NONE (all CRM tables have workspace_id)');
    } else {
      crmTablesWithoutWorkspace.forEach(table => {
        console.log(`  ${table}`);
      });
    }
    console.log();

    console.log('=== AUDIT COMPLETE ===');

  } catch (error) {
    console.error('Audit error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

auditRLS();
