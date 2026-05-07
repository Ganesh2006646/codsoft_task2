const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

// ─── GET /api/projects ──────────────────────────────────────
// Returns all projects where user is owner or member
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("requests", "name email")
      .sort({
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

// ─── GET /api/projects/community ─────────────────────────────
// Returns all projects where user is NOT owner and NOT member
router.get("/community", async (req, res) => {
  try {
    const projects = await Project.find({
      owner: { $ne: req.user.id },
      members: { $ne: req.user.id }
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        return {
          ...project.toObject(),
          totalTasks,
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch community projects." });
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
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("requests", "name email");

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
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
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
      return res.status(404).json({ message: "Project not found or you are not the owner." });
    }

    // Cascade-delete all tasks belonging to this project
    await Task.deleteMany({ project: project._id });

    res.json({ message: "Project and its tasks deleted successfully." });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(500).json({ message: "Failed to delete project." });
  }
});

// ─── POST /api/projects/:id/invite ──────────────────────────
router.post("/:id/invite", async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or you are not the owner." });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: "User with this email not found." });
    }

    if (project.owner.toString() === userToInvite._id.toString() || project.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: "User is already in the project." });
    }

    project.members.push(userToInvite._id);
    await project.save();

    res.json({
      message: "User invited successfully.",
      user: { _id: userToInvite._id, name: userToInvite.name, email: userToInvite.email }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(500).json({ message: "Failed to invite user." });
  }
});

// ─── POST /api/projects/:id/request ─────────────────────────
router.post("/:id/request", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    
    if (project.owner.toString() === req.user.id || project.members.includes(req.user.id)) {
      return res.status(400).json({ message: "You are already a member or owner of this project." });
    }

    if (project.requests.includes(req.user.id)) {
      return res.status(400).json({ message: "Request already sent." });
    }

    project.requests.push(req.user.id);
    await project.save();

    res.json({ message: "Request sent successfully." });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(500).json({ message: "Failed to send request." });
  }
});

// ─── POST /api/projects/:id/accept ──────────────────────────
router.post("/:id/accept", async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or you are not the owner." });
    }

    if (!project.requests.includes(userId)) {
      return res.status(400).json({ message: "No request found from this user." });
    }

    project.requests = project.requests.filter(id => id.toString() !== userId);
    if (!project.members.includes(userId)) {
      project.members.push(userId);
    }
    await project.save();

    res.json({ message: "Request accepted and user added to project." });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(500).json({ message: "Failed to accept request." });
  }
});

module.exports = router;
