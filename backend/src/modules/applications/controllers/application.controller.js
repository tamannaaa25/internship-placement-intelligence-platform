const applicationService = require("../services/application.service");
const {
  createApplicationSchema,
  updateApplicationSchema,
  createRoundSchema,
  updateRoundSchema,
} = require("../validators/application.validator");

const getApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };

    const applications = await applicationService.getApplications(userId, filters);

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const application = await applicationService.getApplicationDetails(userId, id);

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = createApplicationSchema.parse(req.body);

    const application = await applicationService.createApplication(userId, validatedData);

    return res.status(201).json({
      success: true,
      message: "Application logged successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const validatedData = updateApplicationSchema.parse(req.body);

    const application = await applicationService.updateApplication(userId, id, validatedData);

    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await applicationService.deleteApplication(userId, id);

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Interview Rounds endpoints
const addInterviewRound = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const validatedData = createRoundSchema.parse(req.body);

    const round = await applicationService.addInterviewRound(userId, id, validatedData);

    return res.status(201).json({
      success: true,
      message: "Interview round logged successfully",
      round,
    });
  } catch (error) {
    next(error);
  }
};

const updateInterviewRound = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, roundId } = req.params;
    const validatedData = updateRoundSchema.parse(req.body);

    const round = await applicationService.updateInterviewRound(userId, id, roundId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Interview round updated successfully",
      round,
    });
  } catch (error) {
    next(error);
  }
};

const removeInterviewRound = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, roundId } = req.params;

    await applicationService.removeInterviewRound(userId, id, roundId);

    return res.status(200).json({
      success: true,
      message: "Interview round deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationDetails,
  createApplication,
  updateApplication,
  deleteApplication,
  addInterviewRound,
  updateInterviewRound,
  removeInterviewRound,
};
