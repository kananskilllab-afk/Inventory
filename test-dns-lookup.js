import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (!err && addresses.length > 0) {
      return callback(null, addresses[0], 4);
    }
    originalLookup(hostname, options, callback);
  });
};

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log("Connecting to:", process.env.MONGODB_URI);
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Successfully connected to remote Atlas MongoDB!");
  
  const users = await mongoose.connection.db.collection("users").find({}).toArray();
  console.log("Registered Users in DB:");
  console.log(JSON.stringify(users, null, 2));
  
  await mongoose.disconnect();
} catch (err) {
  console.error("❌ Failed to connect:", err);
}
