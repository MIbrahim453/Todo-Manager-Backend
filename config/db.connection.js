import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
        throw new Error("MONGODB_URI and DB_NAME must be configured");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
            .then((connectionInstance) => {
                console.log("MongoDB connected:", connectionInstance.connection.host);
                return connectionInstance.connection;
            })
            .catch((error) => {
                connectionPromise = undefined;
                throw error;
            });
    }

    return connectionPromise;
};

export { connectDB };