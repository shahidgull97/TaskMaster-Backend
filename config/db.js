import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("db is connecting...");
    const res = await mongoose.connect(process.env.mongoURI, {
      maxPoolSize: 10,
    });
    console.log(`mongodb connected with server ${res.connection.host}`);
  } catch (error) {
    console.log("mongodb connection failed!");
    console.log(error);
  }
};
