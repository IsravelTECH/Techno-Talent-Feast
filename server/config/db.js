import mongoose from 'mongoose';
import dns from 'dns';

// Only override DNS servers on local Windows if needed, never crash in serverless/production
if (process.platform === 'win32' && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    console.warn('DNS server override warning:', e.message);
  }
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TechnoTalentFeast:technotalentfeast@cluster0.hd3ty4r.mongodb.net/techno_talent_feast?retryWrites=true&w=majority&appName=Cluster0';

let cachedConnection = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB Atlas] Connected successfully to host: ${cachedConnection.connection.host}, database: ${cachedConnection.connection.name}`);
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error('[MongoDB Atlas] Connection Error:', error.message);
    throw error;
  }
};

export default connectDB;
