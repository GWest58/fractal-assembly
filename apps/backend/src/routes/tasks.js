import express from "express";
import Task from "../models/Task.js";
import { TimezoneUtils } from "../utils/timezone.js";

const router = express.Router();

// GET /api/tasks - Get all tasks with today's completion status
router.get("/", async (req, res) => {
  try {
    // Parse client date range parameters
    const { date, timezoneOffset } = req.query;
    const { startOfDay, endOfDay } = TimezoneUtils.parseClientDateRange({
      date,
      timezoneOffset: timezoneOffset ? parseInt(timezoneOffset) : undefined,
    });

    const tasks = await Task.getTasksWithTodayStatus(startOfDay, endOfDay);
    res.json({
      success: true,
      data: tasks,
      date: date || TimezoneUtils.getCurrentLocalDate(),
      range: { startOfDay, endOfDay },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
      message: error.message,
    });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.getById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task",
      message: error.message,
    });
  }
});

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const { text, frequency, durationSeconds, projectId } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Task text is required",
      });
    }

    const taskData = {
      text: text.trim(),
      frequency: frequency, // Don't default to daily for one-time tasks
      durationSeconds: durationSeconds,
      projectId: projectId,
    };

    const task = await Task.create(taskData);
    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create task",
      message: error.message,
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req, res) => {
  try {
    const { text, frequency, completed, durationSeconds } = req.body;
    const taskId = req.params.id;

    // Check if task exists
    const existingTask = await Task.getById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Build update data object
    const updateData = {};

    // Only update text if provided and valid
    if (text !== undefined) {
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: "Task text cannot be empty",
        });
      }
      updateData.text = text.trim();
    } else {
      // Only set text if we're updating other fields that require it
      if (frequency !== undefined || completed === undefined) {
        updateData.text = existingTask.text;
      }
    }

    // Handle frequency updates
    if (frequency !== undefined) {
      updateData.frequency = frequency;
    } else {
      updateData.frequency = existingTask.frequency;
    }

    // Handle completed field for one-time tasks
    if (completed !== undefined) {
      updateData.completed = completed;

      // Reset timer status when task is manually marked as completed
      if (
        completed === true &&
        existingTask.timerStatus &&
        existingTask.timerStatus !== "not_started"
      ) {
        updateData.timerStatus = "not_started";
        updateData.timerStartedAt = null;
      }
    }

    // Handle duration updates
    if (durationSeconds !== undefined) {
      updateData.durationSeconds = durationSeconds;
    }

    const updatedTask = await Task.update(taskId, updateData);
    res.json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update task",
      message: error.message,
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.getById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const deleted = await Task.delete(taskId);
    if (deleted) {
      res.json({
        success: true,
        message: "Task deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to delete task",
      });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
      message: error.message,
    });
  }
});

// POST /api/tasks/:id/complete - Mark task as completed for today
router.post("/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { completedAt } = req.body;

    // Check if task exists
    const task = await Task.getById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const completionTime = completedAt ? new Date(completedAt) : new Date();
    const completion = await Task.markComplete(taskId, completionTime);

    // Reset timer status when task is manually completed
    if (task.timerStatus && task.timerStatus !== "not_started") {
      await Task.update(taskId, {
        text: task.text,
        timerStatus: "not_started",
        timerStartedAt: null,
      });
    }

    res.json({
      success: true,
      data: completion,
      message: "Task marked as completed",
    });
  } catch (error) {
    console.error("Error marking task complete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark task as completed",
      message: error.message,
    });
  }
});

// DELETE /api/tasks/:id/complete - Mark task as incomplete for today
router.delete("/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { date, timezoneOffset } = req.query;

    // Check if task exists
    const task = await Task.getById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Parse client date range
    const { startOfDay, endOfDay } = TimezoneUtils.parseClientDateRange({
      date,
      timezoneOffset: timezoneOffset ? parseInt(timezoneOffset) : undefined,
    });

    const removed = await Task.markIncomplete(taskId, startOfDay, endOfDay);

    // Reset timer status when task is marked incomplete
    if (removed && task.timerStatus && task.timerStatus !== "not_started") {
      await Task.update(taskId, {
        text: task.text,
        timerStatus: "not_started",
        timerStartedAt: null,
      });
    }

    if (removed) {
      res.json({
        success: true,
        message: "Task marked as incomplete",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "No completion found for this date range",
      });
    }
  } catch (error) {
    console.error("Error marking task incomplete:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark task as incomplete",
      message: error.message,
    });
  }
});

// GET /api/tasks/:id/stats - Get completion statistics for a task
router.get("/:id/stats", async (req, res) => {
  try {
    const taskId = req.params.id;
    const days = parseInt(req.query.days) || 30;

    // Check if task exists
    const task = await Task.getById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    const stats = await Task.getCompletionStats(taskId, days);
    res.json({
      success: true,
      data: {
        task: task.toJSON(),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task statistics",
      message: error.message,
    });
  }
});

// GET /api/tasks/completions/today - Get all completions for today
// GET /api/tasks/completions/today - Get today's completions
router.get("/completions/today", async (req, res) => {
  try {
    const { date, timezoneOffset } = req.query;
    const { startOfDay, endOfDay } = TimezoneUtils.parseClientDateRange({
      date,
      timezoneOffset: timezoneOffset ? parseInt(timezoneOffset) : undefined,
    });

    const completions = await Task.getCompletionsForDate(startOfDay, endOfDay);

    res.json({
      success: true,
      data: completions,
      date: date || TimezoneUtils.getCurrentLocalDate(),
      range: { startOfDay, endOfDay },
    });
  } catch (error) {
    console.error("Error fetching completions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch completions",
      message: error.message,
    });
  }
});

// GET /api/tasks/completions/range - Get completions for a date range
router.get("/completions/range", async (req, res) => {
  try {
    const { startDate, endDate, timezoneOffset } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Both startDate and endDate are required",
      });
    }

    // Parse start of period (beginning of start date)
    const startRange = TimezoneUtils.parseClientDateRange({
      date: startDate,
      timezoneOffset: timezoneOffset ? parseInt(timezoneOffset) : undefined,
    });

    // Parse end of period (end of end date)
    const endRange = TimezoneUtils.parseClientDateRange({
      date: endDate,
      timezoneOffset: timezoneOffset ? parseInt(timezoneOffset) : undefined,
    });

    const completions = await Task.getCompletionsForDateRange(
      startRange.startOfDay,
      endRange.endOfDay,
    );

    res.json({
      success: true,
      data: completions,
      startDate,
      endDate,
      range: {
        startOfPeriod: startRange.startOfDay,
        endOfPeriod: endRange.endOfDay,
      },
    });
  } catch (error) {
    console.error("Error fetching completion range:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch completion range",
      message: error.message,
    });
  }
});

// POST /api/tasks/reset-day - Reset all recurring tasks for the day
router.post("/reset-day", async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const completionDate = targetDate.toISOString().split("T")[0];

    // Get all tasks
    const tasks = await Task.getAll();

    // Remove all completions for the target date
    const promises = tasks.map((task) =>
      Task.markIncomplete(task.id, targetDate),
    );
    await Promise.all(promises);

    res.json({
      success: true,
      data: {
        resetCount: tasks.length,
        date: completionDate,
      },
      message: `All recurring tasks reset for ${completionDate}`,
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

// POST /api/tasks/:id/timer/start - Start timer for a task
router.post("/:id/timer/start", async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.startTimer(taskId);
    res.json({
      success: true,
      data: task,
      message: "Timer started successfully",
    });
  } catch (error) {
    console.error("Error starting timer:", error);
    res.status(400).json({
      success: false,
      error: "Failed to start timer",
      message: error.message,
    });
  }
});

// POST /api/tasks/:id/timer/pause - Pause timer for a task
router.post("/:id/timer/pause", async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.pauseTimer(taskId);
    res.json({
      success: true,
      data: task,
      message: "Timer paused successfully",
    });
  } catch (error) {
    console.error("Error pausing timer:", error);
    res.status(400).json({
      success: false,
      error: "Failed to pause timer",
      message: error.message,
    });
  }
});

// POST /api/tasks/:id/timer/stop - Stop timer for a task
router.post("/:id/timer/stop", async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.stopTimer(taskId);
    res.json({
      success: true,
      data: task,
      message: "Timer stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping timer:", error);
    res.status(400).json({
      success: false,
      error: "Failed to stop timer",
      message: error.message,
    });
  }
});

// GET /api/tasks/:id/timer/status - Get timer status for a task
router.get("/:id/timer/status", async (req, res) => {
  try {
    const taskId = req.params.id;

    const timerStatus = await Task.getTimerStatus(taskId);
    res.json({
      success: true,
      data: timerStatus,
    });
  } catch (error) {
    console.error("Error fetching timer status:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch timer status",
      message: error.message,
    });
  }
});

export default router;
