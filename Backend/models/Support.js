import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "general",
                "order",
                "product",
                "payment",
                "delivery",
                "return",
                "technical",
                "other"
            ],
            default: "general",
        },

        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved", "closed"],
            default: "pending",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            default: null,
        },

        adminResponse: {
            type: String,
            default: "",
        },

        respondedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for faster queries
supportSchema.index({ email: 1, createdAt: -1 });
supportSchema.index({ status: 1 });
supportSchema.index({ category: 1 });

export default mongoose.model("Support", supportSchema);
