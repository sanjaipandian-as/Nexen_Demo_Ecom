import express from "express";
import {
  getAllProducts,
  getProductById,
  searchProducts,
  filterByCategory,
  getPaginatedProducts,
  filterProducts,
  getFilterOptions,
  getProductsBySeller
} from "../controllers/customerProductController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/product/:productId", getProductById);
router.get("/search", searchProducts);
router.get("/filter", filterProducts);
router.get("/filter-options", getFilterOptions);
router.get("/category/:category", filterByCategory);
router.get("/page", getPaginatedProducts);
router.get("/seller/:sellerId", getProductsBySeller);

export default router;
