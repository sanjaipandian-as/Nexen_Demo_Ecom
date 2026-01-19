import express from "express";
import { authenticate } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// ⭐ GET ALL NOTIFICATIONS FOR LOGGED-IN USER
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      userType: req.role   // ⭐ FIXED (req.role is correct)
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ MARK SINGLE NOTIFICATION AS READ
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⭐ MARK ALL NOTIFICATIONS AS READ
router.put("/read-all", authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, userType: req.role },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
