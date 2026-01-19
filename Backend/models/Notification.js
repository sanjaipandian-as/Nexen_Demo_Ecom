import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType", // Customer / Seller / Admin
      required: true,
      index: true,
    },

    userType: {
      type: String,
      enum: ["customer", "admin"], // Removed seller
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["order", "payment", "product", "system"],
      default: "system",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
