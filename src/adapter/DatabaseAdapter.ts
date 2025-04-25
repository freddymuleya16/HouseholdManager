import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Configuration interface for database connection
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  max?: number; // max connections in pool
  idleTimeoutMillis?: number;
}

// Generic type for creating a repository
type RepositoryOptions = {
  tableName: string;
  primaryKey?: string;
}

// Base repository for CRUD operations
class PostgresAdapter<T extends { id?: string }> {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    // Create connection pool
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl || false,
      max: config.max || 10,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000
    });

    // Handle connection errors
    this.pool.on('error', (err:any) => {
      console.error('Unexpected PostgreSQL client error', err);
    });
  }

  // Public method to get a client from the pool
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // Generic repository for CRUD operations
  createRepository<Entity extends T>(options: RepositoryOptions) {
    const { tableName, primaryKey = 'id' } = options;

    return {
      // Expose pool for direct access if needed
      pool: this.pool,

      // Create a new record
      async create(data: Omit<Entity, 'id'>): Promise<Entity> {
        const client = await this.pool.connect();
        try {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

          const query = `
            INSERT INTO ${tableName} (${keys.join(', ')}, ${primaryKey}) 
            VALUES (${placeholders}, $${keys.length + 1}) 
            RETURNING *
          `;

          const result = await client.query(query, [...values, uuidv4()]);
          return result.rows[0];
        } finally {
          client.release();
        }
      },

      // Find by ID
      async findById(id: string): Promise<Entity | null> {
        const client = await this.pool.connect();
        try {
          const query = `SELECT * FROM ${tableName} WHERE ${primaryKey} = $1`;
          const result = await client.query(query, [id]);
          return result.rows[0] || null;
        } finally {
          client.release();
        }
      },

      // Find with complex filtering
      async find(filters: Partial<Entity>, options?: {
        limit?: number, 
        offset?: number, 
        orderBy?: string
      }): Promise<Entity[]> {
        const client = await this.pool.connect();
        try {
          const filterKeys = Object.keys(filters);
          const placeholders = filterKeys.map((_, i) => `${filterKeys[i]} = $${i + 1}`).join(' AND ');
          
          const query = `
            SELECT * FROM ${tableName}
            ${filterKeys.length ? `WHERE ${placeholders}` : ''}
            ${options?.orderBy ? `ORDER BY ${options.orderBy}` : ''}
            ${options?.limit ? `LIMIT ${options.limit}` : ''}
            ${options?.offset ? `OFFSET ${options.offset}` : ''}
          `;

          const result = await client.query(query, Object.values(filters));
          return result.rows;
        } finally {
          client.release();
        }
      },

      // Update a record
      async update(id: string, data: Partial<Entity>): Promise<Entity | null> {
        const client = await this.pool.connect();
        try {
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

          const query = `
            UPDATE ${tableName} 
            SET ${setClause} 
            WHERE ${primaryKey} = $${keys.length + 1} 
            RETURNING *
          `;

          const result = await client.query(query, [...values, id]);
          return result.rows[0] || null;
        } finally {
          client.release();
        }
      },

      // Delete a record
      async delete(id: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
          const query = `DELETE FROM ${tableName} WHERE ${primaryKey} = $1`;
          const result = await client.query(query, [id]);
          const rowCount = result.rowCount??0;
          return rowCount > 0;
        } finally {
          client.release();
        }
      },

      // Raw query method for complex operations
      async rawQuery<R extends QueryResultRow>(
        query: string, 
        params?: any[]
      ): Promise<QueryResult<R>> {
        const client = await this.pool.connect();
        try {
          return await client.query<R>(query, params);
        } finally {
          client.release();
        }
      }
    };
  }

  // Transaction helper
  async transaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Connection management
  async ping(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  // Shutdown the connection pool
  async shutdown(): Promise<void> {
    await this.pool.end();
  }
}
const adapter = new PostgresAdapter({
  host: "string",
  port: 1,
  user: "string",
  password: "string",
  database: "string",
  ssl: true,
  max: 1, // max connections in pool
  idleTimeoutMillis: 1,
})

export default adapter;