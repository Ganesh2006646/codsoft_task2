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

  // Clear existing data
  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  console.log("🗑️  Cleared old data");

  // Create Admin User
  const adminUser = await User.create({
    name: "System Admin",
    email: "admin@projecthub.com",
    password: "adminpassword",
    role: "admin",
  });

  // Create Demo User
  const demoUser = await User.create({
    name: "Demo User",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  // Create 3 Heads
  const heads = await User.insertMany([
    { name: "Rajesh Kumar", email: "rajesh@projecthub.com", password: "password123" },
    { name: "Priya Sharma", email: "priya@projecthub.com", password: "password123" },
    { name: "Amit Patel", email: "amit@projecthub.com", password: "password123" },
  ]);

  // Create 10 Community Users
  const indianNames = ["Rahul Gupta", "Neha Singh", "Vikram Reddy", "Sneha Joshi", "Aditya Verma", "Kavya Desai", "Ravi Menon", "Pooja Iyer", "Sanjay Nair", "Anjali Rao"];
  
  const communityUsersData = indianNames.map((name, i) => {
    const firstName = name.split(" ")[0].toLowerCase();
    return {
      name: name,
      email: `${firstName}@projecthub.com`,
      password: "password123",
    };
  });
  const communityUsers = await User.insertMany(communityUsersData);

  // Heads create projects and add some community users as members
  const projectsData = [
    {
      title: "Alpha Platform",
      description: "Next gen AI platform.",
      owner: heads[0]._id,
      members: [communityUsers[0]._id, communityUsers[1]._id],
    },
    {
      title: "Beta Initiative",
      description: "Marketing rollout for Beta.",
      owner: heads[0]._id,
      members: [communityUsers[2]._id, communityUsers[3]._id],
    },
    {
      title: "Gamma Project",
      description: "Infrastructure overhaul.",
      owner: heads[1]._id,
      members: [communityUsers[4]._id, communityUsers[5]._id],
    },
    {
      title: "Delta Operations",
      description: "Scaling our database systems.",
      owner: heads[2]._id,
      members: [communityUsers[6]._id, communityUsers[7]._id],
    }
  ];

  const projects = await Project.insertMany(projectsData);

  // Add tasks
  const tasksData = [];
  projects.forEach((proj, idx) => {
    tasksData.push({
      title: `Task 1 for ${proj.title}`,
      description: "Initial setup",
      status: "Done",
      project: proj._id,
      assignee: indianNames[idx * 2]
    });
    tasksData.push({
      title: `Task 2 for ${proj.title}`,
      description: "Implementation phase",
      status: "In Progress",
      project: proj._id,
      assignee: indianNames[idx * 2 + 1]
    });
  });

  await Task.insertMany(tasksData);

  console.log("🌱 Database seeded successfully!");
  console.log("─────────────────────────────────");
  console.log("  🛡️ Admin Email  : admin@projecthub.com");
  console.log("  🛡️ Admin Pass   : adminpassword");
  console.log("─────────────────────────────────");
  console.log("  📧 Demo Email   : " + DEMO_EMAIL);
  console.log("  🔑 Demo Password: " + DEMO_PASSWORD);
  console.log("─────────────────────────────────");
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
