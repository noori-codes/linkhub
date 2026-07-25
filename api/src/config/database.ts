import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const connectionString = process.env.DATABASE;

  if (!connectionString) {
    throw new Error("DATABASE environment variable is missing.");
  }

  await mongoose.connect(connectionString);

  console.log("✅ MongoDB connected");
}
