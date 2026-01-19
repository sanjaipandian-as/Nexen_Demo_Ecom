import express from "express";
import { authenticate } from "../middleware/auth.js";
import { 
  createPaymentOrder, 
  verifyPayment, 
  paymentFailed 
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/order", authenticate, createPaymentOrder);
router.post("/verify", authenticate, verifyPayment);
router.post("/failed", authenticate, paymentFailed);

export default router;
