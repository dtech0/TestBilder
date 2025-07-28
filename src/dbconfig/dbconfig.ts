import mongoose from "mongoose";

const MONGO_URL =
  "mongodb+srv://u2104070:sayed2104070@cluster0.tzxod9n.mongodb.net/TestBuilder?retryWrites=true&w=majority&appName=Cluster0";

let cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
