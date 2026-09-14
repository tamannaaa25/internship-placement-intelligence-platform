const mysql = require("mysql2/promise");

let pool = null;

const getMySQLPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "placement_analytics",
      port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

const query = async (sql, params = []) => {
  const currentPool = getMySQLPool();
  const [results] = await currentPool.query(sql, params);
  return results;
};

module.exports = {
  getMySQLPool,
  query,
};
