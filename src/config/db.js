import mongoose from "mongoose";
import { MONGO_URI} from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("🚀  MongoDB Connection Successfully");
  } catch (err) {
    console.error("☠️ Error connecting to MongoDB:", err);
  }
};

export default connectDB;
