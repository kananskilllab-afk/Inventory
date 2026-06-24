import express from "express";
import Item from "../models/Item.js";
import Assignment from "../models/Assignment.js";
import Person from "../models/Person.js";
import Department from "../models/Department.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// GET dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    const deptFilter = isAdmin ? {} : { departmentId: req.user.departmentId };
    const deptAssignFilter = isAdmin ? {} : { departmentId: req.user.departmentId };

    const totalItems = await Item.countDocuments(deptFilter);

    // Total units currently IN stock (reduced when items are assigned out)
    const stockAgg = await Item.aggregate([
      { $match: deptFilter },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const totalStock = stockAgg[0]?.total || 0;

    // Total units currently ASSIGNED OUT (sum of quantityAssigned for active assignments)
    const assignedUnitsAgg = await Assignment.aggregate([
      { $match: { ...deptAssignFilter, status: "Active" } },
      { $group: { _id: null, total: { $sum: "$quantityAssigned" } } },
    ]);
    const totalAssignedUnits = assignedUnitsAgg[0]?.total || 0;

    const totalPeople = await Person.countDocuments(isAdmin ? {} : { departmentId: req.user.departmentId });
    const activeAssignments = await Assignment.countDocuments({ ...deptAssignFilter, status: "Active" });
    const overdueAssignments = await Assignment.countDocuments({
      ...deptAssignFilter,
      status: "Active",
      expectedReturnDate: { $lt: new Date(), $ne: null },
    });

    // Departments to show in stats
    const departments = isAdmin
      ? await Department.find()
      : req.user.departmentId
        ? await Department.find({ _id: req.user.departmentId })
        : [];

    const deptStats = await Promise.all(
      departments.map(async (dept) => {
        const items = await Item.countDocuments({ departmentId: dept._id });
        const stockAgg = await Item.aggregate([
          { $match: { departmentId: dept._id } },
          { $group: { _id: null, total: { $sum: "$quantity" }, value: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } },
        ]);
        const assignedCountAgg = await Assignment.aggregate([
          { $match: { departmentId: dept._id, status: "Active" } },
          { $group: { _id: null, total: { $sum: "$quantityAssigned" } } },
        ]);
        const activeAssignmentRecords = await Assignment.countDocuments({ departmentId: dept._id, status: "Active" });
        return {
          _id: dept._id,
          name: dept.name,
          icon: dept.icon,
          color: dept.color,
          itemCount: items,
          totalStock: stockAgg[0]?.total || 0,
          stockValue: stockAgg[0]?.value || 0,
          activeAssignments: activeAssignmentRecords,
          totalAssignedUnits: assignedCountAgg[0]?.total || 0,
        };
      })
    );

    const lowStockItems = await Item.find({
      ...deptFilter,
      $expr: { $lt: ["$quantity", "$reorderLevel"] },
    }).populate("departmentId").limit(20);

    let userActiveAssignments = 0;
    if (!isAdmin) {
      // Find by userId link first (reliable), fall back to email match
      const person = await Person.findOne({ userId: req.user._id }) ||
                     await Person.findOne({ email: req.user.username.toLowerCase() });
      if (person) {
        userActiveAssignments = await Assignment.countDocuments({ personId: person._id, status: "Active" });
      }
    }

    res.json({
      totalItems,
      totalStock,
      totalAssignedUnits,
      totalPeople,
      activeAssignments,
      overdueAssignments,
      deptStats,
      lowStockItems,
      userActiveAssignments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET export data
router.get("/export/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    const deptFilter = isAdmin ? {} : { departmentId: req.user.departmentId };
    let data = [];
    let filename = "";

    if (type === "items") {
      data = await Item.find(deptFilter).populate("departmentId").lean();
      data = data.map((d) => ({
        Name: d.name,
        SKU: d.sku,
        SerialNumber: d.serialNumber,
        Category: d.category,
        Department: d.departmentId?.name || "",
        Unit: d.unit,
        Quantity: d.quantity,
        CostPrice: d.costPrice,
        SellingPrice: d.price,
        Condition: d.condition,
        ReorderLevel: d.reorderLevel,
      }));
      filename = "items_export.csv";
    } else if (type === "assignments") {
      data = await Assignment.find(deptFilter).populate("itemId").populate("personId").populate("departmentId").lean();
      data = data.map((d) => ({
        ReceiptNo: d.receiptNo,
        Item: d.itemId?.name || "",
        SKU: d.itemId?.sku || "",
        AssignedTo: d.personId?.name || "",
        EmployeeId: d.personId?.employeeId || "",
        Department: d.departmentId?.name || "",
        Quantity: d.quantityAssigned,
        AssignedDate: d.assignedDate,
        ExpectedReturn: d.expectedReturnDate || "",
        Status: d.status,
        ReturnedDate: d.returnedDate || "",
        ConditionOnAssign: d.conditionOnAssign,
        ConditionOnReturn: d.conditionOnReturn || "",
      }));
      filename = "assignments_export.csv";
    } else if (type === "people") {
      data = await Person.find(isAdmin ? {} : { departmentId: req.user.departmentId }).populate("departmentId").lean();
      data = data.map((d) => ({
        Name: d.name,
        EmployeeId: d.employeeId,
        Department: d.departmentId?.name || "",
        Designation: d.designation,
        Email: d.email,
        Phone: d.phone,
      }));
      filename = "people_export.csv";
    } else {
      return res.status(400).json({ error: "Invalid export type" });
    }

    if (data.length === 0) return res.status(404).json({ error: "No data to export" });
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => {
          let val = row[h] ?? "";
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        }).join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
