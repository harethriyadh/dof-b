const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear database
const clearDatabase = async () => {
  try {
    console.log('Clearing database...');

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Drop each collection
    for (const collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }

    console.log('Database cleared successfully!');

  } catch (error) {
    console.error('Clear database error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run clearing
connectDB().then(() => {
  clearDatabase();
});
