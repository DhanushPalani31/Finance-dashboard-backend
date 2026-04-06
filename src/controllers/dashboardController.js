import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";


export const getDashboardSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

   
    const totals = await Transaction.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = totals.find((t) => t._id === "income") || { total: 0, count: 0 };
    const expense = totals.find((t) => t._id === "expense") || { total: 0, count: 0 };

    const summary = {
      totalIncome: income.total,
      totalExpenses: expense.total,
      netBalance: income.total - expense.total,
      totalTransactions: income.count + expense.count,
    };

    return sendSuccess(res, 200, "Dashboard summary fetched.", summary);
  } catch (error) {
    next(error);
  }
};


export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;

    const match = { isDeleted: false };
    if (type) match.type = type;
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, "Category breakdown fetched.", breakdown);
  } catch (error) {
    next(error);
  }
};


export const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const trend = await Transaction.aggregate([
      { $match: { isDeleted: false, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, "Monthly trend fetched.", trend);
  } catch (error) {
    next(error);
  }
};


export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const recent = await Transaction.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);

    return sendSuccess(res, 200, "Recent activity fetched.", recent);
  } catch (error) {
    next(error);
  }
};


export const getWeeklyTrend = async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks) || 8;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const trend = await Transaction.aggregate([
      { $match: { isDeleted: false, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          week: "$_id.week",
          type: "$_id.type",
          total: 1,
          count: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, "Weekly trend fetched.", trend);
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, usersByRole, totalTransactions, deletedTransactions] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: "active" }),
        User.aggregate([
          { $group: { _id: "$role", count: { $sum: 1 } } },
          { $project: { role: "$_id", count: 1, _id: 0 } },
        ]),
        Transaction.countDocuments({ isDeleted: false }),
        Transaction.countDocuments({ isDeleted: true }),
      ]);

    return sendSuccess(res, 200, "Admin stats fetched.", {
      users: { total: totalUsers, active: activeUsers, inactive: totalUsers - activeUsers, byRole: usersByRole },
      transactions: { total: totalTransactions, deleted: deletedTransactions },
    });
  } catch (error) {
    next(error);
  }
};
