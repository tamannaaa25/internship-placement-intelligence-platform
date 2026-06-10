const pdfService = require("../../../shared/utils/pdf.service");
const aiService = require("../services/ai.service");
const analyzerRepository = require("../repositories/analyzer.repository");
const s3Service = require("../../../shared/services/s3.service");

const analyzeResume = async (req, res, next) => {
  try {
    // 1. File existence validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded. Only PDF resumes under 2MB are supported.",
      });
    }

    const { jobDescription } = req.body;

    // 2. JD field validation
    if (!jobDescription || jobDescription.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Job description is required.",
      });
    }

    const userId = req.user.id;
    const originalFileName = req.file.originalname;

    // 3. Extract text from PDF buffer
    const extractedText = await pdfService.parsePdfText(req.file.buffer);

    // 4. Perform match analysis
    const analysisResult = await aiService.compareResumeAndJd(extractedText, jobDescription);

    // 5. Store resume reference
    // Upload PDF buffer to S3 (using fallback if credentials are not configured)
    const fileUrl = await s3Service.uploadToS3(req.file.buffer, originalFileName, req.file.mimetype);
    const resume = await analyzerRepository.saveResume(userId, originalFileName, fileUrl);

    // 6. Store matching analysis
    const analysis = await analyzerRepository.saveAnalysis(resume.id, jobDescription, analysisResult);

    return res.status(200).json({
      success: true,
      message: "Resume analysis completed successfully",
      analysis: {
        id: analysis.id,
        matchScore: analysis.matchScore,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        roadmapSteps: analysis.roadmapSteps,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
};
