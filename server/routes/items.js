import express from "express";
import Item from "../models/Item.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET all items
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    // Non-admin users can only see their department's items
    if (req.user.role !== "admin") {
      if (!req.user.departmentId) return res.json([]);
      filter.departmentId = req.user.departmentId;
    } else if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }

    const items = await Item.find(filter).populate("departmentId").sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("departmentId");
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create item
router.post("/", async (req, res) => {
  try {
    const item = await Item.create(req.body);
    const populated = await Item.findById(item._id).populate("departmentId");
    await ActivityLog.create({
      action: `Item "${item.name}" (${item.sku}) added`,
      type: "item_added",
      itemName: item.name,
      departmentName: populated.departmentId?.name || "",
      quantity: item.quantity,
    });
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update item
router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("departmentId");
    if (!item) return res.status(404).json({ error: "Item not found" });
    await ActivityLog.create({
      action: `Item "${item.name}" updated`,
      type: "item_edited",
      itemName: item.name,
      departmentName: item.departmentId?.name || "",
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE item
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    await ActivityLog.create({
      action: `Item "${item.name}" deleted`,
      type: "item_deleted",
      itemName: item.name,
    });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH stock in/out
router.patch("/:id/stock", async (req, res) => {
  try {
    const { type, quantity, note } = req.body;
    const item = await Item.findById(req.params.id).populate("departmentId");
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (type === "in") {
      item.quantity += quantity;
    } else if (type === "out") {
      item.quantity = Math.max(0, item.quantity - quantity);
    }
    await item.save();

    await ActivityLog.create({
      action: `Stock ${type === "in" ? "added to" : "removed from"} "${item.name}" — ${quantity} ${item.unit}${note ? ` (${note})` : ""}`,
      type: type === "in" ? "stock_in" : "stock_out",
      itemName: item.name,
      departmentName: item.departmentId?.name || "",
      quantity: quantity,
      details: note || "",
    });

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
