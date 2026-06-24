import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import User from "./models/User.js";
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

// Connect to MongoDB and start server
connectDB().then(async () => {
  await seedAdmin();
  // Only listen if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
});

export default app;
