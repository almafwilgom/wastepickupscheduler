import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

// Ensure environment variables from .env are loaded
dotenv.config();

/**
 * Connects to MongoDB database using MONGODB_URI environment variable.
 */
export const connectDB = async () => {
  // Set DNS servers to Google and Cloudflare Public DNS to bypass local network DNS restrictions
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    console.log(`[Database] Custom DNS servers set successfully`);
  } catch (dnsErr) {
    console.warn(`[Database Warning] Failed to set custom DNS servers: ${dnsErr.message}`);
  }

  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wastepickupscheduler';

  try {
    console.log(`[Database] Connecting to MongoDB...`);
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB Atlas: ${error.message}`);
    console.warn(`👉 Check that your IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).`);
  }
};
