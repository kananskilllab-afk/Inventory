import express from "express";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET activity logs
router.get("/", async (req, res) => {
  try {
    const { type, limit = 100, skip = 0 } = req.query;
    const filter = {};
    if (type) filter.type = type;

    // Non-admin: scope to their department
    if (req.user.role !== "admin" && req.user.departmentId) {
      const dept = req.user.departmentId;
      filter.departmentName = dept.name || dept;
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit);
    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
