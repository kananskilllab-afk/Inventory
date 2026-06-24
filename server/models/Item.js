import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  serialNumber: { type: String, default: "" },
  category: { type: String, default: "" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  unit: { type: String, default: "Pcs" },
  price: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 5 },
  condition: { type: String, enum: ["New", "Good", "Fair", "Poor"], default: "New" },
  description: { type: String, default: "" },
  hsnCode: { type: String, default: "" },
  gstRate: { type: Number, default: 18 },
  // Book specific fields
  author: { type: String, default: "" },
  publisher: { type: String, default: "" },
  edition: { type: String, default: "" },
  publishYear: { type: String, default: "" },
  isbn: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);
