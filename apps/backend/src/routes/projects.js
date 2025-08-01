import express from "express";
import Project from "../models/Project.js";
import Goal from "../models/Goal.js";

const router = express.Router();

// GET /api/projects - Get all projects
router.get("/", async (req, res) => {
  try {
    const { goal_id } = req.query;

    let projects;
    if (goal_id) {
      projects = await Project.getByGoalId(goal_id);
    } else {
      projects = await Project.getAll();
    }

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
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id - Get a specific project
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.getById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const taskCount = await project.getTaskCount();

    res.json({
      ...project.toJSON(),
      taskCount,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// GET /api/projects/:id/tasks - Get tasks for a specific project
router.get("/:id/tasks", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.getById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const tasks = await project.getTasks();

    res.json(tasks.map(task => task.toJSON()));
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    res.status(500).json({ error: "Failed to fetch project tasks" });
  }
});

// POST /api/projects - Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description, goalId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Project name is required" });
    }

    // Validate goal exists if goalId is provided
    if (goalId) {
      const goal = await Goal.getById(goalId);
      if (!goal) {
        return res.status(400).json({ error: "Goal not found" });
      }
    }

    const projectData = {
      name: name.trim(),
      description: description?.trim() || null,
      goalId: goalId || null,
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      ...project.toJSON(),
      taskCount: 0,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id - Update a project
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, goalId } = req.body;

    const existingProject = await Project.getById(id);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Project name is required" });
    }

    // Validate goal exists if goalId is provided
    if (goalId) {
      const goal = await Goal.getById(goalId);
      if (!goal) {
        return res.status(400).json({ error: "Goal not found" });
      }
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      goalId: goalId || null,
    };

    const updatedProject = await Project.update(id, updateData);
    const taskCount = await updatedProject.getTaskCount();

    res.json({
      ...updatedProject.toJSON(),
      taskCount,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await Project.getById(id);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const deleted = await Project.delete(id);

    if (deleted) {
      res.json({ message: "Project deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete project" });
    }
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error.message.includes("Cannot delete project that has tasks")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete project" });
    }
  }
});

export default router;
