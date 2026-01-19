import express from "express";
import { searchProducts, searchSuggestions } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", searchProducts);           // ?q=Crackers
router.get("/suggest", searchSuggestions); // ?q=Cr

export default router;
