const analyticsRepository = require("../repositories/analytics.repository");

const getSummary = async (userId) => {
  // 1. Fetch data in parallel
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
    const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" }); // e.g. "Jun 2026"
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

module.exports = {
  getSummary,
};
