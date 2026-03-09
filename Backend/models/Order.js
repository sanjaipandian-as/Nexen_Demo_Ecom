import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },


    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      mobile: { type: String, required: true }
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "packed",
        "shipped",
        "delivered",
        "cancellation_requested",
        "cancelled",
        "return_requested",
        "return_approved",
        "return_rejected",
        "returned",
        "refund_initiated",
        "refunded"
      ],
      default: "pending_payment",
      index: true,
    },

    cancelReason: { type: String },
    returnReason: { type: String },
    cancellationDate: { type: Date },
    returnRequestDate: { type: Date },
    returnImages: [{ type: String }],

    refundDetails: {
      refundId: { type: String },
      refundAmount: { type: Number },
      refundStatus: { type: String, enum: ["pending", "processed", "failed"] },
      refundedAt: { type: Date }
    },

    refundAccountDetails: {
      accountType: { type: String, enum: ["upi", "bank"] },
      upiId: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      beneficiaryName: { type: String },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "online",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

// Pre-save middleware to ensure totalAmount is always calculated correctly
orderSchema.pre("save", async function () {
  if (this.isModified("items") || this.isNew || this.totalAmount === 0) {
    if (this.items && this.items.length > 0) {
      const calculatedTotal = this.items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 0));
      }, 0);

      // Only overwrite if it's 0 or we explicitly want to recalculate
      if (this.totalAmount === 0 || this.isModified("items")) {
        this.totalAmount = calculatedTotal;
      }
    }
  }
});

export default mongoose.model("Order", orderSchema);
