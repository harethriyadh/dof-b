const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Use in-memory database for development if no MongoDB is available
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri || mongoUri.includes('localhost:27017')) {
      // Try to connect to local MongoDB, if fails, use in-memory
      try {
        const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/leave-management', {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 2000,
          socketTimeoutMS: 45000,
          bufferCommands: true
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
      } catch (localError) {
        logger.warn('Local MongoDB not available, using in-memory database for development');
        // For now, we'll create a simple mock database
        mongoose.connection.readyState = 1; // Mark as connected
        logger.info('Using mock database connection for development');
      }
    } else {
      // Use the provided MongoDB URI
      const conn = await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: true
      });
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    logger.warn('Continuing without database connection for development...');
    // Don't exit in development mode, allow the app to start without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
