import mongoose from "mongoose";

const connectDb = async () => {
    try {
        mongoose.set('strictQuery', false);
        
        console.log('🔄 Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URL);
        
        console.log('✅ MongoDB Connected Successfully');
        
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        
        // Exit on authentication errors
        if (error.message.includes('authentication failed')) {
            console.error('🔐 Check your MongoDB credentials');
            process.exit(1);
        }
        
        // Retry on network errors
        console.log('🔄 Retrying in 5 seconds...');
        setTimeout(connectDb, 5000);
    }
};

export default connectDb;