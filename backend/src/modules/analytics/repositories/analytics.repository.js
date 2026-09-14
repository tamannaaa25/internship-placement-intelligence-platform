const mongoose = require("mongoose");
const Application = require("../../../shared/models/Application");
const Resume = require("../../../shared/models/Resume");

const toObjectId = (userId) => {
  if (!userId) return null;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    return new mongoose.Types.ObjectId(userId);
  }
  return null;
};

const getApplicationStatusCounts = async (userId) => {
  const userObjectId = toObjectId(userId);
  if (!userObjectId) return [];

  const results = await Application.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return results.map((r) => ({
    status: r._id,
    _count: { _all: r.count },
  }));
};

const getApplicationDomainCounts = async (userId) => {
  const userObjectId = toObjectId(userId);
  if (!userObjectId) return [];

  const results = await Application.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: "$domain", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return results.map((r) => ({
    domain: r._id,
    _count: { _all: r.count },
  }));
};

const getApplicationDates = async (userId) => {
  const userObjectId = toObjectId(userId);
  if (!userObjectId) return [];

  return Application.find({ userId: userObjectId })
    .select("appliedDate status")
    .sort({ appliedDate: 1 });
};

const getAverageMatchScore = async (userId) => {
  const userObjectId = toObjectId(userId);
  if (!userObjectId) return 0;

  const results = await Resume.aggregate([
    { $match: { student: userObjectId } },
    { $unwind: "$analyses" },
    { $group: { _id: null, avgScore: { $avg: "$analyses.matchScore" } } },
  ]);

  return results.length > 0 ? results[0].avgScore : 0;
};

module.exports = {
  getApplicationStatusCounts,
  getApplicationDomainCounts,
  getApplicationDates,
  getAverageMatchScore,
};
