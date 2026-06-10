const express = require("express");
const applicationController = require("../controllers/application.controller");

const router = express.Router();

// Application routes
router.get("/", applicationController.getApplications);
router.post("/", applicationController.createApplication);
router.get("/:id", applicationController.getApplicationDetails);
router.put("/:id", applicationController.updateApplication);
router.delete("/:id", applicationController.deleteApplication);

// Interview Round sub-routes
router.post("/:id/rounds", applicationController.addInterviewRound);
router.put("/:id/rounds/:roundId", applicationController.updateInterviewRound);
router.delete("/:id/rounds/:roundId", applicationController.removeInterviewRound);

module.exports = router;
