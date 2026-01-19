import Notification from "../models/Notification.js";

/**
 * 1️⃣ Create Notification (Used internally by other modules)
 * 
 * Example usage:
 * createNotification({
 *    userId: seller._id,
 *    userType: "seller",
 *    title: "New Order",
 *    message: "You received a new order!",
 *    type: "order"
 * });
 */
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (err) {
    console.error("Notification Creation Error:", err.message);
  }
};


/**
 * 2️⃣ Get All Notifications for Logged-In User
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.role; // "customer" | "seller" | "admin"

    const notifications = await Notification.find({ userId, userType })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
      error: err.message
    });
  }
};


/**
 * 3️⃣ Mark Single Notification as Read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: err.message
    });
  }
};


/**
 * 4️⃣ Mark ALL Notifications as Read for Logged-In User
 */
export const markAllAsRead = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
      error: err.message
    });
  }
};
