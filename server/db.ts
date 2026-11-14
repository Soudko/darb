import pg from 'pg';

// One shared connection pool. Tables are created in the development database and applied to production by Publish.
let pool: pg.Pool | null = null;

export function db(): pg.Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (!pool) pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return pool;
}
