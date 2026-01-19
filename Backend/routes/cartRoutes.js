import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
} from "../controllers/cartController.js";

const router = express.Router();

// /api/cart/add
router.post("/add", authenticate, addToCart);

// /api/cart
router.get("/", authenticate, getCart);

// /api/cart/update
router.put("/update", authenticate, updateCartItem);

// /api/cart/remove/:productId
router.delete("/remove/:productId", authenticate, removeCartItem);

export default router;

