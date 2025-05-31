// src/lib/dbConnect.ts
import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.resolve();  // Skip connection during build
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    };
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    cached.promise = mongoose.connect(uri, opts).then(mongoose => {
      console.log('Connected successfully to MongoDB Atlas');
      return mongoose;
    }).catch(error => {
      console.error('MongoDB Atlas connection error:', error);
      throw error;
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}