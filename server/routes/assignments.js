import express from "express";
import Assignment from "../models/Assignment.js";
import Item from "../models/Item.js";
import Person from "../models/Person.js";
import Department from "../models/Department.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// Generate receipt number
const generateReceiptNo = async () => {
  const count = await Assignment.countDocuments();
  return "REC-" + String(count + 1).padStart(5, "0");
};

// GET all assignments
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.personId) filter.personId = req.query.personId;

    // Non-admin: scope to their department
    if (req.user.role !== "admin") {
      if (!req.user.departmentId) return res.json([]);
      filter.departmentId = req.user.departmentId;
    } else if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }

    const assignments = await Assignment.find(filter)
      .populate("itemId")
      .populate("personId")
      .populate("departmentId")
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single assignment
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("itemId")
      .populate("personId")
      .populate("departmentId");
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create assignment
router.post("/", async (req, res) => {
  try {
    const { itemId, personId, departmentId, quantityAssigned, conditionOnAssign, assignedDate, expectedReturnDate, notes, issuedBy } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.quantity < (quantityAssigned || 1)) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${item.quantity}` });
    }

    const receiptNo = await generateReceiptNo();

    const assignment = await Assignment.create({
      receiptNo,
      itemId,
      personId,
      departmentId: departmentId || item.departmentId,
      quantityAssigned: quantityAssigned || 1,
      conditionOnAssign: conditionOnAssign || item.condition,
      assignedDate: assignedDate || new Date(),
      expectedReturnDate,
      notes,
      issuedBy,
    });

    item.quantity = Math.max(0, item.quantity - (quantityAssigned || 1));
    await item.save();

    const populated = await Assignment.findById(assignment._id)
      .populate("itemId")
      .populate("personId")
      .populate("departmentId");

    await ActivityLog.create({
      action: `"${item.name}" assigned to "${populated.personId?.name}" (Receipt: ${receiptNo})`,
      type: "assigned",
      itemName: item.name,
      personName: populated.personId?.name || "",
      departmentName: populated.departmentId?.name || "",
      quantity: quantityAssigned || 1,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH return item
router.patch("/:id/return", async (req, res) => {
  try {
    const { conditionOnReturn, returnNotes, returnedDate } = req.body;
    const assignment = await Assignment.findById(req.params.id)
      .populate("itemId")
      .populate("personId")
      .populate("departmentId");

    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    if (assignment.status === "Returned") return res.status(400).json({ error: "Already returned" });

    assignment.status = "Returned";
    assignment.returnedDate = returnedDate || new Date();
    assignment.conditionOnReturn = conditionOnReturn || "";
    assignment.returnNotes = returnNotes || "";
    await assignment.save();

    const item = await Item.findById(assignment.itemId._id);
    if (item) {
      item.quantity += assignment.quantityAssigned;
      if (conditionOnReturn) item.condition = conditionOnReturn;
      await item.save();
    }

    await ActivityLog.create({
      action: `"${assignment.itemId.name}" returned by "${assignment.personId?.name}"`,
      type: "returned",
      itemName: assignment.itemId.name,
      personName: assignment.personId?.name || "",
      departmentName: assignment.departmentId?.name || "",
      quantity: assignment.quantityAssigned,
      details: returnNotes || "",
    });

    const updated = await Assignment.findById(req.params.id)
      .populate("itemId")
      .populate("personId")
      .populate("departmentId");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
