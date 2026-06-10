const prisma = require("../../../shared/utils/prisma");

const getApplicationStatusCounts = async (userId) => {
  return prisma.application.groupBy({
    by: ["status"],
    where: { userId },
    _count: {
      _all: true,
    },
  });
};

const getApplicationDomainCounts = async (userId) => {
  return prisma.application.groupBy({
    by: ["domain"],
    where: { userId },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        domain: "desc",
      },
    },
  });
};

const getApplicationDates = async (userId) => {
  return prisma.application.findMany({
    where: { userId },
    select: {
      appliedDate: true,
      status: true,
    },
    orderBy: {
      appliedDate: "asc",
    },
  });
};

const getAverageMatchScore = async (userId) => {
  const result = await prisma.skillAnalysis.aggregate({
    _avg: {
      matchScore: true,
    },
    where: {
      resume: {
        userId,
      },
    },
  });
  return result._avg.matchScore;
};

module.exports = {
  getApplicationStatusCounts,
  getApplicationDomainCounts,
  getApplicationDates,
  getAverageMatchScore,
};
