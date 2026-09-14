const Application = require("../../../shared/models/Application");

const findAllByUserId = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.$or = [
      { companyName: { $regex: filters.search, $options: "i" } },
      { roleTitle: { $regex: filters.search, $options: "i" } },
    ];
  }

  return Application.find(where).sort({ appliedDate: -1 });
};

const findById = async (id) => {
  return Application.findById(id);
};

const create = async (userId, data) => {
  return Application.create({
    userId,
    companyName: data.companyName,
    roleTitle: data.roleTitle,
    jobUrl: data.jobUrl || null,
    salary: data.salary || null,
    location: data.location || null,
    domain: data.domain,
    status: data.status || "APPLIED",
    appliedDate: data.appliedDate || new Date(),
    deadline: data.deadline || null,
    rounds: [],
  });
};

const update = async (id, data) => {
  return Application.findByIdAndUpdate(id, { $set: data }, { new: true });
};

const deleteById = async (id) => {
  return Application.findByIdAndDelete(id);
};

const createRound = async (applicationId, data) => {
  const app = await Application.findById(applicationId);
  if (!app) return null;

  app.rounds.push({
    roundName: data.roundName,
    scheduledAt: data.scheduledAt || null,
    interviewerName: data.interviewerName || null,
    rating: data.rating || null,
    notes: data.notes || null,
  });

  await app.save();
  const createdRound = app.rounds[app.rounds.length - 1];
  const roundObj = createdRound.toJSON ? createdRound.toJSON() : createdRound;
  roundObj.applicationId = app._id.toString();
  return roundObj;
};

const findRoundById = async (roundId) => {
  const app = await Application.findOne({ "rounds._id": roundId });
  if (!app) return null;

  const round = app.rounds.id(roundId);
  if (!round) return null;

  const roundObj = round.toJSON ? round.toJSON() : round;
  roundObj.applicationId = app._id.toString();
  return roundObj;
};

const updateRound = async (roundId, data) => {
  const app = await Application.findOne({ "rounds._id": roundId });
  if (!app) return null;

  const round = app.rounds.id(roundId);
  if (!round) return null;

  if (data.roundName !== undefined) round.roundName = data.roundName;
  if (data.scheduledAt !== undefined) round.scheduledAt = data.scheduledAt;
  if (data.interviewerName !== undefined) round.interviewerName = data.interviewerName;
  if (data.rating !== undefined) round.rating = data.rating;
  if (data.notes !== undefined) round.notes = data.notes;

  await app.save();
  const roundObj = round.toJSON ? round.toJSON() : round;
  roundObj.applicationId = app._id.toString();
  return roundObj;
};

const deleteRound = async (roundId) => {
  const app = await Application.findOne({ "rounds._id": roundId });
  if (!app) return null;

  app.rounds.pull({ _id: roundId });
  await app.save();
  return { id: roundId };
};

module.exports = {
  findAllByUserId,
  findById,
  create,
  update,
  deleteById,
  createRound,
  findRoundById,
  updateRound,
  deleteRound,
};
