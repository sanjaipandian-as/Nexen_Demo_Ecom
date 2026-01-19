import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from "../controllers/addressController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ⭐ Customer-only Address Routes
router.post("/", authenticate, addAddress);
router.get("/", authenticate, getAddresses);
router.put("/:addressId", authenticate, updateAddress);
router.delete("/:addressId", authenticate, deleteAddress);
router.put("/default/:addressId", authenticate, setDefaultAddress);

export default router;
