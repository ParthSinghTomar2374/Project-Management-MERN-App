const mongoose = require('mongoose');
const dns = require('dns');

// Fix for querySrv ENOTFOUND: Force Node.js to use Google DNS for SRV record lookups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Fallback to default system DNS if setServers fails
}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'your_mongodb_uri_here') {
      console.warn('MongoDB URI is not configured or is placeholder. Skipping DB connection attempt to prevent crash.');
      return;
    }
    const dbName = process.env.MONGODB_DB_NAME || 'test';
    const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
