/**
 * Enterprise Database Connection Pool
 * Handles concurrent database connections efficiently for 50+ users
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseConnectionPool {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 20;
    this.idleTimeout = options.idleTimeout || 30000; // 30 seconds
    this.connectionTimeout = options.connectionTimeout || 10000; // 10 seconds
    this.dbPath = options.dbPath || path.join(__dirname, '../../../instance/rapid_crm.db');
    
    this.connections = [];
    this.activeConnections = new Set();
    this.waitingQueue = [];
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      waitingRequests: 0,
      totalRequests: 0,
      averageWaitTime: 0
    };
    
    this.initializePool();
  }

  initializePool() {
    console.log(`🏗️ Initializing database connection pool with ${this.maxConnections} max connections`);
    
    // Pre-create some connections
    for (let i = 0; i < Math.min(5, this.maxConnections); i++) {
      this.createConnection();
    }
    
    // Start cleanup timer
    setInterval(() => this.cleanupIdleConnections(), 10000);
  }

  createConnection() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection error:', err);
          reject(err);
          return;
        }
        
        const connection = {
          db,
          id: Date.now() + Math.random(),
          createdAt: Date.now(),
          lastUsed: Date.now(),
          isActive: false
        };
        
        this.connections.push(connection);
        this.stats.totalConnections++;
        
        console.log(`✅ Database connection created. Pool size: ${this.connections.length}`);
        resolve(connection);
      });
    });
  }

  async getConnection() {
    const startTime = Date.now();
    this.stats.totalRequests++;
    
    return new Promise(async (resolve, reject) => {
      // Try to get an available connection
      let connection = this.connections.find(conn => !conn.isActive);
      
      if (!connection && this.connections.length < this.maxConnections) {
        // Create new connection if under limit
        try {
          connection = await this.createConnection();
        } catch (error) {
          reject(error);
          return;
        }
      }
      
      if (connection) {
        // Use existing connection
        connection.isActive = true;
        connection.lastUsed = Date.now();
        this.activeConnections.add(connection.id);
        this.stats.activeConnections = this.activeConnections.size;
        
        const waitTime = Date.now() - startTime;
        this.updateAverageWaitTime(waitTime);
        
        resolve(connection);
      } else {
        // Add to waiting queue
        this.waitingQueue.push({ resolve, reject, startTime });
        this.stats.waitingRequests = this.waitingQueue.length;
        
        // Set timeout for waiting requests
        setTimeout(() => {
          const index = this.waitingQueue.findIndex(req => req.resolve === resolve);
          if (index !== -1) {
            this.waitingQueue.splice(index, 1);
            this.stats.waitingRequests = this.waitingQueue.length;
            reject(new Error('Database connection timeout'));
          }
        }, this.connectionTimeout);
      }
    });
  }

  releaseConnection(connection) {
    if (!connection || !this.activeConnections.has(connection.id)) {
      return;
    }
    
    connection.isActive = false;
    connection.lastUsed = Date.now();
    this.activeConnections.delete(connection.id);
    this.stats.activeConnections = this.activeConnections.size;
    
    // Process waiting queue
    if (this.waitingQueue.length > 0) {
      const waitingRequest = this.waitingQueue.shift();
      this.stats.waitingRequests = this.waitingQueue.length;
      
      connection.isActive = true;
      connection.lastUsed = Date.now();
      this.activeConnections.add(connection.id);
      this.stats.activeConnections = this.activeConnections.size;
      
      waitingRequest.resolve(connection);
    }
  }

  cleanupIdleConnections() {
    const now = Date.now();
    const connectionsToRemove = [];
    
    this.connections.forEach(connection => {
      if (!connection.isActive && 
          (now - connection.lastUsed) > this.idleTimeout &&
          this.connections.length > 2) { // Keep at least 2 connections
        connectionsToRemove.push(connection);
      }
    });
    
    connectionsToRemove.forEach(connection => {
      const index = this.connections.indexOf(connection);
      if (index !== -1) {
        this.connections.splice(index, 1);
        connection.db.close();
        this.stats.totalConnections--;
        console.log(`🧹 Cleaned up idle database connection. Pool size: ${this.connections.length}`);
      }
    });
  }

  updateAverageWaitTime(waitTime) {
    this.stats.averageWaitTime = (this.stats.averageWaitTime + waitTime) / 2;
  }

  getStats() {
    return {
      ...this.stats,
      poolSize: this.connections.length,
      availableConnections: this.connections.filter(conn => !conn.isActive).length
    };
  }

  async executeQuery(sql, params = []) {
    const connection = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      connection.db.all(sql, params, (err, rows) => {
        this.releaseConnection(connection);
        
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async executeQueryOne(sql, params = []) {
    const connection = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      connection.db.get(sql, params, (err, row) => {
        this.releaseConnection(connection);
        
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async executeUpdate(sql, params = []) {
    const connection = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      connection.db.run(sql, params, function(err) {
        this.releaseConnection(connection);
        
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes, lastID: this.lastID });
        }
      });
    });
  }

  close() {
    console.log('🔄 Closing database connection pool...');
    this.connections.forEach(connection => {
      connection.db.close();
    });
    this.connections = [];
    this.activeConnections.clear();
  }
}

// Singleton instance for enterprise use
let connectionPool = null;

function getConnectionPool() {
  if (!connectionPool) {
    connectionPool = new DatabaseConnectionPool({
      maxConnections: 20,
      idleTimeout: 30000,
      connectionTimeout: 10000
    });
  }
  return connectionPool;
}

module.exports = { DatabaseConnectionPool, getConnectionPool };







