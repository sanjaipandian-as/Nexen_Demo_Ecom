import Support from "../models/Support.js";

// Create a new support ticket
export const createSupportTicket = async (req, res) => {
    try {
        const { name, email, phone, subject, category, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !category || !message) {
            return res.status(400).json({
                message: "Please provide all required fields: name, email, subject, category, and message"
            });
        }

        // Check if user is authenticated (optional)
        const customerId = req.user ? req.user._id : null;

        // Create support ticket
        const supportTicket = await Support.create({
            name,
            email,
            phone: phone || "",
            subject,
            category,
            message,
            customerId,
            status: "pending",
            priority: "medium"
        });

        res.status(201).json({
            message: "Support ticket created successfully! We'll get back to you within 24 hours.",
            ticket: {
                id: supportTicket._id,
                name: supportTicket.name,
                email: supportTicket.email,
                subject: supportTicket.subject,
                category: supportTicket.category,
                status: supportTicket.status,
                createdAt: supportTicket.createdAt
            }
        });

    } catch (err) {
        console.error("Error creating support ticket:", err);
        res.status(500).json({
            message: "Failed to create support ticket. Please try again later.",
            error: err.message
        });
    }
};

// Get all support tickets (for authenticated users)
export const getUserSupportTickets = async (req, res) => {
    try {
        const customerId = req.user._id;

        // Get user email from the authenticated user
        const userEmail = req.user.email;

        // Find tickets by customerId OR by email (for tickets created before login)
        const tickets = await Support.find({
            $or: [
                { customerId: customerId },
                { email: userEmail }
            ]
        })
            .sort({ createdAt: -1 })
            .select("-__v");

        res.json({
            message: "Support tickets retrieved successfully",
            count: tickets.length,
            tickets
        });

    } catch (err) {
        console.error("Error fetching support tickets:", err);
        res.status(500).json({
            message: "Failed to fetch support tickets",
            error: err.message
        });
    }
};

// Get a specific support ticket by ID
export const getSupportTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const customerId = req.user ? req.user._id : null;

        const ticket = await Support.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        // Check if user owns this ticket (if authenticated)
        if (customerId && ticket.customerId && ticket.customerId.toString() !== customerId.toString()) {
            return res.status(403).json({ message: "You don't have permission to view this ticket" });
        }

        res.json({
            message: "Support ticket retrieved successfully",
            ticket
        });

    } catch (err) {
        console.error("Error fetching support ticket:", err);
        res.status(500).json({
            message: "Failed to fetch support ticket",
            error: err.message
        });
    }
};

// Get all support tickets (Admin only)
export const getAllSupportTickets = async (req, res) => {
    try {
        const { status, category, priority, page = 1, limit = 20 } = req.query;

        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        const skip = (page - 1) * limit;

        const tickets = await Support.find(filter)
            .populate("customerId", "name email phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-__v");

        const total = await Support.countDocuments(filter);

        res.json({
            message: "Support tickets retrieved successfully",
            count: tickets.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            tickets
        });

    } catch (err) {
        console.error("Error fetching all support tickets:", err);
        res.status(500).json({
            message: "Failed to fetch support tickets",
            error: err.message
        });
    }
};

// Update support ticket status (Admin only)
export const updateSupportTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status, priority, adminResponse } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (adminResponse) {
            updateData.adminResponse = adminResponse;
            updateData.respondedAt = new Date();
        }

        const ticket = await Support.findByIdAndUpdate(
            ticketId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        res.json({
            message: "Support ticket updated successfully",
            ticket
        });

    } catch (err) {
        console.error("Error updating support ticket:", err);
        res.status(500).json({
            message: "Failed to update support ticket",
            error: err.message
        });
    }
};

// Delete support ticket (Admin only)
export const deleteSupportTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Support.findByIdAndDelete(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        res.json({
            message: "Support ticket deleted successfully",
            deletedTicket: {
                id: ticket._id,
                subject: ticket.subject
            }
        });

    } catch (err) {
        console.error("Error deleting support ticket:", err);
        res.status(500).json({
            message: "Failed to delete support ticket",
            error: err.message
        });
    }
};

// Get support statistics (Admin only)
export const getSupportStatistics = async (req, res) => {
    try {
        const totalTickets = await Support.countDocuments();
        const pendingTickets = await Support.countDocuments({ status: "pending" });
        const inProgressTickets = await Support.countDocuments({ status: "in-progress" });
        const resolvedTickets = await Support.countDocuments({ status: "resolved" });
        const closedTickets = await Support.countDocuments({ status: "closed" });

        // Get tickets by category
        const ticketsByCategory = await Support.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get tickets by priority
        const ticketsByPriority = await Support.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            message: "Support statistics retrieved successfully",
            statistics: {
                total: totalTickets,
                byStatus: {
                    pending: pendingTickets,
                    inProgress: inProgressTickets,
                    resolved: resolvedTickets,
                    closed: closedTickets
                },
                byCategory: ticketsByCategory,
                byPriority: ticketsByPriority
            }
        });

    } catch (err) {
        console.error("Error fetching support statistics:", err);
        res.status(500).json({
            message: "Failed to fetch support statistics",
            error: err.message
        });
    }
};
