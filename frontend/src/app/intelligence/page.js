"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import rawData from "@/data/placementData.json";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

ChartJS.defaults.color = "#94a3b8";
ChartJS.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
ChartJS.defaults.font.size = 12;

export default function PlacementIntelligencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const chartDeptRef = useRef(null);
  const chartSalaryDeptRef = useRef(null);
  const chartYearRef = useRef(null);
  const chartInstances = useRef({});

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rawData.filter((item) => {
      if (selectedDept !== "ALL" && item.Department !== selectedDept) return false;
      if (selectedYear !== "ALL" && item.Graduation_Year?.toString() !== selectedYear) return false;
      if (selectedStatus !== "ALL" && item.Placement_Status !== selectedStatus) return false;

      if (q) {
        const idMatch = (item.Student_ID || "").toLowerCase().includes(q);
        const compMatch = (item.Company || "").toLowerCase().includes(q);
        const roleMatch = (item.Job_Role || "").toLowerCase().includes(q);
        const deptMatch = (item.Department || "").toLowerCase().includes(q);
        const locMatch = (item.Location || "").toLowerCase().includes(q);
        if (!idMatch && !compMatch && !roleMatch && !deptMatch && !locMatch) return false;
      }
      return true;
    });
  }, [searchQuery, selectedDept, selectedYear, selectedStatus]);

  const [prevFilterKey, setPrevFilterKey] = useState("");
  const currentFilterKey = `${searchQuery}_${selectedDept}_${selectedYear}_${selectedStatus}`;
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  const placedData = useMemo(() => {
    return filteredData.filter((item) => item.Placement_Status === "Placed");
  }, [filteredData]);

  const kpis = useMemo(() => {
    const total = filteredData.length;
    const placedCount = placedData.length;
    const rate = total > 0 ? ((placedCount / total) * 100).toFixed(1) : "0.0";

    const salaries = placedData
      .map((item) => parseFloat(item.Salary_LPA))
      .filter((val) => !isNaN(val) && val > 0);

    const avgSalary =
      salaries.length > 0 ? (salaries.reduce((a, b) => a + b, 0) / salaries.length).toFixed(2) : "0.00";
    const maxSalary = salaries.length > 0 ? Math.max(...salaries).toFixed(2) : "0.00";

    return { total, placedCount, rate, avgSalary, maxSalary };
  }, [filteredData, placedData]);

  useEffect(() => {
    const depts = [
      "Computer Science & Engineering",
      "Information Technology",
      "Electronics & Communication",
      "Mechanical Engineering",
      "Civil Engineering",
    ];
    const shortNames = ["CSE", "IT", "ECE", "Mechanical", "Civil"];

    // 1. Placement Rate by Department
    if (chartDeptRef.current) {
      if (chartInstances.current.dept) chartInstances.current.dept.destroy();
      const rates = depts.map((d) => {
        const cohort = filteredData.filter((s) => s.Department === d);
        if (cohort.length === 0) return 0;
        const pl = cohort.filter((s) => s.Placement_Status === "Placed").length;
        return parseFloat(((pl / cohort.length) * 100).toFixed(1));
      });

      chartInstances.current.dept = new ChartJS(chartDeptRef.current, {
        type: "bar",
        data: {
          labels: shortNames,
          datasets: [
            {
              label: "Placement %",
              data: rates,
              backgroundColor: "#3b82f6",
              borderRadius: 4,
              barThickness: 28,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: "#1e293b" },
              ticks: { callback: (v) => v + "%" },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // 2. Average Salary by Department
    if (chartSalaryDeptRef.current) {
      if (chartInstances.current.salaryDept) chartInstances.current.salaryDept.destroy();
      const avgSalaries = depts.map((d) => {
        const placedCohort = placedData.filter((s) => s.Department === d);
        if (placedCohort.length === 0) return 0;
        const sals = placedCohort.map((s) => parseFloat(s.Salary_LPA)).filter((v) => !isNaN(v) && v > 0);
        return sals.length > 0 ? parseFloat((sals.reduce((a, b) => a + b, 0) / sals.length).toFixed(2)) : 0;
      });

      chartInstances.current.salaryDept = new ChartJS(chartSalaryDeptRef.current, {
        type: "bar",
        data: {
          labels: shortNames,
          datasets: [
            {
              label: "Avg CTC (LPA)",
              data: avgSalaries,
              backgroundColor: "#10b981",
              borderRadius: 4,
              barThickness: 28,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#1e293b" },
              ticks: { callback: (v) => v + " LPA" },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // 3. Placement Trend by Year
    if (chartYearRef.current) {
      if (chartInstances.current.year) chartInstances.current.year.destroy();
      const years = ["2023", "2024", "2025", "2026"];
      const rates = years.map((y) => {
        const cohort = filteredData.filter((s) => s.Graduation_Year?.toString() === y);
        if (cohort.length === 0) return 0;
        const pl = cohort.filter((s) => s.Placement_Status === "Placed").length;
        return parseFloat(((pl / cohort.length) * 100).toFixed(1));
      });

      chartInstances.current.year = new ChartJS(chartYearRef.current, {
        type: "line",
        data: {
          labels: years,
          datasets: [
            {
              label: "Placement %",
              data: rates,
              borderColor: "#60a5fa",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              tension: 0.2,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: "#3b82f6",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              min: 40,
              max: 100,
              grid: { color: "#1e293b" },
              ticks: { callback: (v) => v + "%" },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    const currentInstances = chartInstances.current;
    return () => {
      Object.values(currentInstances).forEach((c) => c && c.destroy());
    };
  }, [filteredData, placedData]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedDept("ALL");
    setSelectedYear("ALL");
    setSelectedStatus("ALL");
  };

  const handleExportCsv = () => {
    if (!filteredData.length) return;
    const headers = Object.keys(filteredData[0]);
    const csvRows = [headers.join(",")];
    filteredData.forEach((row) => {
      const values = headers.map((h) => {
        const val = (row[h] || "").toString().replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placement_data_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const currentTableData = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredData, currentPage]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Placement &amp; Internship Intelligence
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            800 Students
          </span>
          <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            Batches 2023-2026
          </span>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            Export Filtered CSV
          </button>
        </div>
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-lg p-3.5 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          <div className="min-w-[200px] flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, student, role, location..."
              className="w-full bg-[#0a0e17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#0a0e17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Comm</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Civil Engineering">Civil</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#0a0e17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Batches</option>
            <option value="2023">Batch 2023</option>
            <option value="2024">Batch 2024</option>
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0a0e17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Placed">Placed Only</option>
            <option value="Unplaced">Unplaced Only</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{filteredData.length} records</span>
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-slate-400 hover:text-slate-200 border border-slate-700 hover:bg-slate-800 rounded text-xs transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 4 KPIs: Total, Placed, Rate, Avg Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111726] border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Students</div>
          <div className="text-2xl font-bold text-slate-100 my-1">{kpis.total}</div>
          <div className="text-[11px] text-slate-500">
            {kpis.total === 800 ? "Total enrolled cohort" : "Students in current filter"}
          </div>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Placed Students</div>
          <div className="text-2xl font-bold text-slate-100 my-1">{kpis.placedCount}</div>
          <div className="text-[11px] text-slate-500">Secured campus job offers</div>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Placement Rate</div>
          <div className="text-2xl font-bold text-emerald-400 my-1">{kpis.rate}%</div>
          <div className="text-[11px] text-slate-500">{kpis.placedCount} of {kpis.total} placed</div>
        </div>

        <div className="bg-[#111726] border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Average Salary</div>
          <div className="text-2xl font-bold text-blue-400 my-1">{kpis.avgSalary} LPA</div>
          <div className="text-[11px] text-slate-500">Max campus package: {kpis.maxSalary} LPA</div>
        </div>
      </div>

      {/* 3 Simple Charts: Rate by Dept, Avg Salary by Dept, Year Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col h-[300px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Placement Rate by Department
            </h3>
            <span className="text-[11px] text-slate-500">%</span>
          </div>
          <div className="flex-1 relative w-full">
            <canvas ref={chartDeptRef}></canvas>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col h-[300px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Average Salary by Department
            </h3>
            <span className="text-[11px] text-slate-500">CTC (LPA)</span>
          </div>
          <div className="flex-1 relative w-full">
            <canvas ref={chartSalaryDeptRef}></canvas>
          </div>
        </div>

        <div className="lg:col-span-12 bg-[#111726] border border-slate-800 rounded-lg p-5 flex flex-col h-[280px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Placement Trend by Graduation Year (2023 - 2026)
            </h3>
            <span className="text-[11px] text-slate-500">Cohort %</span>
          </div>
          <div className="flex-1 relative w-full">
            <canvas ref={chartYearRef}></canvas>
          </div>
        </div>
      </div>

      {/* 10-Column Student Placement Records Table */}
      <div className="bg-[#111726] border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Student Placement Records (10 Columns)
          </h3>
          <span className="text-[11px] text-slate-500">{filteredData.length} records in scope</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0a0e17] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-medium">ID</th>
                <th className="py-2.5 px-4 font-medium">Department</th>
                <th className="py-2.5 px-4 font-medium">Batch</th>
                <th className="py-2.5 px-4 font-medium">CGPA</th>
                <th className="py-2.5 px-4 font-medium">Internship</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Company</th>
                <th className="py-2.5 px-4 font-medium">Role</th>
                <th className="py-2.5 px-4 font-medium">Salary</th>
                <th className="py-2.5 px-4 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentTableData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                currentTableData.map((s) => {
                  const isPlaced = s.Placement_Status === "Placed";
                  return (
                    <tr key={s.Student_ID} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-blue-400">
                        {s.Student_ID}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{s.Department}</td>
                      <td className="py-2.5 px-4 text-slate-400">{s.Graduation_Year}</td>
                      <td className="py-2.5 px-4 text-slate-300 font-medium">{s.CGPA}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">
                          {s.Internship === "Yes" ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            isPlaced
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {s.Placement_Status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-200 font-medium">
                        {s.Company || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {s.Job_Role || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-200">
                        {isPlaced ? `${s.Salary_LPA} LPA` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">
                        {s.Location || <span className="text-slate-600">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {currentPage} of {totalPages} ({filteredData.length} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 rounded text-xs transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 rounded text-xs transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#111726] border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
          Key Placement Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#0a0e17] border border-slate-800 rounded-md">
            <strong className="block text-xs text-slate-200 mb-1">
              Internship Advantage (+34.1%)
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Students with prior internship experience achieve an 89.7% placement rate vs 55.6% for non-interns, commanding ₹2.83 LPA higher salary.
            </p>
          </div>
          <div className="p-3 bg-[#0a0e17] border border-slate-800 rounded-md">
            <strong className="block text-xs text-slate-200 mb-1">
              CSE &amp; IT Branch Performance
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Computer Science (85.4%) and Information Technology (84.4%) lead the campus in offer conversion rates.
            </p>
          </div>
          <div className="p-3 bg-[#0a0e17] border border-slate-800 rounded-md">
            <strong className="block text-xs text-slate-200 mb-1">
              Top Recruiter Concentration
            </strong>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              TCS, Accenture, Wipro, Infosys, and Deloitte represent over 50% of total campus job offers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
