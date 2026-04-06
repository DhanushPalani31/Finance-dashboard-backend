import express from "express";
import {
  getDashboardSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getRecentActivity,
  getWeeklyTrend,
  getAdminStats,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect); 

router.get("/summary", getDashboardSummary);
router.get("/recent", getRecentActivity);

router.get("/by-category", authorize("analyst", "admin"), getCategoryBreakdown);
router.get("/monthly-trend", authorize("analyst", "admin"), getMonthlyTrend);
router.get("/weekly-trend", authorize("analyst", "admin"), getWeeklyTrend);

router.get("/admin-stats", authorize("admin"), getAdminStats);

export default router;
