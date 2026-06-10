const express = require("express");
const analyticsController = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/summary", analyticsController.getSummary);

module.exports = router;
