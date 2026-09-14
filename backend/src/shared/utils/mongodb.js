const mongoose = require("mongoose");

const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/internship_platform";
  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to operational database: ${uri}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error.message);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Connection lost. Attempting reconnect...");
});

module.exports = {
  connectMongoDB,
  mongoose,
};
