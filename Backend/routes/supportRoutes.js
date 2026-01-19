import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
    createSupportTicket,
    getUserSupportTickets,
    getSupportTicketById,
    getAllSupportTickets,
    updateSupportTicketStatus,
    deleteSupportTicket,
    getSupportStatistics
} from "../controllers/supportController.js";

const router = express.Router();

// ⭐ Public Routes - Anyone can create a support ticket
router.post("/create", createSupportTicket);

// ⭐ Customer Routes - Authenticated users can view their tickets
router.get("/my-tickets", authenticate, getUserSupportTickets);
router.get("/ticket/:ticketId", getSupportTicketById);

// ⭐ Admin Routes - Admin can manage all tickets
router.get("/admin/all", authenticate, isAdmin, getAllSupportTickets);
router.get("/admin/statistics", authenticate, isAdmin, getSupportStatistics);
router.put("/admin/update/:ticketId", authenticate, isAdmin, updateSupportTicketStatus);
router.delete("/admin/delete/:ticketId", authenticate, isAdmin, deleteSupportTicket);

export default router;
