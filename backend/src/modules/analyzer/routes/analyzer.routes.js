const express = require("express");
const multer = require("multer");
const analyzerController = require("../controllers/analyzer.controller");

const router = express.Router();

// Configure multer MemoryStorage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB size limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDFs
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

router.post("/analyze", upload.single("resume"), analyzerController.analyzeResume);

module.exports = router;
