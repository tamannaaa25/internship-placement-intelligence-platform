const prisma = require("../../../shared/utils/prisma");

const findAllByUserId = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { companyName: { contains: filters.search, mode: "insensitive" } },
      { roleTitle: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.application.findMany({
    where,
    orderBy: {
      appliedDate: "desc",
    },
    include: {
      _count: {
        select: { rounds: true },
      },
    },
  });
};

const findById = async (id) => {
  return prisma.application.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

const create = async (userId, data) => {
  return prisma.application.create({
    data: {
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
    },
  });
};

const update = async (id, data) => {
  return prisma.application.update({
    where: { id },
    data,
  });
};

const deleteById = async (id) => {
  return prisma.application.delete({
    where: { id },
  });
};

// Interview Round CRUD inside the same repository (coupled to applications)
const createRound = async (applicationId, data) => {
  return prisma.interviewRound.create({
    data: {
      applicationId,
      roundName: data.roundName,
      scheduledAt: data.scheduledAt || null,
      interviewerName: data.interviewerName || null,
      rating: data.rating || null,
      notes: data.notes || null,
    },
  });
};

const findRoundById = async (roundId) => {
  return prisma.interviewRound.findUnique({
    where: { id: roundId },
  });
};

const updateRound = async (roundId, data) => {
  return prisma.interviewRound.update({
    where: { id: roundId },
    data,
  });
};

const deleteRound = async (roundId) => {
  return prisma.interviewRound.delete({
    where: { id: roundId },
  });
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
