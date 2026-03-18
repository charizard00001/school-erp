require('dotenv/config');
const { Pool } = require('pg');

// Test with the old ecommerce project to confirm pooler works for established projects
const testUrl = 'postgres://postgres.vgxrdgsckhvccfmyoihe:test@aws-0-northeast-2.pooler.supabase.com:6543/postgres';
console.log('Testing older project pooler...');
const pool2 = new Pool({ connectionString: testUrl, ssl: { rejectUnauthorized: false } });
pool2.query('SELECT 1').then(r => { console.log('Old project pooler: Connected!'); pool2.end(); }).catch(e => { console.log('Old project pooler error:', e.message?.substring(0, 100)); pool2.end(); });

// Also test new project
console.log('URL:', process.env.DATABASE_URL?.replace(/:[^@]+@/, ':***@'));
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT 1').then(r => { console.log('New project: Connected!'); pool.end(); }).catch(e => { console.log('New project error:', e.message?.substring(0, 100)); pool.end(); });
