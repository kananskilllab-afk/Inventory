import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  type: { type: String, enum: ["item_added", "item_edited", "item_deleted", "stock_in", "stock_out", "assigned", "returned", "person_added", "person_edited", "person_deleted", "department_added", "department_edited", "category_added"], required: true },
  itemName: { type: String, default: "" },
  personName: { type: String, default: "" },
  departmentName: { type: String, default: "" },
  details: { type: String, default: "" },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("ActivityLog", activityLogSchema);
