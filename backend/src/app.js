const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const authRouter = require("./modules/auth/routes/auth.routes");
const applicationRouter = require("./modules/applications/routes/application.routes");
const analyzerRouter = require("./modules/analyzer/routes/analyzer.routes");
const { authenticateToken } = require("./shared/middleware/auth");
const errorHandler = require("./shared/middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/applications", authenticateToken, applicationRouter);
app.use("/api/v1/analyzer", authenticateToken, analyzerRouter);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "server is working fine",
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;