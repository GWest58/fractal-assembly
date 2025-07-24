import express from "express";
import Habit from "../models/Habit.js";

const router = express.Router();

// GET /api/habits - Get all foundational habits with today's completion status
router.get("/", async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const habits = await Habit.getHabitsWithTodayStatus(date);
    res.json({
      success: true,
      data: habits,
      date: date.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch habits",
      message: error.message,
    });
  }
});

// GET /api/habits/:id - Get a specific habit
router.get("/:id", async (req, res) => {
  try {
    const habit = await Habit.getById(req.params.id);
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }
    res.json({
      success: true,
      data: habit,
    });
  } catch (error) {
    console.error("Error fetching habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch habit",
      message: error.message,
    });
  }
});

// POST /api/habits - Create a new habit
router.post("/", async (req, res) => {
  try {
    const { text, category, isFoundational } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Habit text is required",
      });
    }

    const validCategories = ["health", "wellness", "productivity", "personal"];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid category. Must be one of: " + validCategories.join(", "),
      });
    }

    const habitData = {
      text: text.trim(),
      category: category || "personal",
      isFoundational: isFoundational !== undefined ? isFoundational : true,
    };

    const habit = await Habit.create(habitData);
    res.status(201).json({
      success: true,
      data: habit,
      message: "Habit created successfully",
    });
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create habit",
      message: error.message,
    });
  }
});

// PUT /api/habits/:id - Update a habit
router.put("/:id", async (req, res) => {
  try {
    const { text, category } = req.body;
    const habitId = req.params.id;

    // Check if habit exists
    const existingHabit = await Habit.getById(habitId);
    if (!existingHabit) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Habit text is required",
      });
    }

    const validCategories = ["health", "wellness", "productivity", "personal"];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid category. Must be one of: " + validCategories.join(", "),
      });
    }

    const updateData = {
      text: text.trim(),
      category: category || existingHabit.category,
    };

    const updatedHabit = await Habit.update(habitId, updateData);
    res.json({
      success: true,
      data: updatedHabit,
      message: "Habit updated successfully",
    });
  } catch (error) {
    console.error("Error updating habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update habit",
      message: error.message,
    });
  }
});

// DELETE /api/habits/:id - Delete a habit (only non-foundational habits)
router.delete("/:id", async (req, res) => {
  try {
    const habitId = req.params.id;
    const habit = await Habit.getById(habitId);

    if (!habit) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    // Prevent deletion of foundational habits
    if (habit.isFoundational) {
      return res.status(403).json({
        success: false,
        error: "Cannot delete foundational habits",
      });
    }

    const deleted = await Habit.delete(habitId);
    if (deleted) {
      res.json({
        success: true,
        message: "Habit deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to delete habit",
      });
    }
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete habit",
      message: error.message,
    });
  }
});

// POST /api/habits/:id/complete - Mark habit as completed for today
router.post("/:id/complete", async (req, res) => {
  try {
    const habitId = req.params.id;
    const { completedAt } = req.body;

    // Check if habit exists
    const habit = await Habit.getById(habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    const completionTime = completedAt ? new Date(completedAt) : new Date();
    const completion = await Habit.markComplete(habitId, completionTime);

    res.json({
      success: true,
      data: completion,
      message: "Habit marked as completed",
    });
  } catch (error) {
    console.error("Error marking habit complete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark habit as completed",
      message: error.message,
    });
  }
});

// DELETE /api/habits/:id/complete - Mark habit as incomplete for today
router.delete("/:id/complete", async (req, res) => {
  try {
    const habitId = req.params.id;
    const { date } = req.query;

    // Check if habit exists
    const habit = await Habit.getById(habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    const targetDate = date ? new Date(date) : new Date();
    const removed = await Habit.markIncomplete(habitId, targetDate);

    if (removed) {
      res.json({
        success: true,
        message: "Habit marked as incomplete",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "No completion found for this date",
      });
    }
  } catch (error) {
    console.error("Error marking habit incomplete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark habit as incomplete",
      message: error.message,
    });
  }
});

// GET /api/habits/:id/stats - Get completion statistics for a habit
router.get("/:id/stats", async (req, res) => {
  try {
    const habitId = req.params.id;
    const days = parseInt(req.query.days) || 30;

    // Check if habit exists
    const habit = await Habit.getById(habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        error: "Habit not found",
      });
    }

    const stats = await Habit.getCompletionStats(habitId, days);
    res.json({
      success: true,
      data: {
        habit: habit.toJSON(),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching habit stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch habit statistics",
      message: error.message,
    });
  }
});

// GET /api/habits/completions/today - Get all completions for today
router.get("/completions/today", async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const completions = await Habit.getCompletionsForDate(date);

    res.json({
      success: true,
      data: completions,
      date: date.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching today's completions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch completions",
      message: error.message,
    });
  }
});

// GET /api/habits/completions/range - Get completions for a date range
router.get("/completions/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Both startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const completions = await Habit.getCompletionsForDateRange(start, end);

    res.json({
      success: true,
      data: completions,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching completions range:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch completions",
      message: error.message,
    });
  }
});

// POST /api/habits/reset-day - Reset all foundational habits for the day
router.post("/reset-day", async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const completionDate = targetDate.toISOString().split("T")[0];

    // Get all foundational habits
    const habits = await Habit.getAll();

    // Remove all completions for the target date
    const promises = habits.map((habit) =>
      Habit.markIncomplete(habit.id, targetDate),
    );
    await Promise.all(promises);

    res.json({
      success: true,
      data: {
        resetCount: habits.length,
        date: completionDate,
      },
      message: `All foundational habits reset for ${completionDate}`,
    });
  } catch (error) {
    console.error("Error resetting day:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset day",
      message: error.message,
    });
  }
});

export default router;
