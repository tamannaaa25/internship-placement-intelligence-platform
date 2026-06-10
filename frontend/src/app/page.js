"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../utils/api";

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/analytics/summary");
      setMetrics(data.metrics);
    } catch (err) {
      setError(err.message || "Failed to load dashboard summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchDashboardSummary();
    }, 0);
  }, [fetchDashboardSummary]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-slate-400";
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading dashboard analytics...</div>;
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent">
          Placement Intelligence Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">Real-time statistics and career readiness metrics</p>
      </div>

      {/* Grid: 4 Core stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Apps */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 relative overflow-hidden flex flex-col justify-between h-32 glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Applications
          </span>
          <div className="text-4xl font-extrabold text-slate-100 font-mono mt-2">
            {metrics.totalApplications}
          </div>
          <span className="text-[10px] text-slate-500">Applications submitted to date</span>
        </div>

        {/* Success Rate */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 relative overflow-hidden flex flex-col justify-between h-32 glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Success Rate
          </span>
          <div className="text-4xl font-extrabold text-emerald-400 font-mono mt-2">
            {metrics.successRate}%
          </div>
          <span className="text-[10px] text-slate-500">Percentage of offers secured</span>
        </div>

        {/* Active Interviews */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 relative overflow-hidden flex flex-col justify-between h-32 glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Interviews
          </span>
          <div className="text-4xl font-extrabold text-violet-400 font-mono mt-2">
            {metrics.interviewing}
          </div>
          <span className="text-[10px] text-slate-500">In-progress interview cycles</span>
        </div>

        {/* Skill Score */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 relative overflow-hidden flex flex-col justify-between h-32 glow-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Skill Readiness (ATS)
          </span>
          <div className={`text-4xl font-extrabold font-mono mt-2 ${getScoreColor(metrics.skillReadinessScore)}`}>
            {metrics.skillReadinessScore}%
          </div>
          <span className="text-[10px] text-slate-500">Average resume match score</span>
        </div>
      </div>

      {/* Conversion rates & Funnels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OA Funnel */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Online Assessment (OA) Funnel
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>OA Scheduled to Completed</span>
            <span className="font-bold text-slate-200">{metrics.conversionRates.oaConversionRate}%</span>
          </div>
          <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
              style={{ width: `${metrics.conversionRates.oaConversionRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Measures the percentage of applications progressing successfully through the online screening assessments.
          </p>
        </div>

        {/* Interview Funnel */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Interview-to-Offer Funnel
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interviews Attended to Offers Secured</span>
            <span className="font-bold text-slate-200">{metrics.conversionRates.interviewConversionRate}%</span>
          </div>
          <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
              style={{ width: `${metrics.conversionRates.interviewConversionRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Measures the conversion rates of active interviews converting into verified final offers.
          </p>
        </div>
      </div>

      {/* Breakdowns list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Breakdown */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Breakdown by Domain
          </h3>
          {metrics.domainsBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No domain statistics available.</p>
          ) : (
            <div className="space-y-3">
              {metrics.domainsBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-xs font-semibold text-slate-300">{item.domain}</span>
                  <span className="text-xs font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                    {item.count} {item.count === 1 ? "app" : "apps"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Monthly Application Trends
          </h3>
          {metrics.monthlyTrends.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No trend timeline data available.</p>
          ) : (
            <div className="space-y-3">
              {metrics.monthlyTrends.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  <span className="text-xs font-semibold text-slate-300">{item.month}</span>
                  <div className="flex items-center gap-3">
                    {/* Tiny simple bar indicator */}
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(item.count * 10, 100)}%` }}></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                      {item.count} {item.count === 1 ? "app" : "apps"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
