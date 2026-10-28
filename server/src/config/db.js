import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/daytrack';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 7000
    });
    console.log(`[DayTrack] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DayTrack] Primary MongoDB Connection Error (${mongoUri.split('@')[1] || mongoUri}): ${error.message}`);

    // If Atlas connection fails (e.g. IP whitelist / network issue), gracefully attempt local fallback
    if (mongoUri.includes('mongodb+srv')) {
      console.log('[DayTrack] Attempting fallback to local MongoDB instance...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/daytrack');
        console.log(`[DayTrack] Connected to fallback local MongoDB: ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error(`[DayTrack] Fallback local MongoDB failed: ${localError.message}`);
      }
    }
    process.exit(1);
  }
};
