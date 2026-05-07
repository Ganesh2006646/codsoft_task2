const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@projecthub.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo1234";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Remove any existing demo user + their data
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    const projects = await Project.find({ owner: existing._id });
    for (const p of projects) await Task.deleteMany({ project: p._id });
    await Project.deleteMany({ owner: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log("🗑️  Cleared old demo data");
  }

  // Create demo user (password hashed via pre-save hook)
  const user = await User.create({
    name: "Demo User",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  console.log(`👤 Demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // ── Project 1: Website Redesign ──
  const p1 = await Project.create({
    title: "Website Redesign",
    description: "Redesign the company website with a modern UI and improved performance.",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    owner: user._id,
  });
  await Task.insertMany([
    { title: "Create wireframes",        description: "Design all page layouts in Figma.",          assignee: "Alice",  dueDate: new Date(Date.now() + 3  * 86400000), status: "Done",        project: p1._id },
    { title: "Set up project repo",      description: "Initialize Git repo and folder structure.",   assignee: "Bob",    dueDate: new Date(Date.now() + 2  * 86400000), status: "Done",        project: p1._id },
    { title: "Build homepage component", description: "Code the hero, navbar, and footer sections.", assignee: "Alice",  dueDate: new Date(Date.now() + 7  * 86400000), status: "In Progress", project: p1._id },
    { title: "Write API integration",    description: "Connect the contact form to the backend.",    assignee: "Bob",    dueDate: new Date(Date.now() + 10 * 86400000), status: "Todo",        project: p1._id },
    { title: "Cross-browser testing",    description: "Test on Chrome, Firefox, Safari, and Edge.",  assignee: "Carol",  dueDate: new Date(Date.now() + 13 * 86400000), status: "Todo",        project: p1._id },
  ]);

  // ── Project 2: Mobile App MVP ──
  const p2 = await Project.create({
    title: "Mobile App MVP",
    description: "Build the minimum viable product for the new React Native mobile application.",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    owner: user._id,
  });
  await Task.insertMany([
    { title: "Define app screens",       description: "List all screens and navigation flows.",      assignee: "Dan",    dueDate: new Date(Date.now() + 4  * 86400000), status: "Done",        project: p2._id },
    { title: "Auth flow",                description: "Login and registration screens with JWT.",     assignee: "Eve",    dueDate: new Date(Date.now() + 8  * 86400000), status: "In Progress", project: p2._id },
    { title: "Dashboard screen",         description: "Build the main dashboard UI.",                assignee: "Dan",    dueDate: new Date(Date.now() + 15 * 86400000), status: "Todo",        project: p2._id },
    { title: "Push notifications",       description: "Integrate Firebase Cloud Messaging.",          assignee: "Eve",    dueDate: new Date(Date.now() + 25 * 86400000), status: "Todo",        project: p2._id },
  ]);

  // ── Project 3: Marketing Campaign ──
  const p3 = await Project.create({
    title: "Q2 Marketing Campaign",
    description: "Plan and execute the Q2 social media and email marketing campaign.",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    owner: user._id,
  });
  await Task.insertMany([
    { title: "Write campaign brief",     description: "Define target audience and key messages.",    assignee: "Frank",  dueDate: new Date(Date.now() + 1  * 86400000), status: "Done",        project: p3._id },
    { title: "Design social assets",     description: "Create graphics for Instagram and Twitter.",  assignee: "Grace",  dueDate: new Date(Date.now() + 3  * 86400000), status: "Done",        project: p3._id },
    { title: "Schedule email blasts",    description: "Set up automated email sequences in HubSpot.",assignee: "Frank",  dueDate: new Date(Date.now() + 5  * 86400000), status: "Done",        project: p3._id },
    { title: "Analyze performance",      description: "Review click-through and conversion rates.",   assignee: "Grace",  dueDate: new Date(Date.now() + 7  * 86400000), status: "In Progress", project: p3._id },
  ]);

  console.log("🌱 Demo projects and tasks seeded!");
  console.log("\n─────────────────────────────────");
  console.log("  📧 Email   : demo@projecthub.com");
  console.log("  🔑 Password: demo1234");
  console.log("─────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("✅ Done. You can now log in with the demo credentials.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
