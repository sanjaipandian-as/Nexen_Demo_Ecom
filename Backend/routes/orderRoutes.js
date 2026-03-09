import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createOrder, getMyOrders, cancelOrder, returnOrder } from "../controllers/orderController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create order (Checkout)
router.post("/create", authenticate, createOrder);

// Get customer's orders
router.get("/", authenticate, getMyOrders);

// Cancel order
router.post("/cancel/:id", authenticate, upload.none(), cancelOrder);

// Return order
router.post("/return/:id", authenticate, upload.array('images', 5), returnOrder);

export default router;
