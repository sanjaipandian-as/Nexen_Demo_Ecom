import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAdminDashboard,
  getDailySales
} from "../controllers/adminAnalyticsController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/dashboard", authenticate, isAdmin, getAdminDashboard);
router.get("/daily-sales", authenticate, isAdmin, getDailySales);

export default router;