import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/upload.js";

import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProductsCount,
} from "../controllers/adminProductController.js";

const router = express.Router();

// Create product (with image upload)
router.post("/", authenticate, isAdmin, upload.array("images", 5), createProduct);

// Get all products
router.get("/", authenticate, isAdmin, getAllProducts);

// Get products count
router.get("/count", authenticate, isAdmin, getAllProductsCount);

// Get product by ID
router.get("/:productId", authenticate, isAdmin, getProductById);

// Update product (with optional image upload)
router.put("/:productId", authenticate, isAdmin, upload.array("images", 5), updateProduct);

// Delete product (soft delete)
router.delete("/:productId", authenticate, isAdmin, deleteProduct);

export default router;
