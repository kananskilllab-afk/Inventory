import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
