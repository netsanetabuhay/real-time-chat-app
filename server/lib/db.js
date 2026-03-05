// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    mongoose.connection.on('conected',()=>console.log('MongoDB Connected Successfully'));


    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    
    await mongoose.connect(MONGO_URI);
    
    console.log('Database host:', mongoose.connection.host);
    console.log('Database name:', mongoose.connection.name);

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};

export default connectDB;