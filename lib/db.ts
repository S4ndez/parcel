import mongoose from 'mongoose';
import { env } from '@/config/env';
import dns from 'dns';

// Programmatically set Node DNS servers to Google and Cloudflare DNS
// to bypass local ISP blocks resolving MongoDB SRV records.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('🌐 Node DNS servers set to Google & Cloudflare DNS to bypass local SRV block.');
} catch (e) {
  console.warn('⚠️ Failed to set custom DNS servers:', e);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Restrict connection pool size to prevent exhausting Atlas free tier limit (500 max) during hot-reloads
      serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds instead of hanging for 30 seconds
      socketTimeoutMS: 45000,
    };

    console.log('Connecting to MongoDB database at:', env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
    cached!.promise = mongoose.connect(env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connected successfully!');
      return mongooseInstance;
    }).catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    console.error('❌ Failed to resolve MongoDB cache connection:', e);
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
