const analyticsService = require("../services/analytics.service");

const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await analyticsService.getSummary(userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
