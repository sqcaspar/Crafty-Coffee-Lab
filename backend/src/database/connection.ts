import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const DB_PATH = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.join(__dirname, '../../../data/recipes.db');

// Enable verbose mode in development
const sqlite = process.env.NODE_ENV === 'development' 
  ? sqlite3.verbose() 
  : sqlite3;

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
    return new Promise(async (resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }

      // Create data directory if it doesn't exist
      if (DB_PATH !== ':memory:') {
        const fs = await import('fs');
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      }

      this.db = new sqlite.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
          reject(err);
        } else {
          console.log(`✅ Connected to SQLite database: ${DB_PATH === ':memory:' ? 'in-memory' : DB_PATH}`);
          // Enable foreign key constraints
          this.db!.run('PRAGMA foreign_keys = ON');
          resolve(this.db!);
        }
      });
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve();
      }

      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
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

  // Utility method to run queries with promises
  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      const db = this.getDatabase();
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  // Utility method to get single row
  public async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const db = this.getDatabase();
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  // Utility method to get all rows
  public async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDatabase();
      db.all(sql, params, (err, rows) => {
        if (err) {
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