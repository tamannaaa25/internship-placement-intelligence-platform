const Resume = require("../../../shared/models/Resume");

const saveResume = async (userId, fileName, fileUrl) => {
  const resume = await Resume.create({
    student: userId,
    fileName,
    fileUrl,
    analyses: [],
  });
  return resume;
};

const saveAnalysis = async (resumeId, jobDescriptionText, analysisResult) => {
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new Error("Resume record not found");
  }

  const analysis = {
    jobDescriptionText,
    matchScore: analysisResult.matchScore,
    matchedSkills: analysisResult.matchedSkills || [],
    missingSkills: analysisResult.missingSkills || [],
    roadmapSteps: analysisResult.roadmapSteps || [],
    createdAt: new Date(),
  };

  resume.analyses.push(analysis);
  await resume.save();

  const savedAnalysis = resume.analyses[resume.analyses.length - 1];
  return {
    id: savedAnalysis._id.toString(),
    resumeId: resume._id.toString(),
    ...analysis,
  };
};

module.exports = {
  saveResume,
  saveAnalysis,
};
