import mongoose from 'mongoose';

// In-Memory store fallback if MongoDB is unavailable or URI is invalid
export class MemoryStore {
  users: Map<string, any> = new Map();
  donations: Map<string, any> = new Map();
}

export const memoryDb = new MemoryStore();

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  // Disable Mongoose command buffering so queries fail-fast when not connected
  mongoose.set('bufferCommands', false);

  if (!mongoUri) {
    console.log('ℹ️ MONGODB_URI not provided. Operating in in-memory persistence mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // Fast timeout for local dev or missing clusters
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err: any) {
    const errMsg = err?.message || 'Connection failed';
    console.log(`ℹ️ MongoDB notice: ${errMsg}. Operating in in-memory persistence mode.`);
  }
};

