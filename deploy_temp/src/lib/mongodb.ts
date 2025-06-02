import { MongoClient, ServerApiVersion } from 'mongodb';

// Use the MongoDB Atlas connection string from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

// Log connection string for debugging (without showing credentials)
const sanitizedUri = uri.includes('@') 
  ? uri.replace(/(mongodb\+srv:\/\/|mongodb:\/\/)[^@]+@/, '$1****:****@')
  : uri;
console.log(`Connecting to MongoDB Atlas: ${sanitizedUri}`);

// MongoDB client options with Server API configuration
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise and database reference
export default clientPromise;

// Helper function to get the database
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'ancestrychain'); // Use database name from environment variables
}

// Helper function to check connection
export async function checkConnection() {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    console.log('Connected successfully to MongoDB Atlas');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    return false;
  }
}
