import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  designation: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Person", personSchema);
