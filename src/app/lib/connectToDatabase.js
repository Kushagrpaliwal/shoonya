import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable.");
}

// Use globalThis to prevent multiple connections in Next.js
let cached = globalThis._mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI)
      .then((mongoose) => mongoose)
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    globalThis._mongoose = cached; // Store in global object
    console.log("MongoDB connected successfully.");
    return cached.conn;
  } catch (err) {
    cached.promise = null; // Reset the promise to allow retries
    throw err;
  }
}
