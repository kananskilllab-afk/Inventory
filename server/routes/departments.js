import express from "express";
import Department from "../models/Department.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All department routes require auth
router.use(requireAuth);

// GET all departments
// Admin: all departments; regular user: only their own department
router.get("/", async (req, res) => {
  try {
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      const departments = await Department.find().sort({ createdAt: 1 });
      return res.json(departments);
    }
    // Non-admin: only return their department
    if (!req.user.departmentId) return res.json([]);
    const dept = await Department.findById(req.user.departmentId);
    return res.json(dept ? [dept] : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single department
router.get("/:id", async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    // Non-admin can only view their own department
    if (req.user.role !== "admin" && req.user.role !== "superadmin" && req.user.departmentId?.toString() !== dept._id.toString())
      return res.status(403).json({ error: "Access denied" });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create department — admin only
router.post("/", requireAdmin, async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    await ActivityLog.create({
      action: `Department "${dept.name}" created`,
      type: "department_added",
      departmentName: dept.name,
    });
    res.status(201).json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update department — admin only
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { _id, __v, createdAt, updatedAt, ...updateData } = req.body;
    const dept = await Department.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    await ActivityLog.create({
      action: `Department "${dept.name}" updated`,
      type: "department_edited",
      departmentName: dept.name,
    });
    res.json(dept);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE department — admin only
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
