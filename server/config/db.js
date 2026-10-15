import mongoose from 'mongoose';
import dns from 'dns';

// Override DNS servers to Google & Cloudflare DNS to guarantee SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server override warning:', e.message);
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TechnoTalentFeast:technotalentfeast@cluster0.hd3ty4r.mongodb.net/techno_talent_feast?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB Atlas] Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
