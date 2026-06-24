// Run this once to reset/create the admin account:
//   node reset-admin.js

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { MongoMemoryServer } from "mongodb-memory-server";

let uri = process.env.MONGODB_URI;
let mongoServer;
if (!uri || uri.includes("cluster0")) {
  console.log("⚡ Starting local in-memory MongoDB...");
  mongoServer = await MongoMemoryServer.create();
  uri = mongoServer.getUri();
}

await mongoose.connect(uri);
console.log("Connected to MongoDB at " + uri);

// Use the raw collection to avoid any middleware issues
const col = mongoose.connection.db.collection("users");

const hashed = await bcrypt.hash("admin123", 10);

const result = await col.updateOne(
  { username: "admin" },
  { $set: { name: "Admin", username: "admin", password: hashed, role: "admin", departmentId: null, updatedAt: new Date() },
    $setOnInsert: { createdAt: new Date() } },
  { upsert: true }
);

if (result.upsertedCount) {
  console.log("✅ Admin account CREATED");
} else {
  console.log("✅ Admin account RESET");
}
console.log("   Username : admin");
console.log("   Password : admin123");

await mongoose.disconnect();
