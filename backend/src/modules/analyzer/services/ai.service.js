const { GoogleGenerativeAI } = require("@google/generative-ai");

const compareResumeAndJd = async (resumeText, jdText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment. Using mock AI analyzer.");
    return generateMockAnalysis(resumeText, jdText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) optimizer.
Compare the following candidate resume text with the job description (JD) text.

Analyze the resume against the job description and extract:
1. "matchScore": An integer between 0 and 100 indicating how well the candidate's skills match the job description.
2. "matchedSkills": A string array of professional skills present in both the resume and the job description.
3. "missingSkills": A string array of core professional skills requested in the job description but missing or weak in the resume.
4. "roadmapSteps": An array of objects detailing learning roadmaps for each missing skill. Each object must have:
   - "skill": The name of the missing skill.
   - "topics": An array of topics to study.
   - "resources": An array of learning resources (e.g. documentation, tutorials, courses).

Resume Text:
"""
${resumeText}
"""

Job Description Text:
"""
${jdText}
"""

Return ONLY a valid JSON object matching this schema:
{
  "matchScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "roadmapSteps": [
    {
      "skill": string,
      "topics": string[],
      "resources": string[]
    }
  ]
}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback to mock on error to maintain availability
    return generateMockAnalysis(resumeText, jdText);
  }
};

const generateMockAnalysis = (resumeText, jdText) => {
  const skillsList = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS",
    "Git",
    "CI/CD",
    "Python",
    "Java",
    "C++",
    "System Design",
    "SQL",
  ];

  const resumeLower = resumeText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  const matchedSkills = [];
  const missingSkills = [];

  skillsList.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    const requestedInJd = jdLower.includes(skillLower);
    const presentInResume = resumeLower.includes(skillLower);

    if (requestedInJd) {
      if (presentInResume) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }
  });

  // Default fallback if no skills detected in JD
  if (matchedSkills.length === 0 && missingSkills.length === 0) {
    matchedSkills.push("Git", "JavaScript");
    missingSkills.push("Docker", "PostgreSQL");
  }

  const matchRatio = matchedSkills.length / (matchedSkills.length + missingSkills.length || 1);
  const matchScore = Math.round(matchRatio * 100);

  const mockResources = {
    Docker: ["Docker Official Docs", "Docker Crash Course by Traversy Media"],
    PostgreSQL: ["PostgreSQL Tutorial", "SQL Zoo Practice"],
    AWS: ["AWS Certified Cloud Practitioner Guide", "freeCodeCamp AWS Course"],
    "System Design": ["Grokking the System Design Interview", "System Design Primer by Donne Martin"],
    "CI/CD": ["GitHub Actions Tutorial", "DevOps Roadmap Guide"],
  };

  const roadmapSteps = missingSkills.map((skill) => {
    const resources = mockResources[skill] || [
      `Official ${skill} Documentation`,
      `${skill} Crash Course`,
    ];
    return {
      skill,
      topics: [`Introduction to ${skill}`, `${skill} best practices`, `Advanced ${skill} architectures`],
      resources,
    };
  });

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    roadmapSteps,
  };
};

module.exports = {
  compareResumeAndJd,
};
