import express from "express";
import Goal from "../models/Goal.js";

const router = express.Router();

// GET /api/goals - Get all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.getAll();

    // Add project count to each goal
    const goalsWithCounts = await Promise.all(
      goals.map(async (goal) => {
        const projectCount = await goal.getProjectCount();
        return {
          ...goal.toJSON(),
          projectCount,
        };
      })
    );

    res.json(goalsWithCounts);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// GET /api/goals/:id - Get a specific goal
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.getById(id);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const projectCount = await goal.getProjectCount();

    res.json({
      ...goal.toJSON(),
      projectCount,
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ error: "Failed to fetch goal" });
  }
});

// GET /api/goals/:id/projects - Get projects for a specific goal
router.get("/:id/projects", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.getById(id);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const projects = await goal.getProjects();

    // Add task count to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await project.getTaskCount();
        return {
          ...project.toJSON(),
          taskCount,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error("Error fetching goal projects:", error);
    res.status(500).json({ error: "Failed to fetch goal projects" });
  }
});

// POST /api/goals - Create a new goal
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Goal name is required" });
    }

    const goalData = {
      name: name.trim(),
      description: description?.trim() || null,
    };

    const goal = await Goal.create(goalData);

    res.status(201).json({
      ...goal.toJSON(),
      projectCount: 0,
    });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PUT /api/goals/:id - Update a goal
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingGoal = await Goal.getById(id);
    if (!existingGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Goal name is required" });
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
    };

    const updatedGoal = await Goal.update(id, updateData);
    const projectCount = await updatedGoal.getProjectCount();

    res.json({
      ...updatedGoal.toJSON(),
      projectCount,
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// DELETE /api/goals/:id - Delete a goal
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingGoal = await Goal.getById(id);
    if (!existingGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const deleted = await Goal.delete(id);

    if (deleted) {
      res.json({ message: "Goal deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  } catch (error) {
    console.error("Error deleting goal:", error);

    if (error.message.includes("Cannot delete goal that has projects")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  }
});

export default router;
