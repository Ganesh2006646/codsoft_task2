const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// ─── GET /api/tasks/:projectId ──────────────────────────────
// Returns all tasks for a specific project (only if user owns the project)
router.get("/:projectId", async (req, res) => {
  try {
    // Verify the user owns or is a member of this project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const tasks = await Task.find({ project: req.params.projectId }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
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

    // Verify ownership or membership
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
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

    await Activity.create({
      project: projectId,
      user: req.user.name,
      action: `created task "${task.title}"${assignee ? ` and assigned it to ${assignee}` : ''}`
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

    // Verify ownership or membership through the project
    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!project) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    if (oldStatus !== status) {
      await Activity.create({
        project: task.project,
        user: req.user.name,
        action: `moved task "${task.title}" from ${oldStatus} → ${status}`
      });
    }

    res.json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Task not found." });
    }
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

    // Verify ownership or membership through the project
    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!project) {
      return res.status(403).json({ message: "Not authorized." });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Task not found." });
    }
    res.status(500).json({ message: "Failed to delete task." });
  }
});

// ─── PUT /api/tasks/:id ─────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { title, description, assignee, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!project) {
      return res.status(403).json({ message: "Not authorized." });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.assignee = assignee !== undefined ? assignee : task.assignee;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user.name,
      action: `updated details for task "${task.title}"`
    });

    res.json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Task not found." });
    }
    res.status(500).json({ message: "Failed to update task." });
  }
});

module.exports = router;
