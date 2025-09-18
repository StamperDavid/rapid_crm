// @ts-nocheck
// Using direct database connection - no separate repository

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  company_id?: string;
  contact_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  companyName?: string; // Joined from companies table
  contactName?: string; // Joined from contacts table
  assignedToName?: string; // User name
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  companyId?: string;
  contactId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
  limit?: number;
  offset?: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  byAssignee: Record<string, number>;
}

export class TaskService extends BaseRepository {
  constructor() {
    super('tasks');
  }

  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      let query = `
        SELECT t.*, 
               co.legal_business_name as companyName,
               c.first_name || ' ' || c.last_name as contactName
        FROM tasks t
        LEFT JOIN companies co ON t.company_id = co.id
        LEFT JOIN contacts c ON t.contact_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters.search) {
        query += ` AND (
          t.title LIKE ? OR 
          t.description LIKE ? OR 
          co.legal_business_name LIKE ? OR
          c.first_name LIKE ? OR
          c.last_name LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.status) {
        query += ` AND t.status = ?`;
        params.push(filters.status);
      }

      if (filters.priority) {
        query += ` AND t.priority = ?`;
        params.push(filters.priority);
      }

      if (filters.assignedTo) {
        query += ` AND t.assigned_to = ?`;
        params.push(filters.assignedTo);
      }

      if (filters.companyId) {
        query += ` AND t.company_id = ?`;
        params.push(filters.companyId);
      }

      if (filters.contactId) {
        query += ` AND t.contact_id = ?`;
        params.push(filters.contactId);
      }

      if (filters.dueDateFrom) {
        query += ` AND t.due_date >= ?`;
        params.push(filters.dueDateFrom);
      }

      if (filters.dueDateTo) {
        query += ` AND t.due_date <= ?`;
        params.push(filters.dueDateTo);
      }

      if (filters.overdue) {
        query += ` AND t.due_date < date('now') AND t.status NOT IN ('completed', 'cancelled')`;
      }

      query += ` ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.due_date ASC,
        t.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(filters.limit);
        if (filters.offset) {
          query += ` OFFSET ?`;
          params.push(filters.offset);
        }
      }

      const result = await this.query(query, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const query = `
        SELECT t.*, 
               co.legal_business_name as companyName,
               c.first_name || ' ' || c.last_name as contactName
        FROM tasks t
        LEFT JOIN companies co ON t.company_id = co.id
        LEFT JOIN contacts c ON t.contact_id = c.id
        WHERE t.id = ?
      `;
      const result = await this.query(query, [id]);
      return result.rows?.[0] || null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw new Error('Failed to fetch task');
    }
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const fields = [
        'id', 'title', 'description', 'status', 'priority', 'due_date',
        'company_id', 'contact_id', 'assigned_to', 'created_at', 'updated_at'
      ];

      const values = [
        id,
        task.title || '',
        task.description || null,
        task.status || 'pending',
        task.priority || 'medium',
        task.due_date || null,
        task.company_id || null,
        task.contact_id || null,
        task.assigned_to || null,
        now,
        now
      ];

      const placeholders = fields.map(() => '?').join(', ');

      const query = `
        INSERT INTO tasks (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      await this.query(query, values);
      const newTask = await this.getTask(id);
      
      if (!newTask) {
        throw new Error('Failed to retrieve created task');
      }

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const fields = Object.keys(updates).filter(key => 
        key !== 'id' && key !== 'companyName' && key !== 'contactName' && key !== 'assignedToName'
      );
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof Task]);

      const query = `
        UPDATE tasks 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.query(query, [...values, id]);
      const updatedTask = await this.getTask(id);
      
      if (!updatedTask) {
        throw new Error('Failed to retrieve updated task');
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM tasks WHERE id = ?';
      const result = await this.query(query, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  async getTaskStats(): Promise<TaskStats> {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM tasks';
      const pendingQuery = 'SELECT COUNT(*) as pending FROM tasks WHERE status = "pending"';
      const inProgressQuery = 'SELECT COUNT(*) as in_progress FROM tasks WHERE status = "in_progress"';
      const completedQuery = 'SELECT COUNT(*) as completed FROM tasks WHERE status = "completed"';
      const overdueQuery = 'SELECT COUNT(*) as overdue FROM tasks WHERE due_date < date("now") AND status NOT IN ("completed", "cancelled")';
      const priorityQuery = 'SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority';
      const statusQuery = 'SELECT status, COUNT(*) as count FROM tasks GROUP BY status';
      const assigneeQuery = 'SELECT assigned_to, COUNT(*) as count FROM tasks WHERE assigned_to IS NOT NULL GROUP BY assigned_to';

      const [totalResult, pendingResult, inProgressResult, completedResult, overdueResult, priorityResult, statusResult, assigneeResult] = await Promise.all([
        this.query(totalQuery),
        this.query(pendingQuery),
        this.query(inProgressQuery),
        this.query(completedQuery),
        this.query(overdueQuery),
        this.query(priorityQuery),
        this.query(statusQuery),
        this.query(assigneeQuery)
      ]);

      const byPriority: Record<string, number> = {};
      priorityResult.rows?.forEach((row: any) => {
        byPriority[row.priority] = row.count;
      });

      const byStatus: Record<string, number> = {};
      statusResult.rows?.forEach((row: any) => {
        byStatus[row.status] = row.count;
      });

      const byAssignee: Record<string, number> = {};
      assigneeResult.rows?.forEach((row: any) => {
        byAssignee[row.assigned_to] = row.count;
      });

      return {
        total: totalResult.rows?.[0]?.total || 0,
        pending: pendingResult.rows?.[0]?.pending || 0,
        inProgress: inProgressResult.rows?.[0]?.in_progress || 0,
        completed: completedResult.rows?.[0]?.completed || 0,
        overdue: overdueResult.rows?.[0]?.overdue || 0,
        byPriority,
        byStatus,
        byAssignee
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw new Error('Failed to fetch task statistics');
    }
  }

  async getOverdueTasks(): Promise<Task[]> {
    try {
      const query = `
        SELECT t.*, 
               co.legal_business_name as companyName,
               c.first_name || ' ' || c.last_name as contactName
        FROM tasks t
        LEFT JOIN companies co ON t.company_id = co.id
        LEFT JOIN contacts c ON t.contact_id = c.id
        WHERE t.due_date < date('now') 
        AND t.status NOT IN ('completed', 'cancelled')
        ORDER BY t.due_date ASC
      `;
      
      const result = await this.query(query);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      throw new Error('Failed to fetch overdue tasks');
    }
  }

  async getTasksDueSoon(days: number = 7): Promise<Task[]> {
    try {
      const query = `
        SELECT t.*, 
               co.legal_business_name as companyName,
               c.first_name || ' ' || c.last_name as contactName
        FROM tasks t
        LEFT JOIN companies co ON t.company_id = co.id
        LEFT JOIN contacts c ON t.contact_id = c.id
        WHERE t.due_date <= date('now', '+${days} days') 
        AND t.due_date >= date('now')
        AND t.status NOT IN ('completed', 'cancelled')
        ORDER BY t.due_date ASC
      `;
      
      const result = await this.query(query);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching tasks due soon:', error);
      throw new Error('Failed to fetch tasks due soon');
    }
  }

  async updateTaskStatus(id: string, status: string): Promise<Task> {
    try {
      return await this.updateTask(id, { status });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  async assignTask(id: string, assignedTo: string): Promise<Task> {
    try {
      return await this.updateTask(id, { assigned_to: assignedTo });
    } catch (error) {
      console.error('Error assigning task:', error);
      throw new Error('Failed to assign task');
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const taskService = new TaskService();
