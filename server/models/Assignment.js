import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  receiptNo: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  personId: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  quantityAssigned: { type: Number, default: 1 },
  assignedDate: { type: Date, default: Date.now },
  expectedReturnDate: { type: Date, default: null },
  conditionOnAssign: { type: String, enum: ["New", "Good", "Fair", "Poor"], default: "Good" },
  status: { type: String, enum: ["Active", "Returned", "Overdue"], default: "Active" },
  returnedDate: { type: Date, default: null },
  conditionOnReturn: { type: String, default: "" },
  returnNotes: { type: String, default: "" },
  notes: { type: String, default: "" },
  issuedBy: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Assignment", assignmentSchema);
