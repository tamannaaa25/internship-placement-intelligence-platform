require("dotenv").config();

const app = require("./app");
const { connectMongoDB } = require("./shared/utils/mongodb");
const mysql = require("./shared/utils/mysql");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Initialize MongoDB connection
    await connectMongoDB();

    // 2. Test MySQL connection (optional / non-blocking warning)
    try {
      await mysql.query("SELECT 1");
      console.log(`[MySQL] Connected successfully to analytics database: ${process.env.MYSQL_DATABASE || "placement_analytics"}`);
    } catch (mysqlErr) {
      console.warn(`[MySQL] Notice: Analytics DB not yet initialized or reachable: ${mysqlErr.message}`);
    }

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      console.log(`[Express] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();