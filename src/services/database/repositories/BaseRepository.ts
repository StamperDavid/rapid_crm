import { DatabaseService, QueryResult } from '../DatabaseService';

export interface RepositoryOptions {
  connectionId?: string;
  cache?: boolean;
  cacheTimeout?: number;
}

export abstract class BaseRepository<T> {
  protected db: DatabaseService;
  protected tableName: string;
  protected primaryKey: string;

  constructor(db: DatabaseService, tableName: string, primaryKey: string = 'id') {
    this.db = db;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  async findAll(options: RepositoryOptions = {}): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`;
    const result = await this.db.executeQuery<T>(options.connectionId || 'primary', query);
    return result.data;
  }

  async findById(id: string, options: RepositoryOptions = {}): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.db.executeQuery<T>(options.connectionId || 'primary', query, [id]);
    return result.data[0] || null;
  }

  async findBy(field: string, value: any, options: RepositoryOptions = {}): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $1`;
    const result = await this.db.executeQuery<T>(options.connectionId || 'primary', query, [value]);
    return result.data;
  }

  async create(data: Partial<T>, options: RepositoryOptions = {}): Promise<T> {
    const fields = Object.keys(data).filter(key => data[key as keyof T] !== undefined);
    const values = fields.map(field => data[field as keyof T]);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;
    
    const result = await this.db.executeQuery<T>(options.connectionId || 'primary', query, values);
    return result.data[0];
  }

  async update(id: string, data: Partial<T>, options: RepositoryOptions = {}): Promise<T | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof T] !== undefined);
    const values = fields.map(field => data[field as keyof T]);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW() 
      WHERE ${this.primaryKey} = $${fields.length + 1} 
      RETURNING *
    `;
    
    const result = await this.db.executeQuery<T>(
      options.connectionId || 'primary', 
      query, 
      [...values, id]
    );
    
    return result.data[0] || null;
  }

  async delete(id: string, options: RepositoryOptions = {}): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.db.executeQuery(options.connectionId || 'primary', query, [id]);
    return result.count > 0;
  }

  async count(options: RepositoryOptions = {}): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const result = await this.db.executeQuery<{ count: string }>(options.connectionId || 'primary', query);
    return parseInt(result.data[0]?.count || '0');
  }

  async exists(id: string, options: RepositoryOptions = {}): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = $1 LIMIT 1`;
    const result = await this.db.executeQuery(options.connectionId || 'primary', query, [id]);
    return result.data.length > 0;
  }

  async search(searchTerm: string, searchFields: string[], options: RepositoryOptions = {}): Promise<T[]> {
    const conditions = searchFields.map((field, index) => 
      `${field} ILIKE $${index + 1}`
    ).join(' OR ');
    
    const searchValue = `%${searchTerm}%`;
    const params = searchFields.map(() => searchValue);
    
    const query = `SELECT * FROM ${this.tableName} WHERE ${conditions} ORDER BY created_at DESC`;
    const result = await this.db.executeQuery<T>(options.connectionId || 'primary', query, params);
    return result.data;
  }

  async paginate(
    page: number = 1, 
    limit: number = 10, 
    orderBy: string = 'created_at', 
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    options: RepositoryOptions = {}
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const countResult = await this.db.executeQuery<{ count: string }>(options.connectionId || 'primary', countQuery);
    const total = parseInt(countResult.data[0]?.count || '0');
    
    // Get paginated data
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      ORDER BY ${orderBy} ${orderDirection} 
      LIMIT $1 OFFSET $2
    `;
    const dataResult = await this.db.executeQuery<T>(options.connectionId || 'primary', dataQuery, [limit, offset]);
    
    return {
      data: dataResult.data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async bulkCreate(data: Partial<T>[], options: RepositoryOptions = {}): Promise<T[]> {
    if (data.length === 0) return [];
    
    const fields = Object.keys(data[0]).filter(key => data[0][key as keyof T] !== undefined);
    const values: any[] = [];
    const placeholders: string[] = [];
    
    data.forEach((item, index) => {
      const itemPlaceholders = fields.map((_, fieldIndex) => 
        `$${index * fields.length + fieldIndex + 1}`
      ).join(', ');
      placeholders.push(`(${itemPlaceholders})`);
      
      fields.forEach(field => {
        values.push(item[field as keyof T]);
      });
    });
    
    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')}) 
      VALUES ${placeholders.join(', ')} 
      RETURNING *
    `;
    
    const result = await this.db.executeQuery<T>(options.connectionId || 'primary', query, values);
    return result.data;
  }

  async bulkUpdate(
    updates: { id: string; data: Partial<T> }[], 
    options: RepositoryOptions = {}
  ): Promise<T[]> {
    if (updates.length === 0) return [];
    
    const results: T[] = [];
    
    for (const update of updates) {
      const result = await this.update(update.id, update.data, options);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  async bulkDelete(ids: string[], options: RepositoryOptions = {}): Promise<number> {
    if (ids.length === 0) return 0;
    
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} IN (${placeholders})`;
    
    const result = await this.db.executeQuery(options.connectionId || 'primary', query, ids);
    return result.count;
  }
}
