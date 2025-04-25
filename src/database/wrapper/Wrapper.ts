// PostgreSQL-style SQLite wrapper for Expo in TypeScript
// Install: expo install expo-sqlite

import * as SQLite from 'expo-sqlite';

// Types for database operations
type SQLiteDatabase = SQLite.sq;
type SQLiteResult = {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item(index: number): any;
    _array: any[];
  };
};

// Types for query transformer
interface QueryTransformer {
  pattern: RegExp;
  transform: (match: string, ...groups: string[]) => string;
}

class PostgresLiteBridge {
  private db: SQLiteDatabase;
  private initialized: boolean;
  private queryTransformers: QueryTransformer[];
  private returningCol: string | null = null;

  constructor(dbName: string) {
    this.db = SQLite.openDatabase(dbName);
    this.initialized = false;
    this.queryTransformers = this.setupQueryTransformers();
  }

  // Initialize database - call this before using other methods
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    // Here we can create helper tables or functions if needed
    await this.exec(`
      PRAGMA foreign_keys = ON;
    `);
    
    this.initialized = true;
    return true;
  }

  // Setup transformers for PostgreSQL to SQLite syntax
  private setupQueryTransformers(): QueryTransformer[] {
    return [
      // Transform PostgreSQL's RETURNING to SQLite's method of getting last inserted ID
      {
        pattern: /INSERT INTO\s+(\w+)\s+\((.*?)\)\s+VALUES\s+\((.*?)\)\s+RETURNING\s+(\w+)/i,
        transform: (match, table, columns, values, returningCol) => {
          // Store the returning column name for later use
          this.returningCol = returningCol;
          return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
        }
      },
      // Transform NOW() to SQLite's datetime function
      {
        pattern: /NOW\(\)/g,
        transform: () => "datetime('now')"
      },
      // Transform SERIAL to INTEGER PRIMARY KEY AUTOINCREMENT 
      {
        pattern: /SERIAL/g,
        transform: () => "INTEGER PRIMARY KEY AUTOINCREMENT"
      },
      // Transform TEXT[] to TEXT for array types (stored as JSON in SQLite)
      {
        pattern: /TEXT\[\]/g,
        transform: () => "TEXT"
      },
      // Transform JSONB to TEXT (stored as JSON string in SQLite)
      {
        pattern: /JSONB/g,
        transform: () => "TEXT"
      },
      // Transform FOR UPDATE to empty string (not supported in SQLite)
      {
        pattern: /\sFOR\sUPDATE/gi,
        transform: () => ""
      },
      // Transform CREATE TABLE IF NOT EXISTS with SERIAL 
      {
        pattern: /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)\s*\(([\s\S]*?)(\w+)\s+SERIAL([\s\S]*?)\)/gi,
        transform: (match, table, before, idCol, after) => {
          return `CREATE TABLE IF NOT EXISTS ${table} (${idCol} INTEGER PRIMARY KEY AUTOINCREMENT${before}${after})`;
        }
      }
    ];
  }

  // Transform PostgreSQL query to SQLite compatible query
  private transformQuery(query: string): string {
    let transformedQuery = query;
    
    for (const transformer of this.queryTransformers) {
      transformedQuery = transformedQuery.replace(
        transformer.pattern, 
        transformer.transform as any
      );
    }
    
    return transformedQuery;
  }

  // Execute a query and return a promise
  async query<T = any>(pgQuery: string, params: any[] = []): Promise<T[]> {
    const sqliteQuery = this.transformQuery(pgQuery);
    const isSelectQuery = sqliteQuery.trim().toLowerCase().startsWith('select');
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sqliteQuery, 
          params,
          (_, result) => {
            if (isSelectQuery) {
              // For SELECT queries, return rows as an array like PostgreSQL client
              resolve(result.rows._array as T[]);
            } else if (sqliteQuery.toLowerCase().includes('insert')) {
              // For INSERT, if original had RETURNING, create a similar response
              if (this.returningCol) {
                const returnObj: any = {};
                returnObj[this.returningCol] = result.insertId;
                resolve([returnObj] as T[]); // Return as array with one object to match pg behavior
                this.returningCol = null; // Reset for next query
              } else {
                resolve([] as T[]);
              }
            } else {
              resolve([] as T[]);
            }
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  // Execute a raw SQL command (for CREATE TABLE, etc.)
  async exec(sqlCommand: string): Promise<boolean> {
    const commands = sqlCommand.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const command of commands) {
      await this.query(command);
    }
    
    return true;
  }

  // Create a table with PostgreSQL-like syntax
  async createTable(tableName: string, columnsDefinition: string): Promise<boolean> {
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDefinition})`;
    return this.exec(createTableSQL);
  }

  // Close the database connection
  close(): void {
    // SQLite in Expo doesn't have an explicit close method
    // But we can mark our wrapper as uninitialized
    this.initialized = false;
  }

  // Helper function to convert PostgreSQL array syntax to JSON
  pgArrayToJson<T>(array: T[] | null): string | null {
    if (!array) return null;
    return JSON.stringify(array);
  }

  // Helper function to convert JSON to PostgreSQL array
  jsonToPgArray<T>(json: string | null): T[] | null {
    if (!json) return null;
    try {
      return JSON.parse(json) as T[];
    } catch (e) {
      return null;
    }
  }
}

// Types for our database models
interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  tags: string[];
  metadata: any;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  username?: string; // For joined queries
}

// Example usage
export default function usePostgresLite() {
  const db = new PostgresLiteBridge('myapp.db');
  
  return {
    initialize: async (): Promise<boolean> => {
      return await db.initialize();
    },
    
    // Set up your database schema with PostgreSQL-like syntax
    setupSchema: async (): Promise<boolean> => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL,
          username TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          tags TEXT,
          metadata JSONB
        );
        
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users (id)
        );
      `);
      return true;
    },
    
    // Example functions using PostgreSQL-style queries
    createUser: async (
      username: string, 
      email: string, 
      tags: string[] = [], 
      metadata: any = {}
    ): Promise<number> => {
      const tagsJson = db.pgArrayToJson(tags);
      const metadataJson = JSON.stringify(metadata);
      
      const result = await db.query<{id: number}>(
        `INSERT INTO users (username, email, tags, metadata) 
         VALUES (?, ?, ?, ?) RETURNING id`,
        [username, email, tagsJson, metadataJson]
      );
      
      return result[0].id;
    },
    
    getUserById: async (id: number): Promise<User | null> => {
      const users = await db.query<User>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) return null;
      
      // Transform specific fields back to PostgreSQL-like format
      const user = users[0];
      if (user.tags) user.tags = db.jsonToPgArray<string>(user.tags as unknown as string) || [];
      if (user.metadata) user.metadata = JSON.parse(user.metadata as unknown as string);
      
      return user;
    },
    
    createPost: async (userId: number, title: string, content: string): Promise<number> => {
      const result = await db.query<{id: number}>(
        `INSERT INTO posts (user_id, title, content) 
         VALUES (?, ?, ?) RETURNING id`,
        [userId, title, content]
      );
      
      return result[0].id;
    },
    
    getUserPosts: async (userId: number): Promise<Post[]> => {
      return await db.query<Post>(
        `SELECT p.*, u.username 
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC`,
        [userId]
      );
    },
    
    // Raw query access if needed
    rawQuery: async <T = any>(query: string, params: any[] = []): Promise<T[]> => {
      return await db.query<T>(query, params);
    }
  };
}