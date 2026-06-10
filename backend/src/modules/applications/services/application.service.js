const applicationRepository = require("../repositories/application.repository");

const getApplications = async (userId, filters) => {
  return applicationRepository.findAllByUserId(userId, filters);
};

const getApplicationDetails = async (userId, id) => {
  const application = await applicationRepository.findById(id);

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorize: check if user owns this application record
  if (application.userId !== userId) {
    const error = new Error("Access denied: you do not own this resource");
    error.statusCode = 403;
    throw error;
  }

  return application;
};

const createApplication = async (userId, data) => {
  // Business logic: applied date cannot be in the future relative to deadline
  if (data.deadline && data.appliedDate && new Date(data.appliedDate) > new Date(data.deadline)) {
    const error = new Error("Application deadline cannot be in the past relative to the applied date");
    error.statusCode = 400;
    throw error;
  }

  return applicationRepository.create(userId, data);
};

const updateApplication = async (userId, id, data) => {
  // Authorize user
  await getApplicationDetails(userId, id);

  // Business logic checks
  if (data.deadline || data.appliedDate) {
    const existing = await applicationRepository.findById(id);
    const checkApplied = data.appliedDate || existing.appliedDate;
    const checkDeadline = data.deadline !== undefined ? data.deadline : existing.deadline;

    if (checkDeadline && checkApplied && new Date(checkApplied) > new Date(checkDeadline)) {
      const error = new Error("Application deadline cannot be in the past relative to the applied date");
      error.statusCode = 400;
      throw error;
    }
  }

  return applicationRepository.update(id, data);
};

const deleteApplication = async (userId, id) => {
  // Authorize user
  await getApplicationDetails(userId, id);
  return applicationRepository.deleteById(id);
};

// Interview Round service orchestration
const addInterviewRound = async (userId, id, roundData) => {
  // Authorize application owner
  await getApplicationDetails(userId, id);
  return applicationRepository.createRound(id, roundData);
};

const updateInterviewRound = async (userId, id, roundId, roundData) => {
  // Authorize application owner
  await getApplicationDetails(userId, id);

  // Verify round belongs to this application
  const round = await applicationRepository.findRoundById(roundId);
  if (!round || round.applicationId !== id) {
    const error = new Error("Interview round not found for this application");
    error.statusCode = 404;
    throw error;
  }

  return applicationRepository.updateRound(roundId, roundData);
};

const removeInterviewRound = async (userId, id, roundId) => {
  // Authorize application owner
  await getApplicationDetails(userId, id);

  // Verify round belongs to this application
  const round = await applicationRepository.findRoundById(roundId);
  if (!round || round.applicationId !== id) {
    const error = new Error("Interview round not found for this application");
    error.statusCode = 404;
    throw error;
  }

  return applicationRepository.deleteRound(roundId);
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
