import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

console.log("🔍 Debug Task Completions");
console.log("========================");

try {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const today = new Date().toISOString().split("T")[0];
  console.log(`📅 Today's date: ${today}`);
  console.log("");

  // Get all tasks
  console.log("📋 All Tasks:");
  console.log("-".repeat(50));
  const tasks = db
    .prepare(
      `
    SELECT
      t.*,
      CASE WHEN tc.id IS NOT NULL THEN 1 ELSE 0 END as completed_today,
      tc.completed_at,
      DATE(tc.completed_at) as completion_date
    FROM tasks t
    LEFT JOIN task_completions tc ON t.id = tc.task_id AND DATE(tc.completed_at) = ?
    ORDER BY t.created_at ASC
  `,
    )
    .all(today);

  tasks.forEach((task, index) => {
    console.log(`${index + 1}. "${task.text}"`);
    console.log(`   ID: ${task.id}`);
    console.log(`   Frequency: ${task.frequency_type || "one-time"}`);
    console.log(`   Completed Today: ${task.completed_today ? "YES" : "NO"}`);
    console.log(`   Completed Field: ${task.completed ? "YES" : "NO"}`);

    if (task.completed_today) {
      console.log(`   ⚠️  Completion Date: ${task.completion_date}`);
      console.log(
        `   ⚠️  Completed At: ${new Date(task.completed_at).toLocaleString()}`,
      );
      console.log(`   ⚠️  Completed At (UTC): ${task.completed_at}`);
    }
    console.log("");
  });

  // Check all completions for today
  console.log(`🗓️  All Completions for ${today}:`);
  console.log("-".repeat(50));
  const todayCompletions = db
    .prepare(
      `
    SELECT tc.*, t.text as task_text, DATE(tc.completed_at) as completion_date
    FROM task_completions tc
    JOIN tasks t ON tc.task_id = t.id
    WHERE DATE(tc.completed_at) = ?
    ORDER BY tc.completed_at
  `,
    )
    .all(today);

  if (todayCompletions.length === 0) {
    console.log("   No completions found for today");
  } else {
    todayCompletions.forEach((completion, index) => {
      console.log(`${index + 1}. "${completion.task_text}"`);
      console.log(`   Task ID: ${completion.task_id}`);
      console.log(
        `   Completed At: ${new Date(completion.completed_at).toLocaleString()}`,
      );
      console.log(`   Completed At (UTC): ${completion.completed_at}`);
      console.log(`   Completion Date: ${completion.completion_date}`);
      console.log("");
    });
  }

  // Check recent completions (last 7 days)
  console.log("📊 Recent Completions (Last 7 Days):");
  console.log("-".repeat(50));
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const recentCompletions = db
    .prepare(
      `
    SELECT tc.*, t.text as task_text, DATE(tc.completed_at) as completion_date
    FROM task_completions tc
    JOIN tasks t ON tc.task_id = t.id
    WHERE DATE(tc.completed_at) BETWEEN ? AND ?
    ORDER BY tc.completed_at DESC
  `,
    )
    .all(sevenDaysAgoStr, today);

  if (recentCompletions.length === 0) {
    console.log("   No recent completions found");
  } else {
    const groupedByDate = {};
    recentCompletions.forEach((completion) => {
      if (!groupedByDate[completion.completion_date]) {
        groupedByDate[completion.completion_date] = [];
      }
      groupedByDate[completion.completion_date].push(completion);
    });

    Object.keys(groupedByDate).forEach((date) => {
      console.log(`   ${date}:`);
      groupedByDate[date].forEach((completion) => {
        const localTime = new Date(
          completion.completed_at,
        ).toLocaleTimeString();
        const utcTime =
          completion.completed_at.split("T")[1]?.split(".")[0] ||
          "unknown time";
        console.log(
          `     - "${completion.task_text}" at ${localTime} (UTC: ${utcTime})`,
        );
      });
      console.log("");
    });
  }

  console.log("🛠️  Available Actions:");
  console.log("-".repeat(50));
  console.log("To fix tasks appearing as completed when they shouldn't be:");
  console.log("");
  console.log("1. Clear ALL completions for today:");
  console.log("   node src/scripts/debug-completions.js clear-today");
  console.log("");
  console.log("2. Clear ALL completions for a specific date:");
  console.log("   node src/scripts/debug-completions.js clear-date YYYY-MM-DD");
  console.log("");
  console.log("3. Clear ALL completion history:");
  console.log("   node src/scripts/debug-completions.js clear-all");
  console.log("");

  // Handle command line arguments
  const action = process.argv[2];
  const param = process.argv[3];

  if (action === "clear-today") {
    console.log(`🧹 Clearing all completions for today (${today})...`);
    const result = db
      .prepare("DELETE FROM task_completions WHERE DATE(completed_at) = ?")
      .run(today);
    console.log(`✅ Deleted ${result.changes} completion records for today`);
  } else if (action === "clear-date" && param) {
    console.log(`🧹 Clearing all completions for ${param}...`);
    const result = db
      .prepare("DELETE FROM task_completions WHERE DATE(completed_at) = ?")
      .run(param);
    console.log(`✅ Deleted ${result.changes} completion records for ${param}`);
  } else if (action === "clear-all") {
    console.log("🧹 Clearing ALL completion history...");
    console.log("⚠️  This will remove all completion records!");
    console.log("Are you sure? This action cannot be undone.");
    console.log("If yes, add 'confirm' as the next parameter:");
    console.log("   node src/scripts/debug-completions.js clear-all confirm");

    if (process.argv[4] === "confirm") {
      const result = db.prepare("DELETE FROM task_completions").run();
      console.log(
        `✅ Deleted ${result.changes} completion records (ALL history cleared)`,
      );
    }
  }

  db.close();
} catch (error) {
  console.error("❌ Error:", error.message);
  console.error("Make sure the database exists and is accessible.");
}
