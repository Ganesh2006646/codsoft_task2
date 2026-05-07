const express = require("express");
const User = require("../models/User");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

router.use(adminMiddleware);

// ─── GET /api/admin/overview ────────────────────────────────
router.get("/overview", async (req, res) => {
  try {
    // Find all users who own at least one project (Heads)
    const projects = await Project.find()
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    // Group projects by owner
    const headsMap = {};

    projects.forEach((proj) => {
      const ownerId = proj.owner._id.toString();
      if (!headsMap[ownerId]) {
        headsMap[ownerId] = {
          _id: proj.owner._id,
          name: proj.owner.name,
          email: proj.owner.email,
          projects: [],
        };
      }
      headsMap[ownerId].projects.push({
        _id: proj._id,
        title: proj.title,
        description: proj.description,
        deadline: proj.deadline,
        members: proj.members,
      });
    });

    const heads = Object.values(headsMap);

    res.json({ heads });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin overview." });
  }
});

module.exports = router;
