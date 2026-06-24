import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import User from "./models/User.js";
import Department from "./models/Department.js";
import Category from "./models/Category.js";
import Item from "./models/Item.js";

import authRoutes from "./routes/auth.js";
import departmentRoutes from "./routes/departments.js";
import categoryRoutes from "./routes/categories.js";
import itemRoutes from "./routes/items.js";
import peopleRoutes from "./routes/people.js";
import assignmentRoutes from "./routes/assignments.js";
import activityRoutes from "./routes/activity.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Always ensure the default admin account exists and works
async function seedAdmin() {
  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    // Reset password so admin/admin123 always works
    existing.password = "admin123";
    existing.role = "superadmin";
    await existing.save();
    console.log("✅ SuperAdmin account ready  →  username: admin  |  password: admin123");
  } else {
    await User.create({ name: "Admin", username: "admin", password: "admin123", role: "superadmin" });
    console.log("✅ SuperAdmin account created  →  username: admin  |  password: admin123");
  }
}

async function seedDatabase() {
  await seedAdmin();

  // Seed Departments
  const deptCount = await Department.countDocuments();
  if (deptCount === 0) {
    console.log("🌱 Seeding default departments...");
    const depts = [
      { name: "Tech", icon: "monitor", color: "#3b82f6", description: "Laptops, monitors, and networking devices" },
      { name: "Stationery", icon: "pen", color: "#ec4899", description: "Notebooks, pens, folders, and office essentials" },
      { name: "Books", icon: "book", color: "#10b981", description: "Textbooks, handbooks, reference books, and manuals" }
    ];
    const createdDepts = await Department.insertMany(depts);
    console.log(`✅ Seeded ${createdDepts.length} departments.`);

    // Seed Categories
    console.log("🌱 Seeding default categories...");
    const techDept = createdDepts.find(d => d.name === "Tech");
    const statDept = createdDepts.find(d => d.name === "Stationery");
    const bookDept = createdDepts.find(d => d.name === "Books");

    const categories = [
      { name: "Laptops", departmentId: techDept._id },
      { name: "Monitors", departmentId: techDept._id },
      { name: "Accessories", departmentId: techDept._id },
      { name: "Writing Instruments", departmentId: statDept._id },
      { name: "Paper Products", departmentId: statDept._id },
      { name: "Engineering Textbooks", departmentId: bookDept._id },
      { name: "Management Books", departmentId: bookDept._id }
    ];
    await Category.insertMany(categories);
    console.log("✅ Seeded categories.");

    // Seed Items
    console.log("🌱 Seeding default items...");
    const items = [
      {
        name: "ThinkPad L14",
        sku: "TECH-LAP-001",
        category: "Laptops",
        departmentId: techDept._id,
        quantity: 15,
        price: 55000,
        costPrice: 48000,
        reorderLevel: 3,
        description: "Intel Core i5, 16GB RAM, 512GB SSD"
      },
      {
        name: "Dell 24\" Monitor",
        sku: "TECH-MON-002",
        category: "Monitors",
        departmentId: techDept._id,
        quantity: 20,
        price: 12000,
        costPrice: 9500,
        reorderLevel: 4,
        description: "Full HD IPS panel with HDMI and DisplayPort"
      },
      {
        name: "Uniball Eye Gel Pen",
        sku: "STAT-PEN-001",
        category: "Writing Instruments",
        departmentId: statDept._id,
        quantity: 120,
        price: 80,
        costPrice: 60,
        reorderLevel: 10,
        description: "Fine tip rollerball liquid ink pen, blue"
      },
      {
        name: "A4 Copier Paper 75GSM",
        sku: "STAT-PAP-002",
        category: "Paper Products",
        departmentId: statDept._id,
        quantity: 45,
        price: 350,
        costPrice: 280,
        reorderLevel: 5,
        unit: "Reams",
        description: "High brightness printing and copying paper"
      },
      {
        name: "Introduction to Algorithms",
        sku: "BOOK-ENG-001",
        category: "Engineering Textbooks",
        departmentId: bookDept._id,
        quantity: 8,
        price: 1200,
        costPrice: 950,
        reorderLevel: 2,
        author: "Thomas H. Cormen",
        publisher: "MIT Press",
        edition: "4th Edition",
        publishYear: "2022",
        isbn: "9780262046305",
        description: "Standard reference textbook for algorithms study"
      }
    ];
    await Item.insertMany(items);
    console.log("✅ Seeded default items.");
  }
}

// Connect to MongoDB and start server
connectDB().then(async () => {
  await seedDatabase();
  // Only listen if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
});

export default app;
