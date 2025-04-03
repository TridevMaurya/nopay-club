import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// For development, we'll use an in-memory MongoDB server
let mongoServer: MongoMemoryServer;

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    // Check if MONGODB_URI is provided (for production)
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB production database');
    } else {
      // For development, start in-memory MongoDB server
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB for development');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Close MongoDB connection
export async function closeDatabaseConnection() {
  try {
    await mongoose.connection.close();
    
    // If we're using the in-memory MongoDB server, stop it
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB server stopped');
    }
    
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});