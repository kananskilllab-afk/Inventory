import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: "box" },
  color: { type: String, default: "#6366f1" },
  description: { type: String, default: "" },
  contactPerson: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  location: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);
