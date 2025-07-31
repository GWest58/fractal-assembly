import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

class DatabaseConnection {
  constructor() {
    this.db = null;
  }

  connect() {
    try {
      this.db = new Database(dbPath);
      // Enable foreign keys
      this.db.pragma("foreign_keys = ON");
      // Enable WAL mode for better performance
      this.db.pragma("journal_mode = WAL");
      console.log("Connected to the SQLite database.");
      return Promise.resolve();
    } catch (error) {
      console.error("Error opening database:", error.message);
      return Promise.reject(error);
    }
  }

  close() {
    try {
      if (this.db) {
        this.db.close();
        console.log("Database connection closed.");
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error closing database:", error.message);
      return Promise.reject(error);
    }
  }

  // Synchronous methods (better-sqlite3 is synchronous by nature)
  run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);
      return Promise.resolve({
        id: result.lastInsertRowid,
        changes: result.changes,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(params);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.all(params);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Transaction support
  beginTransaction() {
    try {
      this.db.exec("BEGIN TRANSACTION");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  commit() {
    try {
      this.db.exec("COMMIT");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  rollback() {
    try {
      this.db.exec("ROLLBACK");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Helper method for safe transactions
  async transaction(callback) {
    try {
      await this.beginTransaction();
      const result = await callback();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  // Prepared statement helper
  prepare(sql) {
    try {
      return this.db.prepare(sql);
    } catch (error) {
      throw error;
    }
  }

  // Execute raw SQL
  exec(sql) {
    try {
      this.db.exec(sql);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

// Create singleton instance
const database = new DatabaseConnection();

export default database;
