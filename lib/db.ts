import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

const mongoUri = MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        retryWrites: true,
      })
      .then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    throw new Error(
      `MongoDB connection failed. Check your MONGODB_URI and network access. ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return cached!.conn;
}
