const fs = require("fs");
const path = require("path");
const analyticsRepository = require("../repositories/analytics.repository");
const mysql = require("../../../shared/utils/mysql");

const getSummary = async (userId) => {
  // 1. Fetch data in parallel from MongoDB
  const [statusCounts, domainCounts, applicationDates, avgScore] = await Promise.all([
    analyticsRepository.getApplicationStatusCounts(userId),
    analyticsRepository.getApplicationDomainCounts(userId),
    analyticsRepository.getApplicationDates(userId),
    analyticsRepository.getAverageMatchScore(userId),
  ]);

  // 2. Parse status counts into easy-to-use variables
  let totalApplications = 0;
  let offers = 0;
  let rejections = 0;
  let interviewing = 0;
  let oaScheduled = 0;
  let oaCompleted = 0;

  statusCounts.forEach((item) => {
    const count = item._count._all;
    totalApplications += count;

    if (item.status === "OFFER") {
      offers += count;
    } else if (item.status === "REJECTED") {
      rejections += count;
    } else if (item.status === "INTERVIEWING") {
      interviewing += count;
    } else if (item.status === "OA_SCHEDULED") {
      oaScheduled += count;
    } else if (item.status === "OA_COMPLETED") {
      oaCompleted += count;
    }
  });

  // 3. Calculate conversion rates with divide-by-zero protection
  const successRate = totalApplications > 0 ? Math.round((offers / totalApplications) * 100 * 10) / 10 : 0;
  const rejectionRate = totalApplications > 0 ? Math.round((rejections / totalApplications) * 100 * 10) / 10 : 0;

  // Interview conversion rate = (reached Interview or Offer) / total
  const interviewReached = interviewing + offers;
  const interviewConversionRate = totalApplications > 0 ? Math.round((interviewReached / totalApplications) * 100 * 10) / 10 : 0;

  // OA transition rate = (OA scheduled or completed or interviews or offers) / total
  const oaReached = oaScheduled + oaCompleted + interviewing + offers;
  const oaConversionRate = totalApplications > 0 ? Math.round((oaReached / totalApplications) * 100 * 10) / 10 : 0;

  // 4. Map domain breakdown
  const domainsBreakdown = domainCounts.map((item) => ({
    domain: item.domain,
    count: item._count._all,
  }));

  // 5. Build monthly trends
  const monthlyTrendsMap = {};
  applicationDates.forEach((app) => {
    const date = new Date(app.appliedDate);
    const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" });
    monthlyTrendsMap[monthKey] = (monthlyTrendsMap[monthKey] || 0) + 1;
  });

  const monthlyTrends = Object.entries(monthlyTrendsMap).map(([month, count]) => ({
    month,
    count,
  }));

  return {
    metrics: {
      totalApplications,
      offers,
      rejections,
      interviewing,
      successRate,
      rejectionRate,
      conversionRates: {
        oaConversionRate,
        interviewConversionRate,
      },
      skillReadinessScore: avgScore ? Math.round(avgScore * 10) / 10 : 0,
      domainsBreakdown,
      monthlyTrends,
    },
  };
};

let cachedRecords = null;

const loadPlacementRecordsFromCsv = () => {
  if (cachedRecords) return cachedRecords;
  try {
    const csvPath = path.resolve(__dirname, "../../../../../Placement & Internship Intelligence/Data/placement_data.csv");
    if (!fs.existsSync(csvPath)) return [];
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    const headers = lines[0].split(",").map((h) => h.trim());

    cachedRecords = lines.slice(1).map((line) => {
      const vals = [];
      let inQuotes = false;
      let buf = "";
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
          vals.push(buf.trim());
          buf = "";
        } else {
          buf += char;
        }
      }
      vals.push(buf.trim());
      const rec = {};
      headers.forEach((h, idx) => {
        rec[h] = vals[idx] || "";
      });
      return rec;
    });
    return cachedRecords;
  } catch (err) {
    console.error("Error reading placement CSV fallback:", err);
    return [];
  }
};

const getIntelligence = async (filters = {}) => {
  let records = [];

  try {
    // Attempt to query clean records from MySQL placement_records
    let sql = "SELECT * FROM placement_records WHERE 1=1";
    const params = [];

    if (filters.department && filters.department !== "ALL") {
      sql += " AND Department = ?";
      params.push(filters.department);
    }
    if (filters.year && filters.year !== "ALL") {
      sql += " AND Graduation_Year = ?";
      params.push(filters.year);
    }
    if (filters.status && filters.status !== "ALL") {
      sql += " AND Placement_Status = ?";
      params.push(filters.status);
    }
    if (filters.internship && filters.internship !== "ALL") {
      sql += " AND Internship = ?";
      params.push(filters.internship);
    }
    if (filters.role && filters.role !== "ALL") {
      sql += " AND Job_Role = ?";
      params.push(filters.role);
    }

    const rows = await mysql.query(sql, params);
    if (Array.isArray(rows) && rows.length > 0) {
      records = rows.map((r) => ({
        Student_ID: r.Student_ID,
        Department: r.Department,
        Graduation_Year: String(r.Graduation_Year),
        CGPA: String(r.CGPA),
        Internship: r.Internship,
        Placement_Status: r.Placement_Status,
        Company: r.Company || "",
        Job_Role: r.Job_Role || "",
        Salary_LPA: r.Salary_LPA !== null ? String(r.Salary_LPA) : "",
        Location: r.Location || "",
      }));
    } else if (Array.isArray(rows) && rows.length === 0 && Object.keys(filters).length === 0) {
      // Empty table, fallback to CSV
      records = loadPlacementRecordsFromCsv();
    }
  } catch {
    // Graceful fallback to CSV if MySQL query fails or connection is pending
    records = loadPlacementRecordsFromCsv().filter((r) => {
      if (filters.department && filters.department !== "ALL" && r.Department !== filters.department) return false;
      if (filters.year && filters.year !== "ALL" && r.Graduation_Year !== filters.year) return false;
      if (filters.status && filters.status !== "ALL" && r.Placement_Status !== filters.status) return false;
      if (filters.internship && filters.internship !== "ALL" && r.Internship !== filters.internship) return false;
      if (filters.role && filters.role !== "ALL" && r.Job_Role !== filters.role) return false;
      return true;
    });
  }

  const total = records.length;
  const placed = records.filter((r) => r.Placement_Status === "Placed");
  const placedCount = placed.length;
  const placementRate = total > 0 ? Math.round((placedCount / total) * 1000) / 10 : 0;

  const salaries = placed.map((r) => parseFloat(r.Salary_LPA)).filter((v) => !isNaN(v));
  const avgSalary = salaries.length > 0 ? Math.round((salaries.reduce((a, b) => a + b, 0) / salaries.length) * 100) / 100 : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;

  const interns = records.filter((r) => r.Internship === "Yes");
  const internRate = total > 0 ? Math.round((interns.length / total) * 1000) / 10 : 0;

  return {
    kpis: {
      total,
      placedCount,
      placementRate,
      avgSalary,
      maxSalary,
      internRate,
    },
    count: records.length,
    records: records.slice(0, 100),
  };
};

module.exports = {
  getSummary,
  getIntelligence,
};
