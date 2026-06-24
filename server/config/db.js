import mongoose from "mongoose";
import dns from "dns";
import { Resolver } from "dns";
import { promisify } from "util";

/**
 * Resolve MongoDB Atlas SRV connection string to a direct URI,
 * then patch dns.lookup so host resolution uses Google DNS.
 * This bypasses SRV resolution issues on networks with broken DNS.
 *
 * Node.js v24 compat: handles dns.lookup({all: true}).
 */

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "8.8.4.4"]);
const resolveSrv = promisify(resolver.resolveSrv.bind(resolver));
const resolveTxt = promisify(resolver.resolveTxt.bind(resolver));
const resolve4 = promisify(resolver.resolve4.bind(resolver));

/**
 * Convert mongodb+srv:// URI to a direct mongodb:// URI
 * by resolving SRV and TXT records via Google DNS.
 */
async function srvToDirectUri(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) return srvUri; // not an SRV URI, return as-is

  const credentials = match[1];       // user:password
  const clusterHost = match[2];       // cluster0.ulk2olz.mongodb.net
  const dbPath = match[3] || "/";     // /inventory-management
  const queryString = match[4] || ""; // ?appName=Cluster0

  console.log(`🔍 Resolving SRV records for ${clusterHost}...`);

  // Resolve SRV records
  const srvRecords = await resolveSrv(`_mongodb._tcp.${clusterHost}`);
  const hostList = srvRecords.map(r => `${r.name}:${r.port}`).join(",");

  // Resolve TXT records for authSource & replicaSet
  let txtParams = "";
  try {
    const txtRecords = await resolveTxt(clusterHost);
    if (txtRecords.length > 0) {
      txtParams = txtRecords[0].join("");
    }
  } catch (e) {
    console.warn("⚠️ TXT lookup failed:", e.message);
  }

  // Pre-resolve all host IPs and cache them
  const ipCache = {};
  for (const record of srvRecords) {
    try {
      const ips = await resolve4(record.name);
      ipCache[record.name] = ips[0];
      console.log(`  ✅ ${record.name} → ${ips[0]}`);
    } catch (e) {
      console.warn(`  ⚠️ Could not resolve ${record.name}: ${e.message}`);
    }
  }

  // Patch dns.lookup to use cached IPs
  const originalLookup = dns.lookup;
  dns.lookup = function (hostname, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    const ip = ipCache[hostname];
    if (ip) {
      if (options && options.all) {
        return callback(null, [{ address: ip, family: 4 }]);
      }
      return callback(null, ip, 4);
    }
    // Not cached — try Google DNS on the fly
    resolver.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        if (options && options.all) {
          return callback(null, [{ address: addresses[0], family: 4 }]);
        }
        return callback(null, addresses[0], 4);
      }
      originalLookup.call(dns, hostname, options, callback);
    });
  };

  // Build the direct URI
  // Merge TXT params with existing query params, add tls=true (required for Atlas)
  const existingParams = queryString ? queryString.substring(1) : "";
  const allParams = [txtParams, "tls=true", existingParams].filter(Boolean).join("&");

  const directUri = `mongodb://${credentials}@${hostList}${dbPath}?${allParams}`;
  console.log(`✅ Resolved to direct URI with ${srvRecords.length} hosts`);
  return directUri;
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://kananskilllab_db_user:DDjGQUaKsG9gij8t@cluster0.ulk2olz.mongodb.net/inventory-management?appName=Cluster0";
    console.log("Connecting to MongoDB...");

    // Convert SRV URI to direct URI (also sets up DNS cache)
    const directUri = await srvToDirectUri(uri);

    const conn = await mongoose.connect(directUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("🔄 Attempting to start in-memory MongoDB fallback...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`ℹ️ In-memory MongoDB URI: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Connected to in-memory MongoDB: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`❌ Fallback MongoDB failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
