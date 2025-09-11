import { BaseRepository } from './BaseRepository';
import { DatabaseService } from '../DatabaseService';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'user' | 'compliance_officer' | 'sales_rep';
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
  email_verified: boolean;
  email_verification_token?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface UserPermissions {
  canManageIntegrations: boolean;
  canDeleteIntegrations: boolean;
  canAddCategories: boolean;
  canManageUsers: boolean;
  canViewFinancials: boolean;
  canEditInvoices: boolean;
  canManageAgents: boolean;
  canViewAnalytics: boolean;
  canManageCompliance: boolean;
  canAccessDatabase: boolean;
  canManageApiKeys: boolean;
  canViewSystemMonitoring: boolean;
}

export interface UserFilters {
  role?: string;
  department?: string;
  status?: string;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  created_after?: string;
  created_before?: string;
}

export class UserRepository extends BaseRepository<User> {
  constructor(db: DatabaseService) {
    super(db, 'users', 'id');
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.executeQuery<User>('primary', query, [email]);
    return result.data[0] || null;
  }

  async findByRole(role: string): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE role = $1 AND status = $2 ORDER BY name';
    const result = await this.db.executeQuery<User>('primary', query, [role, 'active']);
    return result.data;
  }

  async findByDepartment(department: string): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE department = $1 AND status = $2 ORDER BY name';
    const result = await this.db.executeQuery<User>('primary', query, [department, 'active']);
    return result.data;
  }

  async findActiveUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE status = $1 ORDER BY name';
    const result = await this.db.executeQuery<User>('primary', query, ['active']);
    return result.data;
  }

  async findAdmins(): Promise<User[]> {
    return this.findByRole('admin');
  }

  async findManagers(): Promise<User[]> {
    return this.findByRole('manager');
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    const searchFields = ['name', 'email', 'department'];
    return this.search(searchTerm, searchFields);
  }

  async getUsersWithFilters(filters: UserFilters): Promise<User[]> {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.role) {
      query += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    if (filters.department) {
      query += ` AND department = $${paramIndex}`;
      params.push(filters.department);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.email_verified !== undefined) {
      query += ` AND email_verified = $${paramIndex}`;
      params.push(filters.email_verified);
      paramIndex++;
    }

    if (filters.two_factor_enabled !== undefined) {
      query += ` AND two_factor_enabled = $${paramIndex}`;
      params.push(filters.two_factor_enabled);
      paramIndex++;
    }

    if (filters.created_after) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.created_after);
      paramIndex++;
    }

    if (filters.created_before) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.created_before);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.executeQuery<User>('primary', query, params);
    return result.data;
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    with_2fa: number;
    by_role: { role: string; count: number }[];
    by_department: { department: string; count: number }[];
    recent_logins: number;
  }> {
    // Get total count
    const totalResult = await this.db.executeQuery<{ count: string }>('primary', 'SELECT COUNT(*) as count FROM users');
    const total = parseInt(totalResult.data[0]?.count || '0');

    // Get status counts
    const statusResult = await this.db.executeQuery<{ status: string; count: string }>(
      'primary', 
      'SELECT status, COUNT(*) as count FROM users GROUP BY status'
    );
    
    const statusCounts = statusResult.data.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get 2FA count
    const twoFactorResult = await this.db.executeQuery<{ count: string }>(
      'primary', 
      'SELECT COUNT(*) as count FROM users WHERE two_factor_enabled = true'
    );
    const with_2fa = parseInt(twoFactorResult.data[0]?.count || '0');

    // Get role breakdown
    const roleResult = await this.db.executeQuery<{ role: string; count: string }>(
      'primary', 
      'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC'
    );
    const by_role = roleResult.data.map(row => ({
      role: row.role,
      count: parseInt(row.count)
    }));

    // Get department breakdown
    const departmentResult = await this.db.executeQuery<{ department: string; count: string }>(
      'primary', 
      'SELECT department, COUNT(*) as count FROM users GROUP BY department ORDER BY count DESC'
    );
    const by_department = departmentResult.data.map(row => ({
      department: row.department,
      count: parseInt(row.count)
    }));

    // Get recent logins (last 7 days)
    const recentLoginsResult = await this.db.executeQuery<{ count: string }>(
      'primary', 
      'SELECT COUNT(*) as count FROM users WHERE last_login >= NOW() - INTERVAL \'7 days\''
    );
    const recent_logins = parseInt(recentLoginsResult.data[0]?.count || '0');

    return {
      total,
      active: statusCounts.active || 0,
      inactive: statusCounts.inactive || 0,
      suspended: statusCounts.suspended || 0,
      with_2fa,
      by_role,
      by_department,
      recent_logins
    };
  }

  async updateLastLogin(id: string): Promise<User | null> {
    return this.update(id, { 
      last_login: new Date().toISOString(),
      login_attempts: 0,
      locked_until: null
    });
  }

  async incrementLoginAttempts(id: string): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const newAttempts = user.login_attempts + 1;
    const updates: Partial<User> = { login_attempts: newAttempts };

    // Lock account after 5 failed attempts for 30 minutes
    if (newAttempts >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      updates.locked_until = lockUntil;
    }

    return this.update(id, updates);
  }

  async resetLoginAttempts(id: string): Promise<User | null> {
    return this.update(id, { 
      login_attempts: 0,
      locked_until: null
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User | null> {
    return this.update(id, { 
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null
    });
  }

  async setPasswordResetToken(id: string, token: string, expires: string): Promise<User | null> {
    return this.update(id, { 
      password_reset_token: token,
      password_reset_expires: expires
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()';
    const result = await this.db.executeQuery<User>('primary', query, [token]);
    return result.data[0] || null;
  }

  async setEmailVerificationToken(id: string, token: string): Promise<User | null> {
    return this.update(id, { email_verification_token: token });
  }

  async verifyEmail(id: string): Promise<User | null> {
    return this.update(id, { 
      email_verified: true,
      email_verification_token: null
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email_verification_token = $1';
    const result = await this.db.executeQuery<User>('primary', query, [token]);
    return result.data[0] || null;
  }

  async enableTwoFactor(id: string, secret: string): Promise<User | null> {
    return this.update(id, { 
      two_factor_enabled: true,
      two_factor_secret: secret
    });
  }

  async disableTwoFactor(id: string): Promise<User | null> {
    return this.update(id, { 
      two_factor_enabled: false,
      two_factor_secret: null
    });
  }

  async updateStatus(id: string, status: User['status']): Promise<User | null> {
    return this.update(id, { status });
  }

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC LIMIT $1';
    const result = await this.db.executeQuery<User>('primary', query, [limit]);
    return result.data;
  }

  async getUsersByCreator(createdBy: string): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE created_by = $1 ORDER BY created_at DESC';
    const result = await this.db.executeQuery<User>('primary', query, [createdBy]);
    return result.data;
  }

  async isAccountLocked(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user || !user.locked_until) return false;
    
    return new Date(user.locked_until) > new Date();
  }

  async getLockedUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE locked_until IS NOT NULL AND locked_until > NOW()';
    const result = await this.db.executeQuery<User>('primary', query);
    return result.data;
  }

  async unlockAccount(id: string): Promise<User | null> {
    return this.update(id, { 
      login_attempts: 0,
      locked_until: null
    });
  }
}
