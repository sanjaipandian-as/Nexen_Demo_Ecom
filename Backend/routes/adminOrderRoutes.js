import express from "express";
import { authenticate } from "../middleware/auth.js";

import {
  getAllOrders,
  getOrdersByStatus,
  adminUpdateOrderStatus,
  cancelOrder
} from "../controllers/adminOrderController.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", authenticate, isAdmin, getAllOrders);
router.get("/:status", authenticate, isAdmin, getOrdersByStatus);
router.put("/update/:orderId", authenticate, isAdmin, adminUpdateOrderStatus);
router.put("/:id", authenticate, isAdmin, adminUpdateOrderStatus); // Match frontend expectation
router.put("/cancel/:orderId", authenticate, isAdmin, cancelOrder);

export default router;