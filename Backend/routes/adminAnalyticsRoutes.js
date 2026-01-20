import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAdminDashboard,
  getDailySales,
  getCategoryDistribution,
  getFinanceStats,
  getMonthlySales
} from "../controllers/adminAnalyticsController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/dashboard", authenticate, isAdmin, getAdminDashboard);
router.get("/daily-sales", authenticate, isAdmin, getDailySales);
router.get("/category-distribution", authenticate, isAdmin, getCategoryDistribution);
router.get("/finance-stats", authenticate, isAdmin, getFinanceStats);
router.get("/monthly-sales", authenticate, isAdmin, getMonthlySales);

export default router;