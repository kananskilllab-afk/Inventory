import express from "express";
import Category from "../models/Category.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("departmentId").sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create category
router.post("/", async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    await ActivityLog.create({
      action: `Category "${cat.name}" created`,
      type: "category_added",
    });
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
