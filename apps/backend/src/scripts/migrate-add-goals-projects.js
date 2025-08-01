import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

console.log("Running migration: Add goals and projects tables...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Create goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      goal_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE SET NULL
    )
  `);

  // Add project_id column to tasks table if it doesn't exist
  try {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL
    `);
    console.log("Added project_id column to tasks table");
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log("project_id column already exists in tasks table");
    } else {
      throw error;
    }
  }

  // Add duration_seconds column to tasks table if it doesn't exist
  try {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN duration_seconds INTEGER
    `);
    console.log("Added duration_seconds column to tasks table");
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log("duration_seconds column already exists in tasks table");
    } else {
      throw error;
    }
  }

  // Add timer columns to tasks table if they don't exist
  try {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN timer_started_at TEXT
    `);
    console.log("Added timer_started_at column to tasks table");
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log("timer_started_at column already exists in tasks table");
    } else {
      throw error;
    }
  }

  try {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN timer_status TEXT DEFAULT 'not_started'
    `);
    console.log("Added timer_status column to tasks table");
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log("timer_status column already exists in tasks table");
    } else {
      throw error;
    }
  }

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_goal_id ON projects (goal_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id)
  `);

  // Insert sample goal and project if they don't exist
  const sampleGoalId = "sample-goal-1";
  const sampleProjectId = "sample-project-1";

  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO goals (id, name, description)
    VALUES (?, ?, ?)
  `);

  const insertProject = db.prepare(`
    INSERT OR IGNORE INTO projects (id, name, description, goal_id)
    VALUES (?, ?, ?, ?)
  `);

  insertGoal.run(
    sampleGoalId,
    "Personal Development",
    "Improve daily habits and overall well-being"
  );

  insertProject.run(
    sampleProjectId,
    "Daily Routines",
    "Establish consistent daily habits",
    sampleGoalId
  );

  console.log("Migration completed successfully!");
  console.log("- Created goals table");
  console.log("- Created projects table");
  console.log("- Added project_id column to tasks table");
  console.log("- Added timer columns to tasks table");
  console.log("- Created sample goal and project");
} catch (error) {
  console.error("Error running migration:", error);
  process.exit(1);
} finally {
  db.close();
}
