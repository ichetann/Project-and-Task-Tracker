// // config/db.js

// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB Connected');
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error.message);
//     process.exit(1);  // Exit if DB fails
//   }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');
// require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Force IPv4 to prevent DNS SRV resolution errors
      family: 4, 
      // Higher timeout to catch network lag
      serverSelectionTimeoutMS: 5000 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Stop the server if the DB fails
  }
};

module.exports = connectDB;
