import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// ⭐ Customer-only Review Routes
router.post("/add", authenticate, addReview);
router.put("/update/:reviewId", authenticate, updateReview);
router.delete("/delete/:reviewId", authenticate, deleteReview);

// ⭐ Public — anyone can view product reviews
router.get("/:productId", getProductReviews);

export default router;
