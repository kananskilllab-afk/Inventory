import express from "express";
import Person from "../models/Person.js";
import Assignment from "../models/Assignment.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET all people
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.user.role !== "admin") {
      if (!req.user.departmentId) return res.json([]);
      filter.departmentId = req.user.departmentId;
    } else if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }

    const people = await Person.find(filter).populate("departmentId").sort({ name: 1 });
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single person with assignments
router.get("/:id", async (req, res) => {
  try {
    const person = await Person.findById(req.params.id).populate("departmentId");
    if (!person) return res.status(404).json({ error: "Person not found" });
    const assignments = await Assignment.find({ personId: person._id })
      .populate("itemId")
      .populate("departmentId")
      .sort({ createdAt: -1 });
    res.json({ person, assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create person
router.post("/", async (req, res) => {
  try {
    const person = await Person.create(req.body);
    const populated = await Person.findById(person._id).populate("departmentId");
    await ActivityLog.create({
      action: `Employee "${person.name}" (${person.employeeId}) added`,
      type: "person_added",
      personName: person.name,
      departmentName: populated.departmentId?.name || "",
    });
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update person
router.put("/:id", async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("departmentId");
    if (!person) return res.status(404).json({ error: "Person not found" });
    await ActivityLog.create({
      action: `Employee "${person.name}" updated`,
      type: "person_edited",
      personName: person.name,
    });
    res.json(person);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE person
router.delete("/:id", async (req, res) => {
  try {
    const activeAssignments = await Assignment.countDocuments({ personId: req.params.id, status: "Active" });
    if (activeAssignments > 0) {
      return res.status(400).json({ error: `Cannot delete: ${activeAssignments} active assignment(s) exist. Return items first.` });
    }
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) return res.status(404).json({ error: "Person not found" });
    await ActivityLog.create({
      action: `Employee "${person.name}" deleted`,
      type: "person_deleted",
      personName: person.name,
    });
    res.json({ message: "Person deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
