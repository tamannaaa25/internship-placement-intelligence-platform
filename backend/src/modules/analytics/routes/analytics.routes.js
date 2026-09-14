const express = require("express");
const analyticsController = require("../controllers/analytics.controller");
const { authenticateToken } = require("../../../shared/middleware/auth");

const router = express.Router();

router.get("/summary", authenticateToken, analyticsController.getSummary);
router.get("/intelligence", analyticsController.getIntelligence);

module.exports = router;


