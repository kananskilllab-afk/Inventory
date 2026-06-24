import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Person from "../models/Person.js";
import Assignment from "../models/Assignment.js";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// ── Person sync helpers ────────────────────────────────────────────────────────

// When a user with a departmentId is created/updated, keep their Person record in sync.
async function syncPersonForUser(user) {
  if (!user.departmentId) return;
  try {
    let person = await Person.findOne({ userId: user._id });
    if (person) {
      person.name = user.name;
      person.departmentId = user.departmentId;
      await person.save();
      return;
    }
    // Try to link by matching email → username
    if (user.username.includes("@")) {
      const byEmail = await Person.findOne({ email: user.username.toLowerCase(), userId: null });
      if (byEmail) {
        byEmail.userId = user._id;
        await byEmail.save();
        return;
      }
    }
    // Create a new Person profile
    await Person.create({
      name: user.name,
      employeeId: `USR-${user._id.toString().slice(-6).toUpperCase()}`,
      departmentId: user.departmentId,
      email: user.username.includes("@") ? user.username.toLowerCase() : "",
      userId: user._id,
    });
  } catch (err) {
    console.warn(`⚠️  Person sync warning for ${user.username}:`, err.message);
  }
}

// When a user is deleted, unlink or remove their Person record.
async function cleanupPersonForUser(userId) {
  try {
    const person = await Person.findOne({ userId });
    if (!person) return;
    const active = await Assignment.countDocuments({ personId: person._id, status: "Active" });
    if (active === 0) {
      await Person.findByIdAndDelete(person._id);
    } else {
      person.userId = null; // keep the record — they still have active assignments
      await person.save();
    }
  } catch (err) {
    console.warn("⚠️  Person cleanup warning:", err.message);
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/auth/reset-admin  — dev helper
router.get("/reset-admin", async (req, res) => {
  try {
    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      existing.password = "admin123";
      existing.role = "superadmin";
      await existing.save();
      return res.json({ message: "Admin password reset to admin123 and role set to superadmin" });
    }
    await User.create({ name: "Admin", username: "admin", password: "admin123", role: "superadmin" });
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

// POST /api/auth/register — first user becomes superadmin; after that, superadmin-only
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, role, departmentId } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ error: "Name, username, and password are required" });

    const userCount = await User.countDocuments();

    if (userCount > 0) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Superadmin authentication required" });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const requestingUser = await User.findById(decoded.id);
      if (!requestingUser || requestingUser.role !== "superadmin")
        return res.status(403).json({ error: "Only superadmins can create users" });
    }

    const assignedRole = userCount === 0 ? "superadmin" : (role || "user");
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      password,
      role: assignedRole,
      departmentId: departmentId || null,
    });

    // Auto-create employee profile if the user has a department
    await syncPersonForUser(user);

    res.status(201).json({
      message: `User "${user.name}" created as ${assignedRole}`,
      id: user._id,
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Username already exists" });
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id — superadmin updates user
router.put("/users/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, username, password, role, departmentId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "superadmin" && role && role !== "superadmin") {
      const superadminCount = await User.countDocuments({ role: "superadmin" });
      if (superadminCount <= 1) {
        return res.status(400).json({ error: "Cannot downgrade the only superadmin" });
      }
    }

    if (name) user.name = name;
    if (username) user.username = username.toLowerCase();
    if (password) user.password = password;
    if (role) user.role = role;
    user.departmentId = departmentId || null;

    await user.save();

    // Sync their employee profile
    await syncPersonForUser(user);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Username already exists" });
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id — superadmin deletes user
router.delete("/users/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: "Cannot delete your own account" });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (targetUser.role === "superadmin") {
      const superadminCount = await User.countDocuments({ role: "superadmin" });
      if (superadminCount <= 1) {
        return res.status(400).json({ error: "Cannot delete the only superadmin" });
      }
    }

    // Clean up linked employee profile before deleting user
    await cleanupPersonForUser(req.params.id);

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
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

// GET /api/auth/users — superadmin lists all users (with linked person info)
router.get("/users", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().populate("departmentId").sort({ createdAt: 1 });

    // Attach linked person name to each user
    const linkedPeople = await Person.find(
      { userId: { $in: users.map((u) => u._id) } },
      "userId name employeeId"
    );
    const personMap = {};
    linkedPeople.forEach((p) => { personMap[p.userId.toString()] = p; });

    res.json(users.map((u) => {
      const linked = personMap[u._id.toString()];
      return {
        id: u._id,
        name: u.name,
        username: u.username,
        role: u.role,
        departmentId: u.departmentId?._id || null,
        departmentName: u.departmentId?.name || null,
        createdAt: u.createdAt,
        linkedPerson: linked ? { _id: linked._id, name: linked.name, employeeId: linked.employeeId } : null,
      };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { syncPersonForUser };
export default router;
