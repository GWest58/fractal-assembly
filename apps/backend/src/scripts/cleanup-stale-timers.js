import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

console.log("🧹 Cleaning up stale timer states");
console.log("=================================");

try {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const now = new Date();
  console.log(
    `⏰ Current time: ${now.toLocaleString()} (UTC: ${now.toISOString()})`,
  );
  console.log("");

  // Find tasks with running or paused timers
  console.log("🔍 Finding tasks with active timer states...");
  const activeTimers = db
    .prepare(
      `
    SELECT id, text, timer_status, timer_started_at, duration_seconds
    FROM tasks
    WHERE timer_status IN ('running', 'paused')
    AND timer_started_at IS NOT NULL
  `,
    )
    .all();

  if (activeTimers.length === 0) {
    console.log("✅ No active timers found - nothing to clean up");
    db.close();
    process.exit(0);
  }

  console.log(`Found ${activeTimers.length} tasks with active timers:`);
  console.log("");

  const staleTimers = [];
  const recentTimers = [];

  activeTimers.forEach((task, index) => {
    const startTime = new Date(task.timer_started_at);
    const elapsed = Math.floor((now - startTime) / 1000);
    const expectedDuration = task.duration_seconds || 0;
    const timeSinceExpiry = elapsed - expectedDuration;

    console.log(`${index + 1}. "${task.text}"`);
    console.log(`   Status: ${task.timer_status}`);
    console.log(
      `   Started: ${new Date(task.timer_started_at).toLocaleString()} (UTC: ${task.timer_started_at})`,
    );
    console.log(`   Duration: ${expectedDuration}s`);
    console.log(`   Elapsed: ${elapsed}s`);

    if (expectedDuration > 0 && elapsed > expectedDuration) {
      console.log(`   ⚠️  Timer expired ${timeSinceExpiry}s ago`);

      // Consider stale if expired more than 1 hour ago
      if (timeSinceExpiry > 3600) {
        console.log(`   🗑️  STALE: Expired over 1 hour ago`);
        staleTimers.push(task);
      } else {
        console.log(`   ⏳ Recent: Expired within last hour`);
        recentTimers.push(task);
      }
    } else if (expectedDuration > 0) {
      const remaining = expectedDuration - elapsed;
      console.log(`   ⏳ Still running: ${remaining}s remaining`);
      recentTimers.push(task);
    } else {
      console.log(`   ❓ No duration set - considering stale`);
      staleTimers.push(task);
    }

    console.log("");
  });

  console.log("📊 Summary:");
  console.log(`   Recent/Active timers: ${recentTimers.length}`);
  console.log(`   Stale timers to clean: ${staleTimers.length}`);
  console.log("");

  if (staleTimers.length === 0) {
    console.log("✅ No stale timers to clean up");
    db.close();
    process.exit(0);
  }

  // Show what will be cleaned
  console.log("🧹 Will clean up these stale timers:");
  staleTimers.forEach((task, index) => {
    console.log(`   ${index + 1}. "${task.text}" - reset to 'not_started'`);
  });
  console.log("");

  // Check for command line argument
  const action = process.argv[2];

  if (action === "clean" || action === "--clean") {
    console.log("🔧 Cleaning up stale timers...");

    const updateStmt = db.prepare(`
      UPDATE tasks
      SET timer_status = 'not_started', timer_started_at = NULL
      WHERE id = ?
    `);

    let cleaned = 0;
    staleTimers.forEach((task) => {
      const result = updateStmt.run(task.id);
      if (result.changes > 0) {
        cleaned++;
        console.log(`   ✅ Cleaned: "${task.text}"`);
      }
    });

    console.log("");
    console.log(`🎉 Successfully cleaned ${cleaned} stale timer(s)`);
  } else {
    console.log("🛠️  To actually clean up the stale timers, run:");
    console.log("   node src/scripts/cleanup-stale-timers.js clean");
    console.log("");
    console.log("⚠️  This will reset stale timers to 'not_started' status");
    console.log("   and clear their start timestamps.");
  }

  db.close();
} catch (error) {
  console.error("❌ Error:", error.message);
  console.error("Make sure the database exists and is accessible.");
  process.exit(1);
}
