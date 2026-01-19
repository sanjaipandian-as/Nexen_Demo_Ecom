import Notification from "../models/Notification.js";

export const sendNotification = async (userId, userType, title, message, type) => {
  try {
    await Notification.create({
      userId,
      userType,
      title,
      message,
      type
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
};
