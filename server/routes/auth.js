import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/auth/reset-admin  — creates or resets the admin account (dev helper)
router.get("/reset-admin", async (req, res) => {
  try {
    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      existing.password = "admin123";
      await existing.save(); // triggers bcrypt hash via pre-save hook
      return res.json({ message: "Admin password reset to admin123" });
    }
    await User.create({ name: "Admin", username: "admin", password: "admin123", role: "admin" });
    res.json({ message: "Admin account created — username: admin, password: admin123" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const user = await User.findOne({ username: username.toLowerCase() }).populate("departmentId");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        departmentId: user.departmentId?._id || null,
        departmentName: user.departmentId?.name || null,
        departmentColor: user.departmentId?.color || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register — first user becomes admin; after that, admin-only
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, role, departmentId } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: "Name, username, and password are required" });

    const userCount = await User.countDocuments();

    // After first user, require admin auth
    if (userCount > 0) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Admin authentication required" });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const requestingUser = await User.findById(decoded.id);
      if (!requestingUser || requestingUser.role !== "admin")
        return res.status(403).json({ error: "Only admins can create users" });
    }

    const assignedRole = userCount === 0 ? "admin" : (role || "user");
    const user = await User.create({
      name,
      username,
      password,
      role: assignedRole,
      departmentId: departmentId || null,
    });

    res.status(201).json({
      message: `User "${user.name}" created as ${assignedRole}`,
      id: user._id,
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Username already exists" });
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id — admin updates user
router.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, username, password, role, departmentId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (username) user.username = username.toLowerCase();
    if (password) user.password = password; // triggers pre-save hash
    if (role) user.role = role;
    user.departmentId = departmentId || null;

    await user.save();
    res.json({ message: "User updated" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Username already exists" });
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id — admin deletes user
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: "Cannot delete your own account" });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    id: u._id,
    name: u.name,
    username: u.username,
    role: u.role,
    departmentId: u.departmentId?._id || null,
    departmentName: u.departmentId?.name || null,
    departmentColor: u.departmentId?.color || null,
  });
});

// GET /api/auth/users — admin lists all users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().populate("departmentId").sort({ createdAt: 1 });
    res.json(users.map((u) => ({
      id: u._id,
      name: u.name,
      username: u.username,
      role: u.role,
      departmentId: u.departmentId?._id || null,
      departmentName: u.departmentId?.name || null,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
