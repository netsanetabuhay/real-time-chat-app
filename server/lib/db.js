// lib/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
        console.log('Connecting to MongoDB...');
        const MONGO_URI = process.env.MONGO_URI;
         await mongoose.connect(MONGO_URI);


    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }    
    console.log('✅ MongoDB Connected Successfully');
    console.log('Database host:', mongoose.connection.host);
    console.log('Database name:', mongoose.connection.name);


    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};

export default connectDB;

