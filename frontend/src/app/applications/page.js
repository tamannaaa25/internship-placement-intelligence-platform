"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../utils/api";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Modal / Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [domain, setDomain] = useState("Software Engineering");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [deadline, setDeadline] = useState("");
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split("T")[0]);

  // Round form states
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [roundName, setRoundName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = "";
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (searchFilter) params.push(`search=${encodeURIComponent(searchFilter)}`);
      if (params.length > 0) query = `?${params.join("&")}`;

      const data = await apiFetch(`/applications${query}`);
      setApplications(data.applications);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchFilter]);

  useEffect(() => {
    setTimeout(() => {
      fetchApplications();
    }, 0);
  }, [fetchApplications]);

  const fetchAppDetails = async (appId) => {
    try {
      const data = await apiFetch(`/applications/${appId}`);
      setSelectedApp(data.application);
    } catch (err) {
      setError(err.message || "Failed to load application details");
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        companyName,
        roleTitle,
        domain,
        location: location || null,
        salary: salary ? parseFloat(salary) : null,
        jobUrl: jobUrl || null,
        status,
        appliedDate: new Date(appliedDate).toISOString(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };

      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowAddModal(false);
      resetAddForm();
      fetchApplications();
    } catch (err) {
      setError(err.message || "Failed to create application");
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await apiFetch(`/applications/${appId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchApplications();
      if (selectedApp && selectedApp.id === appId) {
        fetchAppDetails(appId);
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await apiFetch(`/applications/${appId}`, {
        method: "DELETE",
      });
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      setError(err.message || "Failed to delete application");
    }
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const payload = {
        roundName,
        rating: parseInt(rating),
        notes: notes || null,
        interviewerName: interviewerName || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      };

      await apiFetch(`/applications/${selectedApp.id}/rounds`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowRoundModal(false);
      resetRoundForm();
      fetchAppDetails(selectedApp.id);
      fetchApplications(); // refresh rounds count
    } catch (err) {
      setError(err.message || "Failed to add interview round");
    }
  };

  const handleDeleteRound = async (roundId) => {
    if (!selectedApp || !window.confirm("Are you sure you want to delete this round?")) return;
    try {
      await apiFetch(`/applications/${selectedApp.id}/rounds/${roundId}`, {
        method: "DELETE",
      });
      fetchAppDetails(selectedApp.id);
      fetchApplications();
    } catch (err) {
      setError(err.message || "Failed to delete round");
    }
  };

  const resetAddForm = () => {
    setCompanyName("");
    setRoleTitle("");
    setDomain("Software Engineering");
    setLocation("");
    setSalary("");
    setJobUrl("");
    setStatus("APPLIED");
    setDeadline("");
    setAppliedDate(new Date().toISOString().split("T")[0]);
  };

  const resetRoundForm = () => {
    setRoundName("");
    setScheduledAt("");
    setInterviewerName("");
    setRating(3);
    setNotes("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "INTERVIEWING":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "OA_SCHEDULED":
      case "OA_COMPLETED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
            Application Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your interview pipeline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 active:scale-95"
        >
          ➕ Log Application
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 glass-card p-4 rounded-xl">
        <div className="flex-1">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
            placeholder="Search by company or role..."
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="OA_SCHEDULED">OA Scheduled</option>
            <option value="OA_COMPLETED">OA Completed</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Main Grid: List & Sidebar details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl text-slate-500">
              No applications logged yet. Log one to begin!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => fetchAppDetails(app.id)}
                  className={`glass-card p-5 rounded-xl border transition-all cursor-pointer glow-border ${
                    selectedApp && selectedApp.id === app.id
                      ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/5"
                      : "border-slate-800/80 hover:bg-slate-800/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-slate-200 text-lg">{app.companyName}</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-400 mb-4">{app.roleTitle}</h4>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>📅 {new Date(app.appliedDate).toLocaleDateString()}</span>
                    <span>💬 {app._count?.rounds || 0} rounds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <div className="lg:col-span-1">
          {selectedApp ? (
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-6 relative overflow-hidden">
              {/* Header details */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedApp.companyName}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">{selectedApp.roleTitle}</p>
                </div>
                <button
                  onClick={() => handleDeleteApplication(selectedApp.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-all"
                >
                  Delete
                </button>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Update Pipeline Status
                </label>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="OA_SCHEDULED">OA Scheduled</option>
                  <option value="OA_COMPLETED">OA Completed</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              {/* Parameters info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 rounded-lg">
                <div>
                  <span className="text-slate-500 block mb-1">Domain</span>
                  <span className="font-semibold text-slate-300">{selectedApp.domain}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Location</span>
                  <span className="font-semibold text-slate-300">
                    {selectedApp.location || "N/A"}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500 block mb-1">Stipend/CTC</span>
                  <span className="font-semibold text-slate-300">
                    {selectedApp.salary ? `₹${parseFloat(selectedApp.salary).toLocaleString()}` : "N/A"}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500 block mb-1">Deadline</span>
                  <span className="font-semibold text-slate-300">
                    {selectedApp.deadline ? new Date(selectedApp.deadline).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              {selectedApp.jobUrl && (
                <a
                  href={selectedApp.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-block text-center bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-300 py-2 rounded-lg font-medium transition-all"
                >
                  🔗 View Job Listing
                </a>
              )}

              {/* Interview Rounds */}
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-slate-300">Interview Rounds</h4>
                  <button
                    onClick={() => setShowRoundModal(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Add Round
                  </button>
                </div>

                {selectedApp.rounds.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No interview rounds logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedApp.rounds.map((round) => (
                      <div key={round.id} className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/50 space-y-2 relative">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-slate-200">{round.roundName}</span>
                          <button
                            onClick={() => handleDeleteRound(round.id)}
                            className="text-[10px] text-rose-500 hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </div>
                        {round.scheduledAt && (
                          <p className="text-[10px] text-slate-500">
                            📅 {new Date(round.scheduledAt).toLocaleString()}
                          </p>
                        )}
                        {round.interviewerName && (
                          <p className="text-[10px] text-slate-400">
                            Interviewer: <span className="font-medium text-slate-300">{round.interviewerName}</span>
                          </p>
                        )}
                        {round.rating && (
                          <div className="flex gap-0.5 text-amber-400 text-[10px]">
                            {"★".repeat(round.rating)}
                            {"☆".repeat(5 - round.rating)}
                          </div>
                        )}
                        {round.notes && (
                          <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/50 p-2 rounded border border-slate-800/40 mt-2 font-mono">
                            {round.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 text-center py-12 text-slate-500 italic">
              Select an application to view detailed tracking history & log rounds.
            </div>
          )}
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Log Application</h3>
            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="SWE Intern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="DevOps / Cloud">DevOps / Cloud</option>
                    <option value="Data Science / AI">Data Science / AI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Bangalore, Remote"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Salary (Stipend/CTC)
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Stipend per month"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Job Listing Link (URL)
                  </label>
                  <input
                    type="text"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="https://careers.google.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    required
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Initial Pipeline Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="OA_SCHEDULED">OA Scheduled</option>
                  <option value="OA_COMPLETED">OA Completed</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Round Modal */}
      {showRoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Log Interview Round</h3>
            <form onSubmit={handleAddRound} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Round Name / Stage
                </label>
                <input
                  type="text"
                  required
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Round 1 Coding, System Design, HR"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Alice Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Performance Rating (1-5)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1 - Poor / Needs massive improvement</option>
                  <option value={2}>2 - Okay / Some gaps</option>
                  <option value={3}>3 - Good / Met expectations</option>
                  <option value={4}>4 - Great / Strong candidate</option>
                  <option value={5}>5 - Excellent / Nailed it</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Notes / Interview Questions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 h-28 font-mono"
                  placeholder="Questions asked:
1. Reverse a Linked List.
2. Design a URL Shortener database schema."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowRoundModal(false)}
                  className="bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
                >
                  Save Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
