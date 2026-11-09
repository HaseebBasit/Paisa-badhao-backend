const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '' && !process.env.MONGODB_URI.includes('your_mongodb_connection_string')
    ? process.env.MONGODB_URI
    : null;

  try {
    if (uri) {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log('MongoDB Connected successfully (Atlas/Remote).');
    } else {
      console.log('No external MONGODB_URI detected. Initializing embedded local MongoDB engine...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`Embedded MongoDB instance connected at: ${inMemoryUri}`);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (!mongodInstance) {
      console.log('Attempting fallback to embedded MongoDB engine...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const inMemoryUri = mongodInstance.getUri();
        await mongoose.connect(inMemoryUri);
        console.log(`Fallback embedded MongoDB connected at: ${inMemoryUri}`);
      } catch (fallbackError) {
        console.error('Fallback MongoDB engine also failed:', fallbackError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
