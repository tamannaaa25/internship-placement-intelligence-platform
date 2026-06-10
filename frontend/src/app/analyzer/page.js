"use client";
import { useState } from "react";
import { apiFetch } from "../../utils/api";

export default function AnalyzerPage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        setFile(null);
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB limit.");
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume PDF to upload.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setError("");
    setLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const data = await apiFetch("/analyzer/analyze", {
        method: "POST",
        body: formData,
      });

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 border-amber-500/20";
    return "text-rose-400 border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
          Resume ↔ JD Skill Gap Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-1">Compare your resume against a job description using AI</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Analyzer Inputs Form */}
      {!analysis && !loading && (
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Resume File Upload */}
          <div className="glass-card p-6 rounded-xl border border-slate-800/80 flex flex-col space-y-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Upload Resume (PDF only, max 2MB)
            </label>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 text-center cursor-pointer transition-all relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-indigo-400">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Drag & Drop your resume or <span className="text-indigo-400">Browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF format is required</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Job Description text */}
          <div className="glass-card p-6 rounded-xl border border-slate-800/80 flex flex-col space-y-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Job Description (JD)
            </label>
            <textarea
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="flex-1 w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-48 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium px-8 py-3 rounded-lg text-sm transition-all focus:outline-none hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              🚀 Run Gap Analysis
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-12 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-sm text-slate-300 font-medium animate-pulse">
            AI is analyzing matching scores and extracting roadmap guides...
          </p>
          <p className="text-xs text-slate-500">This may take a few seconds.</p>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900/10 p-4 rounded-lg">
            <span className="text-sm text-slate-400">Analysis completed</span>
            <button
              onClick={() => {
                setAnalysis(null);
                setFile(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              ← Analyze another resume
            </button>
          </div>

          {/* Results Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scorecard */}
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ATS Match Score
              </span>
              <div className={`text-6xl font-extrabold font-mono ${getScoreColor(analysis.matchScore)}`}>
                {analysis.matchScore}%
              </div>
              <span className="text-xs text-slate-400">
                {analysis.matchScore >= 80
                  ? "Strong match! Highly suitable for this role."
                  : analysis.matchScore >= 50
                  ? "Moderate match. Focus on acquiring missing skills."
                  : "Weak match. Consider rewriting or skill building."}
              </span>
            </div>

            {/* Matched Skills */}
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Matched Skills ({analysis.matchedSkills.length})
              </span>
              {analysis.matchedSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No matching skills found.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Gaps */}
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Missing Skills / Gaps ({analysis.missingSkills.length})
              </span>
              {analysis.missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-400 font-medium">No skill gaps detected! Excellent!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      ✗ {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Learning Roadmap timeline */}
          {analysis.roadmapSteps && analysis.roadmapSteps.length > 0 && (
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-6">
              <h3 className="text-lg font-bold text-slate-200">Personalized Learning Roadmap</h3>
              <div className="relative border-l border-slate-800 ml-4 space-y-6">
                {analysis.roadmapSteps.map((step, idx) => (
                  <div key={idx} className="relative pl-6">
                    {/* timeline bullet */}
                    <span className="absolute -left-[9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-indigo-500"></span>
                    
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      Learn {step.skill}
                    </h4>

                    {/* Topics */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Core Topics to Study
                      </span>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {step.topics.map((topic, tidx) => (
                          <li key={tidx} className="text-xs text-slate-400">
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Recommended Resources
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {step.resources.map((resource, ridx) => (
                          <span
                            key={ridx}
                            className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded font-mono"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
