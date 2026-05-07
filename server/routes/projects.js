const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

// ─── GET /api/projects ──────────────────────────────────────
// Returns all projects belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    // Attach task stats to each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: "Done",
        });
        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects." });
  }
});

// ─── POST /api/projects ─────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Project title is required." });
    }

    const project = await Project.create({
      title,
      description,
      deadline: deadline || null,
      owner: req.user.id,
    });

    res.status(201).json({ ...project.toObject(), totalTasks: 0, completedTasks: 0 });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Failed to create project." });
  }
});

// ─── GET /api/projects/:id ──────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: "Done",
    });

    res.json({ ...project.toObject(), totalTasks, completedTasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project." });
  }
});

// ─── DELETE /api/projects/:id ───────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Cascade-delete all tasks belonging to this project
    await Task.deleteMany({ project: project._id });

    res.json({ message: "Project and its tasks deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project." });
  }
});

module.exports = router;
