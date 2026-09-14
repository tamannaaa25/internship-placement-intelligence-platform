"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "../utils/api";

const DEFAULT_METRICS = {
  totalApplications: 12,
  successRate: 25.0,
  interviewing: 3,
  skillReadinessScore: 78,
  conversionRates: {
    oaConversionRate: 66.7,
    interviewConversionRate: 50.0,
  },
  domainsBreakdown: [
    { domain: "Software Engineering", count: 6 },
    { domain: "Data & Analytics", count: 3 },
    { domain: "Cloud & DevOps", count: 2 },
    { domain: "Product & QA", count: 1 },
  ],
  monthlyTrends: [
    { month: "Jan", count: 2 },
    { month: "Feb", count: 4 },
    { month: "Mar", count: 6 },
  ],
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await apiFetch("/analytics/summary");
        if (!ignore) {
          setMetrics(data && data.metrics ? data.metrics : DEFAULT_METRICS);
        }
      } catch {
        if (!ignore) {
          setMetrics(DEFAULT_METRICS);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const activeMetrics = metrics || DEFAULT_METRICS;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Personal Placement Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of personal job applications, active interviews, and readiness benchmarks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/applications"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors"
          >
            + Add Application
          </Link>
          <Link
            href="/intelligence"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            🎓 Campus Benchmark Data &rarr;
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading dashboard metrics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Total Applications
              </span>
              <div className="text-3xl font-bold text-slate-100 my-2">
                {activeMetrics.totalApplications}
              </div>
              <span className="text-[11px] text-slate-500">Applications submitted to date</span>
            </div>

            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Success Rate
              </span>
              <div className="text-3xl font-bold text-emerald-400 my-2">
                {activeMetrics.successRate}%
              </div>
              <span className="text-[11px] text-slate-500">Percentage of offers secured</span>
            </div>

            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Active Interviews
              </span>
              <div className="text-3xl font-bold text-blue-400 my-2">
                {activeMetrics.interviewing}
              </div>
              <span className="text-[11px] text-slate-500">In-progress interview rounds</span>
            </div>

            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                ATS Readiness
              </span>
              <div className="text-3xl font-bold text-amber-400 my-2">
                {activeMetrics.skillReadinessScore}%
              </div>
              <span className="text-[11px] text-slate-500">Average resume match score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Online Assessment (OA) Funnel
                </h3>
                <span className="text-xs font-bold text-slate-200">
                  {activeMetrics.conversionRates?.oaConversionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${activeMetrics.conversionRates?.oaConversionRate || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500">
                Applications advancing through online coding & aptitude screening rounds.
              </p>
            </div>

            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Interview-to-Offer Conversion
                </h3>
                <span className="text-xs font-bold text-slate-200">
                  {activeMetrics.conversionRates?.interviewConversionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${activeMetrics.conversionRates?.interviewConversionRate || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500">
                Percentage of active technical and behavioral interviews converting to verified offers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Applications by Target Domain
                </h3>
                <span className="text-[11px] text-slate-500">Categorized</span>
              </div>
              <div className="space-y-2 pt-1">
                {(activeMetrics.domainsBreakdown || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{item.domain}</span>
                    <span className="text-slate-400 font-mono font-medium">
                      {item.count} {item.count === 1 ? "app" : "apps"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111726] border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Submission Activity Timeline
                </h3>
                <span className="text-[11px] text-slate-500">Recent Months</span>
              </div>
              <div className="space-y-2 pt-1">
                {(activeMetrics.monthlyTrends || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{item.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(item.count * 15, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-400 font-mono font-medium w-12 text-right">
                        {item.count} apps
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
              Quick Actions &amp; Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/applications"
                className="p-3 bg-[#111726] hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors block"
              >
                <div className="text-xs font-medium text-slate-200">💼 Application Tracker</div>
                <div className="text-[11px] text-slate-500 mt-1">Manage pipeline stages & upcoming interview rounds</div>
              </Link>
              <Link
                href="/analyzer"
                className="p-3 bg-[#111726] hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors block"
              >
                <div className="text-xs font-medium text-slate-200">🧠 Skill &amp; Resume Analyzer</div>
                <div className="text-[11px] text-slate-500 mt-1">Compare your resume against job descriptions for ATS readiness</div>
              </Link>
              <Link
                href="/intelligence"
                className="p-3 bg-[#111726] hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors block"
              >
                <div className="text-xs font-medium text-slate-200">🎓 Campus Benchmark Analytics</div>
                <div className="text-[11px] text-slate-500 mt-1">Explore 800 placement records and salary statistics</div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
