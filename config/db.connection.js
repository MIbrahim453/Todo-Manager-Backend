import mongoose from "mongoose"

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log("MongoDB connected:", connectionInstance.connection.host);
        return connectionInstance.connection
    } catch (error) {
        console.log("Error occurred while connecting:", error);
        throw error
    }
}

export { connectDB }