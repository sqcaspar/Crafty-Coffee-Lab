import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Database configuration for different environments
const DATABASE_PATH = process.env.DATABASE_PATH || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.RENDER ? '/opt/render/project/src/data/recipes.db' : '/app/data/recipes.db')
    : process.env.NODE_ENV === 'test' 
      ? './data/test_recipes.db'
      : './data/recipes.db');

interface QueryResult {
  rowCount: number;
  changes?: number;
  lastID?: number;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: sqlite3.Database | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<sqlite3.Database> {
    if (this.db) {
      return this.db;
    }

    // Ensure database directory exists
    const dbDir = dirname(DATABASE_PATH);
    if (!existsSync(dbDir)) {
      try {
        mkdirSync(dbDir, { recursive: true });
        console.log(`✅ Created database directory: ${dbDir}`);
      } catch (error) {
        console.error(`❌ Error creating database directory: ${error}`);
        throw error;
      }
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DATABASE_PATH, (err) => {
        if (err) {
          console.error('❌ Error connecting to database:', err);
          reject(err);
        } else {
          console.log(`✅ Connected to SQLite database at: ${DATABASE_PATH}`);
          
          // Enable foreign key constraints
          this.db!.run('PRAGMA foreign_keys = ON');
          
          resolve(this.db!);
        }
      });
    });
  }

  public async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
          reject(err);
        } else {
          console.log('✅ Database connection closed');
          this.db = null;
          resolve();
        }
      });
    });
  }

  public getDatabase(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Utility method to run queries with promises (INSERT, UPDATE, DELETE)
  public async run(sql: string, params: any[] = []): Promise<QueryResult> {
    const database = this.getDatabase();
    
    return new Promise((resolve, reject) => {
      database.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Database query error:', err);
          reject(err);
        } else {
          resolve({
            rowCount: this.changes,
            changes: this.changes,
            lastID: this.lastID
          });
        }
      });
    });
  }

  // Utility method to get single row
  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const database = this.getDatabase();
    
    return new Promise((resolve, reject) => {
      database.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ Database query error:', err);
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  // Utility method to get all rows
  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const database = this.getDatabase();
    
    return new Promise((resolve, reject) => {
      database.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Database query error:', err);
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
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