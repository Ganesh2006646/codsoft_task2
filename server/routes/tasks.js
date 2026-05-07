const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// ─── GET /api/tasks/:projectId ──────────────────────────────
// Returns all tasks for a specific project (only if user owns the project)
router.get("/:projectId", async (req, res) => {
  try {
    // Verify the user owns this project
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const tasks = await Task.find({ project: req.params.projectId }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

// ─── POST /api/tasks ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, description, assignee, dueDate, project: projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Task title and project are required." });
    }

    // Verify ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const task = await Task.create({
      title,
      description,
      assignee,
      dueDate: dueDate || null,
      project: projectId,
    });

    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Failed to create task." });
  }
});

// ─── PATCH /api/tasks/:id/status ────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Todo", "In Progress", "Done"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Verify ownership through the project
    const project = await Project.findOne({
      _id: task.project,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(403).json({ message: "Not authorized." });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task status." });
  }
});

// ─── DELETE /api/tasks/:id ──────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Verify ownership through the project
    const project = await Project.findOne({
      _id: task.project,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(403).json({ message: "Not authorized." });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task." });
  }
});

module.exports = router;
