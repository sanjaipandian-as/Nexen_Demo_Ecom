import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../controllers/wishlistController.js";

const router = express.Router();

// ⭐ Customer-only Wishlist Routes
router.post("/add", authenticate, addToWishlist);
router.delete("/remove/:productId", authenticate, removeFromWishlist);
router.get("/", authenticate, getWishlist);

export default router;
