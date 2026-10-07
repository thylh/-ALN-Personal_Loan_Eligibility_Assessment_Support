const mongoose = require('mongoose');

let isConnected = false;
let isMockMode = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hethongvayvon';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${mongoUri}`);
    // Sync models and memory store
    try {
      const memoryStore = require('../store/memoryStore');
      await memoryStore.initMongoSync();
    } catch (syncErr) {
      console.warn('[Database] Sync error:', syncErr.message);
    }
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${error.message}). Falling back to In-Memory Storage mode for seamless execution.`);
    isMockMode = true;
  }
};

const getStatus = () => ({ isConnected, isMockMode });

module.exports = { connectDB, getStatus };
