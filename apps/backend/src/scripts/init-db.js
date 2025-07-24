import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/habits.db");

// Create data directory if it doesn't exist
mkdirSync(dirname(dbPath), { recursive: true });

console.log("Initializing database...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Create habits table for foundational habits
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('health', 'wellness', 'productivity', 'personal')),
      is_foundational BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create habit_completions table to track daily completions
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_at DATETIME NOT NULL,
      completion_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habit_id, completion_date)
    )
  `);

  // Create tasks table for regular tasks (non-habits)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert foundational habits if they don't exist
  const foundationalHabits = [
    { id: "foundational-0", text: "Make bed", category: "personal" },
    { id: "foundational-1", text: "Take meds", category: "health" },
    { id: "foundational-2", text: "Meditate 5 minutes", category: "wellness" },
    { id: "foundational-3", text: "Go for a walk", category: "health" },
    { id: "foundational-4", text: "Daily check-in", category: "productivity" },
  ];

  const insertHabit = db.prepare(`
    INSERT OR IGNORE INTO habits (id, text, category, is_foundational)
    VALUES (?, ?, ?, 1)
  `);

  foundationalHabits.forEach((habit) => {
    insertHabit.run(habit.id, habit.text, habit.category);
  });

  // Create indexes for better performance
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions (completion_date)`,
  );
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions (habit_id)`,
  );
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_habits_foundational ON habits (is_foundational)`,
  );

  console.log("Database initialized successfully!");
  console.log(`Database location: ${dbPath}`);
  console.log(`Foundational habits created: ${foundationalHabits.length}`);
} catch (error) {
  console.error("Error initializing database:", error);
  process.exit(1);
} finally {
  db.close();
}
