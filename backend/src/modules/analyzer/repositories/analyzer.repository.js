const prisma = require("../../../shared/utils/prisma");

const saveResume = async (userId, fileName, fileUrl) => {
  return prisma.resume.create({
    data: {
      userId,
      fileName,
      fileUrl,
    },
  });
};

const saveAnalysis = async (resumeId, jobDescriptionText, analysisResult) => {
  return prisma.skillAnalysis.create({
    data: {
      resumeId,
      jobDescriptionText,
      matchScore: analysisResult.matchScore,
      matchedSkills: analysisResult.matchedSkills,
      missingSkills: analysisResult.missingSkills,
      roadmapSteps: analysisResult.roadmapSteps,
    },
  });
};

module.exports = {
  saveResume,
  saveAnalysis,
};
