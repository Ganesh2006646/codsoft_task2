const express = require("express");
const Activity = require("../models/Activity");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// GET /api/activities/:projectId
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const activities = await Activity.find({ project: req.params.projectId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(500).json({ message: "Failed to fetch activities." });
  }
});

module.exports = router;
