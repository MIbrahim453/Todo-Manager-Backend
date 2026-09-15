import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    if (process.env.DB_NAME) {
      opts.dbName = process.env.DB_NAME;
    }

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((instance) => {
        console.log("MongoDB connected:", instance.connection.host);
        return instance.connection;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export { connectDB };