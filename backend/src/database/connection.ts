import { Pool, PoolClient, QueryResult } from 'pg';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || process.env.NODE_ENV === 'test' 
  ? 'postgresql://test:test@localhost:5432/test_db'
  : 'postgresql://localhost:5432/coffee_tracker';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    try {
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ Connected to PostgreSQL database');
      return this.pool;
    } catch (err) {
      console.error('❌ Error connecting to database:', err);
      throw err;
    }
  }

  public async close(): Promise<void> {
    if (!this.pool) {
      return;
    }

    try {
      await this.pool.end();
      console.log('✅ Database connection pool closed');
      this.pool = null;
    } catch (err) {
      console.error('❌ Error closing database pool:', err);
      throw err;
    }
  }

  public getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  // Utility method to run queries with promises (INSERT, UPDATE, DELETE)
  public async run(sql: string, params: any[] = []): Promise<QueryResult> {
    const pool = this.getPool();
    try {
      const result = await pool.query(sql, params);
      return result;
    } catch (err) {
      console.error('❌ Database query error:', err);
      throw err;
    }
  }

  // Utility method to get single row
  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const pool = this.getPool();
    try {
      const result = await pool.query(sql, params);
      return result.rows[0] as T;
    } catch (err) {
      console.error('❌ Database query error:', err);
      throw err;
    }
  }

  // Utility method to get all rows
  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const pool = this.getPool();
    try {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    } catch (err) {
      console.error('❌ Database query error:', err);
      throw err;
    }
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connection...');
  await db.close();
  process.exit(0);
});